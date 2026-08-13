import { useEffect, useState } from "react";

// Anything reading a localStorage-backed store has to wait for the client,
// or the server and first client render disagree.
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
