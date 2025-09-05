import { Quiz } from "@/types"
import { UseQueryOptions } from "@tanstack/react-query"
import { supabase } from "../supabase"

export const  getQuizByStoryIdQueryOptions = (id: string): UseQueryOptions<
  unknown,
  Error,
  Quiz[] | undefined,
  ["quiz", string]
> => ({
  queryKey: ["quiz", id],
  queryFn: async () => {
    console.log('fetching quiz data............')
    const { data, error } = await supabase
      .from("questions")
      .select("*, answers(*)")
      .eq("story_id", id)
    console.log(data,error, ":quizzz")
    return data as Quiz[] | undefined
  }
})