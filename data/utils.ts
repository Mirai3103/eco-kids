import { Database } from "@/types";
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient<Database>(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_KEY!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

