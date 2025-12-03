import { Database } from "@/types/database.types";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  
});

