import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { supabase } from "./supabase";

const langs = ["vi", "en"] as const;
const genders = ["female", "male"] as const;

async function checkCache(
  text: string,
  lang: string,
  gender: string,
  segmentId: string,
) {
  const url = `check-tts?text=${encodeURIComponent(text)}&lang=${lang}&gender=${gender}&segmentId=${segmentId}`;
  const { data, error } = await supabase.functions.invoke(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });
  if (error) throw error;
  return data as { isHit: boolean; url: string };
}

async function generateAudio(
  text: string,
  gender: string,
  lang: string,
  segmentId: string,
  tempDir: string,
) {
  const url = `text-to-speech?text=${encodeURIComponent(text)}&lang=${lang}&gender=${gender}&segmentId=${segmentId}`;
  const { data, error } = await supabase.functions.invoke(url, {
    method: "GET",
    headers: {
      accept: "audio/mpeg",
    },
  });

  if (error) {
    console.error("❌ Generate audio failed:", error);
    return null;
  }

  const tempFile = path.join(tempDir, `${crypto.randomUUID()}.mp3`);
  fs.writeFileSync(tempFile, Buffer.from(data));

  return tempFile;
}
function generateAudioUrl(
  text: string,
  gender: string,
  lang: string,
  segmentId: string,
  tempDir: string,
) {
  const url = `text-to-speech?text=${encodeURIComponent(text)}&lang=${lang}&gender=${gender}&segmentId=${segmentId}`;
  return "https://sggniqcffaupphqfevrp.supabase.co/functions/v1/" + url;
}

async function insertAudioSegment(
  audioUrl: string,
  gender: string,
  lang: string,
  segmentId: string,
) {
  const { data, error } = await supabase.from("audio_segments").insert({
    id: crypto.randomUUID(),
    audio_url: audioUrl,
    gender: gender,
    language: lang,
    segment_id: segmentId,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
  return data;
}

async function main() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tts-"));

  const { data: segments, error } = await supabase
    .from("story_segments")
    .select("*");
  if (error) throw error;

  for (const segment of segments ?? []) {
    for (const lang of langs) {
      const text = segment[lang === "vi" ? "vi_text" : "en_text"];
      if (!text) continue;

      for (const gender of genders) {
        console.log(
          `\n➡️ Processing ${lang}/${gender} for segment ${segment.id}`,
        );

        try {
          // 1. Check cache
          const cacheResult = await checkCache(text, lang, gender, segment.id);

          let audioUrl: string;

          if (cacheResult.isHit) {
            console.log("✅ Cache hit! Using existing URL");
            audioUrl = cacheResult.url;
          } else {
            console.log("⚠️ Cache miss. Generating new audio...");

            // 2. Generate audio
            const filePath = generateAudio(
              text,
              gender,
              lang,
              segment.id,
              tempDir,
            );

            if (!filePath) {
              console.error("❌ Failed to generate audio");
              continue;
            }

            console.log("✔️ Audio generated:", filePath);

            // 3. Upload to storage
            audioUrl = generateAudioUrl(
              text,
              gender,
              lang,
              segment.id,
              tempDir,
            )!;
            // console.log("☁️ Uploaded to storage:", audioUrl);

            // Clean up temp file
            fs.unlinkSync(filePath);
          }

          // 4. Insert into database
          await insertAudioSegment(audioUrl, gender, lang, segment.id);
          console.log("💾 Inserted into audio_segments table");
        } catch (err) {
          console.error(
            `❌ Error processing ${lang}/${gender} for segment ${segment.id}:`,
            err,
          );
          continue;
        }

        // Rate limit delay
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }

  // Clean up temp directory
  fs.rmdirSync(tempDir, { recursive: true });
  console.log("\n🔥 Done & cleaned up");
}

await main();
