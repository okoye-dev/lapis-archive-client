import { apiService, getApiBaseUrl } from "./api-service";

export interface FileData {
  id: string;
  name: string;
  storage_key: string;
  size: number;
}

interface FilesResponse {
  files: FileData[];
}

interface PresignUploadResponse {
  upload_url: string;
  storage_key: string;
  id: string;
  name: string;
  expires_in: number;
}

export const getFiles = async (): Promise<FileData[]> => {
  const response = await apiService.get<FilesResponse>("/files");
  return response.files || [];
};

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
