import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the network layer and the vault; keep the zustand stores and ApiError real.
vi.mock("@/api/files", async (importActual) => {
  const actual = await importActual<typeof import("@/api/files")>();
  return {
    ...actual,
    uploadFile: vi.fn(),
    initMultipartUpload: vi.fn(),
    presignPart: vi.fn(),
    putPartToBucket: vi.fn(),
    multipartStatus: vi.fn(),
    completeMultipart: vi.fn(),
    abortMultipart: vi.fn(),
  };
});

vi.mock("@/lib/fileVault", () => ({
  putChunk: vi.fn(),
  putFile: vi.fn(),
  getChunk: vi.fn(async () => new Blob(["chunk"])),
  getFile: vi.fn(async () => new Blob(["file"])),
  deleteChunk: vi.fn(async () => {}),
  deleteAllFor: vi.fn(async () => {}),
  pruneExcept: vi.fn(async () => {}),
}));

vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/hooks/useUser", () => ({ useUser: () => ({ user: null }) }));

import * as files from "@/api/files";
import { ApiError } from "@/api/api-service";
import { useUploadQueue } from "@/hooks/useUploadQueue";
import { useUploadQueueStore, type QueueItem } from "@/store/uploadQueueStore";
import { useUploadsStore } from "@/store/uploadsStore";

const PART = files.PART_SIZE;

function seed(overrides: Partial<QueueItem>) {
  useUploadQueueStore.setState({
    items: [
      {
        id: "1",
        name: "f.bin",
        size: 2 * PART,
        type: "application/octet-stream",
        status: "queued",
        progress: 0,
        partSize: PART,
        partCount: 2,
        parts: [],
        ...overrides,
      } as QueueItem,
    ],
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  useUploadQueueStore.setState({ items: [] });
  useUploadsStore.setState({ uploads: [] });
});

describe("useUploadQueue runMultipart", () => {
  it("uploads every part then completes a fresh upload", async () => {
    vi.mocked(files.initMultipartUpload).mockResolvedValue({
      storage_key: "k_f.bin",
      upload_id: "u1",
      name: "f.bin",
      part_size: PART,
      part_count: 2,
    });
    vi.mocked(files.presignPart).mockResolvedValue("https://bucket/part");
    vi.mocked(files.putPartToBucket).mockReturnValue({
      promise: Promise.resolve({ etag: "e" }),
      abort: vi.fn(),
    });
    vi.mocked(files.completeMultipart).mockResolvedValue({
      storage_key: "k_f.bin",
      id: "k",
      name: "f.bin",
    });
    seed({});

    const { result } = renderHook(() => useUploadQueue());
    await act(async () => {
      await result.current.startUploads();
    });

    expect(useUploadQueueStore.getState().items[0].status).toBe("done");
    expect(files.presignPart).toHaveBeenCalledTimes(2);
    expect(files.completeMultipart).toHaveBeenCalledOnce();
    expect(useUploadsStore.getState().uploads[0]?.storageKey).toBe("k_f.bin");
  });

  it("resumes and skips already-confirmed parts", async () => {
    vi.mocked(files.multipartStatus).mockResolvedValue([
      { part_number: 1, etag: "e1" },
    ]);
    vi.mocked(files.presignPart).mockResolvedValue("https://bucket/part");
    vi.mocked(files.putPartToBucket).mockReturnValue({
      promise: Promise.resolve({ etag: "e2" }),
      abort: vi.fn(),
    });
    vi.mocked(files.completeMultipart).mockResolvedValue({
      storage_key: "k_f.bin",
      id: "k",
      name: "f.bin",
    });
    seed({ storageKey: "k_f.bin", uploadId: "u1", parts: [{ partNumber: 1, etag: "e1" }] });

    const { result } = renderHook(() => useUploadQueue());
    await act(async () => {
      await result.current.startUploads();
    });

    expect(files.initMultipartUpload).not.toHaveBeenCalled();
    expect(files.presignPart).toHaveBeenCalledTimes(1);
    expect(files.presignPart).toHaveBeenCalledWith("k_f.bin", "u1", 2);
    expect(useUploadQueueStore.getState().items[0].status).toBe("done");
  });

  it("surfaces an expired session on a 404", async () => {
    vi.mocked(files.multipartStatus).mockRejectedValue(new ApiError(404, "gone"));
    seed({ storageKey: "k_f.bin", uploadId: "u1", parts: [] });

    const { result } = renderHook(() => useUploadQueue());
    await act(async () => {
      await result.current.startUploads();
    });

    const item = useUploadQueueStore.getState().items[0];
    expect(item.status).toBe("error");
    expect(item.error).toMatch(/expired/i);
  });
});
