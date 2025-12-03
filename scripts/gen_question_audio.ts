
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { supabase } from "./supabase";

const allQuestions = await supabase.from("questions").select("*");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tts-"));

async function fetchAudio(text: string, gender: string, lang: string, tempDir: string) {
    const url = `text-to-speech?text=${encodeURIComponent(text)}&lang=${lang}&gender=${gender}`;
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
let count = 0;
for await (const question of allQuestions.data || []) {
    const text = question.content;
    if (!text) continue;
   const temp = await fetchAudio(text, "female", "vi", tempDir);
   await new Promise(resolve => setTimeout(resolve, 3000));
   if(temp) {
    console.log("✔️ Saved:", temp);
    fs.unlinkSync(temp);
   }
   console.log(`Processed question: ${++count} / ${allQuestions.data?.length}`); 
}

count = 0;
const allResults = await supabase.from("answers").select("*");
for await (const result of allResults.data || []) {
    const text = result.content
    if (!text) continue;
    const temp = await fetchAudio(text, "female", "vi", tempDir);
    await new Promise(resolve => setTimeout(resolve, 3000));
    if(temp) {
        console.log("✔️ Saved:", temp);
        fs.unlinkSync(temp);
    }
    console.log(`Processed answer: ${++count} / ${allResults.data?.length}`); 
}