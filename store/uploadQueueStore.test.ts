import { describe, it, expect } from "vitest";
import {
  confirmedBytes,
  derivedProgress,
  useUploadQueueStore,
  type QueueItem,
} from "@/store/uploadQueueStore";

const item = (over: Partial<QueueItem> = {}): QueueItem => ({
  id: "1",
  name: "f",
  size: 1000,
  type: "application/octet-stream",
  status: "queued",
  progress: 0,
  ...over,
});

describe("confirmedBytes", () => {
  it("is 0 without multipart fields", () => {
    expect(confirmedBytes(item())).toBe(0);
  });

  it("counts confirmed parts", () => {
    const it2 = item({
      partSize: 300,
      parts: [
        { partNumber: 1, etag: "a" },
        { partNumber: 2, etag: "b" },
      ],
    });
    expect(confirmedBytes(it2)).toBe(600);
  });

  it("caps at the file size", () => {
    const it2 = item({
      size: 500,
      partSize: 300,
      parts: [
        { partNumber: 1, etag: "a" },
        { partNumber: 2, etag: "b" },
      ],
    });
    expect(confirmedBytes(it2)).toBe(500);
  });
});

describe("derivedProgress", () => {
  it("is 100 when done", () => {
    expect(derivedProgress(item({ status: "done" }))).toBe(100);
  });

  it("is 0 when the size is unknown", () => {
    expect(derivedProgress(item({ size: 0 }))).toBe(0);
  });

  it("clamps to 99 until done", () => {
    const it2 = item({
      size: 900,
      partSize: 300,
      parts: [
        { partNumber: 1, etag: "a" },
        { partNumber: 2, etag: "b" },
        { partNumber: 3, etag: "c" },
      ],
    });
    expect(derivedProgress(it2)).toBe(99);
  });
});

describe("resetInterrupted", () => {
  it("pauses multipart, requeues single-PUT, leaves the rest", () => {
    useUploadQueueStore.setState({
      items: [
        item({
          id: "mp",
          status: "uploading",
          uploadId: "u1",
          partSize: 300,
          parts: [{ partNumber: 1, etag: "a" }],
          size: 900,
        }),
        item({ id: "single", status: "uploading" }),
        item({ id: "done", status: "done" }),
        item({ id: "queued", status: "queued" }),
      ],
    });

    useUploadQueueStore.getState().resetInterrupted();

    const byId = Object.fromEntries(
      useUploadQueueStore.getState().items.map((i) => [i.id, i]),
    );
    expect(byId.mp.status).toBe("paused");
    expect(byId.single.status).toBe("queued");
    expect(byId.done.status).toBe("done");
    expect(byId.queued.status).toBe("queued");
  });
});
