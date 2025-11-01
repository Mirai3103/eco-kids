import { queryClient } from "./react-query";
import { supabase } from "./supabase";

export async function recalculateVector({ userId }: { userId: string }) {
  const { data, error } = await supabase.functions.invoke(
    "update_user_recommend_vector",
    {
      body: { user_id: userId },
    }
  );

  if (error) throw error;
  console.log(data);
  queryClient.refetchQueries({
    queryKey: ["recommended_stories", userId, 4],
  });
}
