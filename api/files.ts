import { apiService, getApiBaseUrl } from "./api-service";

export interface FileData {
  id: string;
  name: string;
  storage_key: string;
  size: number;
}

interface PresignUploadResponse {
  upload_url: string;
  storage_key: string;
  id: string;
  name: string;
  expires_in: number;
}

// Two-step upload: ask the backend for a presigned PUT URL, then send the
// bytes straight to the bucket. The file never passes through our server.
export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void,
): Promise<FileData> => {
  const contentType = file.type || "application/octet-stream";

  const presigned = await apiService.post<PresignUploadResponse>(
    "/files/presign-upload",
    {
      body: { name: file.name, size: file.size, content_type: contentType },
    },
  );

  await putToBucket(presigned.upload_url, file, contentType, onProgress);

  return {
    id: presigned.id,
    name: presigned.name,
    storage_key: presigned.storage_key,
    size: file.size,
  };
};

// Direct PUT to the presigned bucket URL. The Content-Type must match what
// the backend signed, or the bucket rejects the signature.
const putToBucket = (
  url: string,
  file: File,
  contentType: string,
  onProgress?: (progress: number) => void,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Upload failed")));

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
};

// Multipart (resumable) uploads. Part size matches the backend (R2 needs
// uniform parts); only files past the threshold take this path.
export const PART_SIZE = 8 * 1024 * 1024;
export const MULTIPART_THRESHOLD = 2 * PART_SIZE;

export interface MultipartInit {
  storage_key: string;
  upload_id: string;
  name: string;
  part_size: number;
  part_count: number;
}

export interface PartRecord {
  part_number: number;
  etag: string;
}

interface PresignPartResponse {
  url: string;
}

interface MultipartStatusResponse {
  parts: { part_number: number; etag: string; size: number }[];
}

interface MultipartCompleteResponse {
  storage_key: string;
  id: string;
  name: string;
}

export const initMultipartUpload = (
  name: string,
  size: number,
  contentType: string,
): Promise<MultipartInit> =>
  apiService.post<MultipartInit>("/uploads/multipart/init", {
    body: { name, size, content_type: contentType },
  });

export const presignPart = (
  storageKey: string,
  uploadId: string,
  partNumber: number,
): Promise<string> =>
  apiService
    .post<PresignPartResponse>("/uploads/multipart/part", {
      body: { storage_key: storageKey, upload_id: uploadId, part_number: partNumber },
    })
    .then((r) => r.url);

// What the bucket holds; the source of truth when resuming.
export const multipartStatus = (
  storageKey: string,
  uploadId: string,
): Promise<PartRecord[]> =>
  apiService
    .post<MultipartStatusResponse>("/uploads/multipart/status", {
      body: { storage_key: storageKey, upload_id: uploadId },
    })
    .then((r) =>
      (r.parts || []).map((p) => ({ part_number: p.part_number, etag: p.etag })),
    );

export const completeMultipart = (
  storageKey: string,
  uploadId: string,
  parts: PartRecord[],
): Promise<MultipartCompleteResponse> =>
  apiService.post<MultipartCompleteResponse>("/uploads/multipart/complete", {
    body: { storage_key: storageKey, upload_id: uploadId, parts },
  });

export const abortMultipart = (
  storageKey: string,
  uploadId: string,
): Promise<unknown> =>
  apiService.post("/uploads/multipart/abort", {
    body: { storage_key: storageKey, upload_id: uploadId },
  });

// Thrown when pause cancels a part PUT; not a failure.
export class UploadAbortedError extends Error {
  constructor() {
    super("Upload paused");
    this.name = "UploadAbortedError";
  }
}

export interface PartUploadHandle {
  promise: Promise<{ etag: string }>;
  abort: () => void;
}

// PUT one part to the bucket. Reports bytes sent and exposes abort for pause.
export const putPartToBucket = (
  url: string,
  blob: Blob,
  onBytes?: (loaded: number) => void,
): PartUploadHandle => {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<{ etag: string }>((resolve, reject) => {
    if (onBytes) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) onBytes(event.loaded);
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Upload failed (${xhr.status})`));
        return;
      }
      const etag = xhr.getResponseHeader("ETag");
      if (!etag) {
        // No ETag means the upload can't be completed later.
        reject(
          new Error(
            "The bucket didn't expose the part's ETag; check its CORS ExposeHeaders",
          ),
        );
        return;
      }
      resolve({ etag });
    });
    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new UploadAbortedError()));

    // No Content-Type: part presigns don't sign one, so a value would 403.
    xhr.open("PUT", url);
    xhr.send(blob);
  });

  return { promise, abort: () => xhr.abort() };
};

export const downloadFile = async (storageKey: string): Promise<void> => {
  const url = await getDownloadUrl(storageKey, true);
  triggerBrowserDownload(url, storageKey);
};

// A presigned URL is a plain link, so downloading is just clicking it.
export const triggerBrowserDownload = (url: string, storageKey: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = storageKey.split("_").slice(1).join("_");
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const getFileViewUrl = async (storageKey: string): Promise<string> => {
  return getDownloadUrl(storageKey, false);
};

const getDownloadUrl = async (
  storageKey: string,
  download: boolean,
): Promise<string> => {
  const query = download ? "?download=true" : "";
  const response = await fetch(
    `${getApiBaseUrl()}/files/${storageKey}${query}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to get download URL (${response.status})`);
  }

  const data = await response.json();
  return data.url;
};
