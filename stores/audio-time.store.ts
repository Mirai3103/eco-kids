import { create } from "zustand";

export interface WordTranscript {
	word: string;
	start: number;
	end: number;
	aligned: boolean;
}

interface AudioTimeStore {
	words: WordTranscript[];
	setWords: (words: WordTranscript[]) => void;
	activeWordIndex: number;
	updateTime: (time: number) => void;
	setSegmentId: (segmentId: string) => void;
	segmentId: string;
}

function binarySearch(words: WordTranscript[], time: number): number {
	let lo = 0,
		hi = words.length - 1;
	while (lo <= hi) {
		const mid = (lo + hi) >>> 1;
		const w = words[mid];
		if (time < w.start) hi = mid - 1;
		else if (time > w.end) lo = mid + 1;
		else return mid;
	}
	return -1;
}
export const useAudioTimeStore = create<AudioTimeStore>((set, get) => ({
	words: [],
	segmentId: "",
	setSegmentId: (segmentId: string) => set({ segmentId }),
	setWords: (words: WordTranscript[]) => {
        console.log("Setting words", words);
		const sorted = [...words].sort((a, b) => a.start - b.start);

		set({ words: sorted });

	},
	activeWordIndex: 0,
	setActiveWordIndex: (activeWordIndex: number) => set({ activeWordIndex }),
	updateTime: (time: number) => {
	
		const index = binarySearch(get().words, time);
		if (index !== -1) {
			set({ activeWordIndex: index });
		}
	},
}));
