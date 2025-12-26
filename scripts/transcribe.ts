import { v2 } from "@google-cloud/speech";
import axios from "axios";
import PQueue from "p-queue";
import { supabase } from "./supabase";

export interface WordTranscript {
	word: string;
	start: number;
	end: number;
}

const client = new v2.SpeechClient({
	keyFilename:
		"C:/Users/BaoBao/Downloads/optimal-carving-479507-u5-77756a6b304a.json",
});

// 🔹 limit concurrency (3–5 là đẹp)
const queue = new PQueue({
	concurrency: 3,
	intervalCap: 10, // tối đa 10 job
	interval: 1000, // mỗi 1 giây
});

function offsetToSeconds(offset?: {
	seconds?: string | number;
	nanos?: number;
}): number {
	if (!offset) return 0;
	return Number(offset.seconds ?? 0) + (offset.nanos ?? 0) / 1e9;
}

// 🔹 cache recognizer
let recognizerCache: string | null = null;
async function getRecognizer(): Promise<string> {
	if (recognizerCache) return recognizerCache;
	const projectId = await client.getProjectId();
	recognizerCache = `projects/${projectId}/locations/global/recognizers/_`;
	return recognizerCache;
}
function buildWordHints(text: string) {
  return text
    .replace(/[.,!?;:"'()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 200);
}

export async function transcribeV2(
	audioUrl: string,
  text: string
): Promise<WordTranscript[]> {
	const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
	const audioBytes = Buffer.from(res.data).toString("base64");
  const hints = buildWordHints(text);
	const recognizer = await getRecognizer();

	const [response] = await client.recognize({
  recognizer,
  config: {
    languageCodes: ["vi-VN"],
    model: "latest_short",
    autoDecodingConfig: {},
    features: {
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
    },

    adaptation: {
      phraseSets: [
        {
          inlinePhraseSet: {
            boost: 18,
            phrases: hints.map((v) => ({ value: v })),
          },
        },
      ],
    },
  },
  content: audioBytes,
});

	const words: WordTranscript[] = [];

	for (const result of response.results ?? []) {
		const alt = result.alternatives?.[0];
		for (const w of alt?.words ?? []) {
			words.push({
				word: w.word ?? "",
				start: offsetToSeconds(w.startOffset as any),
				end: offsetToSeconds(w.endOffset as any),
			});
		}
	}

	return words;
}

// ================== BATCH PROCESS ==================

const {
	data: audios,
	error,
	count,
} = await supabase
	.from("audio_segments")
	.select("id,audio_url, story_segments(*)")
	.eq("language", "vi")
	.is("transcript", null);

let i = 0;

if (error) {
	console.error(error);
	process.exit(1);
}

if (!audios?.length) {
	console.log("No audios to transcribe");
	process.exit(0);
}

for (const audio of audios) {
	queue.add(async () => {
		const audioUrl = audio.audio_url;
		if (!audioUrl) return;

		try {
			const words = await transcribeV2(audioUrl,audio.story_segments?.vi_text!);
      console.log(words, "words for audio", audio.story_segments?.vi_text);
			console.log(`Transcribed ${audio.id}: ${words.length} words`);

			const { error: updateError } = await supabase
				.from("audio_segments")
				.update({ transcript: JSON.stringify(words) })
				.eq("id", audio.id);

			if (updateError) {
				console.error(`Update failed ${audio.id}:`, updateError);
			}
		} catch (err) {
			console.error(`Error processing audio ${audio.id}:`, err);
		}
    finally {
      i++;
      console.log(`Progress: ${i} / ${count}`);
    }
	});
}

// ⏳ đợi queue chạy xong
await queue.onIdle();
console.log("🎉 All audios processed");
