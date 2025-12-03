import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { supabase } from "./supabase";

const langs = ["vi", "en"];
const genders = ["female", "male"];

async function fetchAudio(text: string, gender: string, lang: string, segmentId: string, tempDir: string) {
    const url = `text-to-speech?text=${encodeURIComponent(text)}&lang=${lang}&gender=${gender}&segmentId=${segmentId}`;
  const { data, error } = await supabase.functions.invoke(url, {
    method: "GET",
    headers: {
      accept: "audio/mpeg",
    },
  });

  if (error) {
    console.error("❌ Function failed:", error);
    return null;
  }

  const tempFile = path.join(tempDir, `${crypto.randomUUID()}.mp3`);
  fs.writeFileSync(tempFile, Buffer.from(data));  // data là ArrayBuffer

  return tempFile;
}

async function main() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tts-"));

  const { data: segments, error } = await supabase.from("story_segments").select("*");
  if (error) throw error;

  for await (const segment of segments ?? []) {
    const textMap: Record<string, string | null> = {
      vi: segment.vi_text,
      en: segment.en_text
    };

    for await (const lang of langs) {
      const text = textMap[lang];
      if (!text) continue;

      for await (const gender of genders) {
        console.log(`➡️ Generating ${lang}/${gender} for segment ${segment.id}`);

        const filePath = await fetchAudio(text, gender, lang, segment.id, tempDir);

        if (filePath) {
          console.log("✔️ Saved:", filePath);

          // xử lý / upload file tại đây
          // await uploadToSupabase(bucket, filePath)

          fs.unlinkSync(filePath);
        }

        // tránh spam function / giới hạn rate limit
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  }

  fs.rmdirSync(tempDir, { recursive: true });
  console.log("🔥 Done & cleaned up");
}

await main();
