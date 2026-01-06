import { supabase } from "./supabase";

const { data, error } = await supabase.storage.from("audio").list("", {
  limit: 1,
  sortBy: { column: "updated_at", order: "desc" },
});

if (error) throw error;

const latestFile = data?.[0];
console.log(latestFile.created_at);
