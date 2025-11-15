import { supabase } from "@/lib/supabase";
import * as Sentry from '@sentry/react-native';
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
export default function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      Sentry.captureMessage("Session loaded" + JSON.stringify(session));
      if (error) {
        Sentry.captureException(error);
      }
      setSession(session);
      setIsLoading(false);
    }
    getSession();
  }, []);
  return { session, isLoading };
}
