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

export const getFiles = async (): Promise<FileData[]> => {
  const response = await apiService.get<FilesResponse>("/files");
  return response.files || [];
};

export const uploadFiles = async (
  formData: FormData, 
  onProgress?: (progress: number) => void
): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (err) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });
    
    xhr.open('POST', `${getApiBaseUrl()}/files`);
    xhr.send(formData);
  });
};

export const downloadFile = async (fileName: string): Promise<void> => {
  const response = await fetch(`${getApiBaseUrl()}/files/${fileName}?download=true`);
  
  if (!response.ok) {
    throw new Error(`Failed to get download URL: ${response.statusText}`);
  }
  
  const data = await response.json();
  const downloadUrl = data.url;
  
  // Use presigned URL directly for download
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fileName.split('_').slice(1).join('_'); // Remove UUID prefix for filename
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const getFileViewUrl = async (fileName: string): Promise<string> => {
  const response = await fetch(`${getApiBaseUrl()}/files/${fileName}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get view URL: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.url;
};
