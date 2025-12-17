import { useUserStore } from "@/stores/user.store";
import { useEffect } from "react";

/**
 * Hook to access global session state from user store
 * This ensures all components share the same session state
 */
export default function useSession() {
  const session = useUserStore((state) => state.session);
  const isLoading = useUserStore((state) => state.isLoadingSession);
  const initSession = useUserStore((state) => state.initSession);

  useEffect(() => {
    // Initialize session only once when the hook is first used
    if (isLoading && !session) {
      initSession();
    }
  }, []);

  return { session, isLoading };
}
