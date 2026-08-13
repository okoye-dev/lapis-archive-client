// A File handle can't survive a reload, so the bytes are parked in IndexedDB
// (Blobs are structured-cloneable, localStorage entries are not) and dropped
// the moment the bucket confirms the upload.
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

// Anything not referenced by the queue any more is dead weight on the user's
// disk, so sweeping on load keeps the vault from growing without bound.
export async function pruneExcept(keepIds: string[]): Promise<void> {
  try {
    const keys = await tx<IDBValidKey[]>("readonly", (store) =>
      store.getAllKeys(),
    );
    const keep = new Set(keepIds);
    await Promise.all(
      keys
        .filter((key) => typeof key === "string" && !keep.has(key))
        .map((key) => deleteFile(key as string)),
    );
  } catch {
    // Vault unavailable (private mode, quota). Nothing to clean.
  }
}
