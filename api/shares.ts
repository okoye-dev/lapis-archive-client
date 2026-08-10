import { apiService } from "./api-service";

export interface CreateShareInput {
  storageKey: string;
  ownerEmail?: string;
  recipientEmail?: string;
  ttlHours?: number;
}

export interface CreatedShare {
  slug: string;
  code: string;
  fileName: string;
  fileSize: number;
  expiresAt: string;
}

export interface ShareMeta {
  slug: string;
  fileName: string;
  fileSize: number;
  expiresAt: string;
  expired: boolean;
}

export interface UnlockedShare {
  url: string;
  expiresIn: number;
  fileName: string;
  fileSize: number;
}

interface CreateShareResponseBody {
  slug: string;
  code: string;
  file_name: string;
  file_size: number;
  expires_at: string;
}

interface ShareMetaResponseBody {
  slug: string;
  file_name: string;
  file_size: number;
  expires_at: string;
  expired: boolean;
}

interface UnlockResponseBody {
  url: string;
  expires_in: number;
  file_name: string;
  file_size: number;
}

export const createShare = async (
  input: CreateShareInput,
): Promise<CreatedShare> => {
  const body = await apiService.post<CreateShareResponseBody>("/shares", {
    body: {
      storage_key: input.storageKey,
      owner_email: input.ownerEmail,
      recipient_email: input.recipientEmail,
      ttl_hours: input.ttlHours,
    },
  });

  return {
    slug: body.slug,
    code: body.code,
    fileName: body.file_name,
    fileSize: body.file_size,
    expiresAt: body.expires_at,
  };
};

export const getShare = async (slug: string): Promise<ShareMeta> => {
  const body = await apiService.get<ShareMetaResponseBody>("/shares/:slug", {
    params: { slug },
  });

  return {
    slug: body.slug,
    fileName: body.file_name,
    fileSize: body.file_size,
    expiresAt: body.expires_at,
    expired: body.expired,
  };
};

export const unlockShare = async (
  slug: string,
  code: string,
  download = true,
): Promise<UnlockedShare> => {
  const body = await apiService.post<UnlockResponseBody>(
    "/shares/:slug/unlock",
    {
      params: { slug },
      body: { code, download },
    },
  );

  return {
    url: body.url,
    expiresIn: body.expires_in,
    fileName: body.file_name,
    fileSize: body.file_size,
  };
};
