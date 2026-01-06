import crypto from "crypto";
import { supabase } from "./supabase";

async function isHit(
  text: string,
  lang: string,
  gender: string,
  segmentId: string,
) {
  const url = `check-tts?text=${encodeURIComponent(text)}&lang=${lang}&gender=${gender}&segmentId=${segmentId}`;
  const { data, error } = await supabase.functions.invoke(url, {
    method: "GET",
    headers: {
      accept: "audio/mpeg",
    },
  });
  if (error) throw error;
  return data as { isHit: boolean; url: string };
}

const langs = ["vi", "en"];
const genders = ["female", "male"];
const { data: segments, error } = await supabase
  .from("story_segments")
  .select("*");
if (error) throw error;
for await (const segment of segments ?? []) {
  for await (const lang of langs) {
    for await (const gender of genders) {
      const text = segment[lang === "vi" ? "vi_text" : "en_text"];
      if (!text) continue;
      const res = await isHit(text, lang, gender, segment.id);
      console.log(res);
      if (res.isHit) {
        const audioUrl = res.url;
        const { data, error } = await supabase.from("audio_segments").upsert(
          {
            id: crypto.randomUUID(),
            segment_id: segment.id,
            gender: gender,
            language: lang,
            audio_url: audioUrl,
            created_at: new Date().toISOString(),
          },
          {
            onConflict: "segment_id,gender,language",
          },
        );

        if (error) console.error(error);
      }
    }
  }
}
