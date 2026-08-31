import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const stageFiles = vi.fn();

vi.mock("@/hooks/useUploadQueue", () => ({
  useUploadQueue: () => ({
    queue: [],
    waiting: 0,
    uploading: false,
    stageFiles,
    startUploads: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    discard: vi.fn(),
    clearDone: vi.fn(),
  }),
  MAX_UPLOAD_BYTES: 512 * 1024 * 1024,
}));

vi.mock("@/hooks/useHasMounted", () => ({ useHasMounted: () => true }));

import UploadPanel from "@/components/dashboard/UploadPanel";

function dropzone() {
  return screen.getByText(/pick the files/i).closest("div") as HTMLElement;
}

describe("UploadPanel drag and drop", () => {
  beforeEach(() => stageFiles.mockClear());

  it("stages files dropped onto the dropzone", () => {
    render(<UploadPanel />);
    const file = new File(["hi"], "photo.png", { type: "image/png" });
    fireEvent.drop(dropzone(), { dataTransfer: { files: [file] } });
    expect(stageFiles).toHaveBeenCalledWith([file]);
  });

  it("shows the drop prompt while dragging over, and clears it on leave", () => {
    render(<UploadPanel />);
    const zone = dropzone();
    fireEvent.dragOver(zone);
    expect(screen.getByText(/drop to add them/i)).toBeTruthy();
    fireEvent.dragLeave(zone, { relatedTarget: document.body });
    expect(screen.getByText(/pick the files/i)).toBeTruthy();
  });

  it("ignores an empty drop", () => {
    render(<UploadPanel />);
    fireEvent.drop(dropzone(), { dataTransfer: { files: [] } });
    expect(stageFiles).not.toHaveBeenCalled();
  });
});
