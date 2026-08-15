// A File can't survive a reload, so queued bytes live in IndexedDB until the
// bucket confirms the upload.
const DB_NAME = "lapis-upload-vault";
const STORE = "files";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = run(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

export async function putFile(id: string, file: File): Promise<void> {
  await tx("readwrite", (store) => store.put(file, id));
}

export async function getFile(id: string): Promise<File | undefined> {
  try {
    return await tx<File | undefined>("readonly", (store) => store.get(id));
  } catch {
    return undefined;
  }
}

export async function deleteFile(id: string): Promise<void> {
  try {
    await tx("readwrite", (store) => store.delete(id));
  } catch {
    // Already gone.
  }
}

// One blob per part, so each chunk is freed as soon as the bucket has it.
const chunkKey = (id: string, part: number) => `${id}:part:${part}`;
const baseId = (key: string) => key.split(":part:")[0];

export async function putChunk(id: string, part: number, blob: Blob): Promise<void> {
  await tx("readwrite", (store) => store.put(blob, chunkKey(id, part)));
}

export async function getChunk(id: string, part: number): Promise<Blob | undefined> {
  try {
    return await tx<Blob | undefined>("readonly", (store) => store.get(chunkKey(id, part)));
  } catch {
    return undefined;
  }
}

export async function deleteChunk(id: string, part: number): Promise<void> {
  try {
    await tx("readwrite", (store) => store.delete(chunkKey(id, part)));
  } catch {
    // Already gone.
  }
}

// Removes the whole-file blob and every chunk belonging to id.
export async function deleteAllFor(id: string): Promise<void> {
  try {
    const keys = await tx<IDBValidKey[]>("readonly", (store) => store.getAllKeys());
    await Promise.all(
      keys
        .filter((key) => typeof key === "string" && baseId(key as string) === id)
        .map((key) => tx("readwrite", (store) => store.delete(key))),
    );
  } catch {
    // Vault unavailable; nothing to clean.
  }
}

// Drops any stored bytes no longer referenced by the queue (chunk keys count
// under their parent id).
export async function pruneExcept(keepIds: string[]): Promise<void> {
  try {
    const keys = await tx<IDBValidKey[]>("readonly", (store) =>
      store.getAllKeys(),
    );
    const keep = new Set(keepIds);
    await Promise.all(
      keys
        .filter((key) => typeof key === "string" && !keep.has(baseId(key as string)))
        .map((key) => tx("readwrite", (store) => store.delete(key))),
    );
  } catch {
    // Vault unavailable (private mode, quota). Nothing to clean.
  }
}
