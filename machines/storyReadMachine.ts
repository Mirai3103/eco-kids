import { recalculateVector } from "@/lib/egde";
import { supabase } from "@/lib/supabase";
import type { StorySegment } from "@/types";
import { assign, fromPromise, setup } from "xstate";

export type StoryReadContext = {
  storyId: string;
  userId?: string;
  currentPage: number;
  isVietnamese: boolean;
  gender: "male" | "female";
  isAutoPlay: boolean;
  isMuted: boolean;
  isMenuVisible: boolean;
  storySegments: StorySegment[];
  imageUrls: string[];
  audioUrls: string[];
  error?: string;
};

export type StoryReadEvents =
  | { type: "PAGE_FLIPPED"; pageIndex: number }
  | { type: "TOGGLE_MENU" }
  | { type: "CLOSE_MENU" }
  | { type: "TOGGLE_LANGUAGE" }
  | { type: "TOGGLE_AUTOPLAY" }
  | { type: "TOGGLE_MUTE" }
  | { type: "RESTART" }
  | { type: "BACK" }
  | { type: "AUDIO_FINISHED" }
  | { type: "IMAGES_LOADED" }
  | { type: "RETRY" }

export const storyReadMachine = setup({
  types: {
    context: {} as StoryReadContext,
    events: {} as StoryReadEvents,
  },
  actors: {
    loadStorySegments: fromPromise(
      async ({ input }: { input: { storyId: string } }) => {
        const { data, error } = await supabase
          .from("story_segments")
          .select("*, audio_segments(*)")
          .eq("story_id", input.storyId)
          .order("segment_index", { ascending: true });

        if (error) {
          console.error("❌ Error loading story segments:", error);
          throw error;
        }
        console.log("✅ Loaded story segments:", data?.length);
        return data as unknown as StorySegment[];
      }
    ),
    logReadingProgress: fromPromise(
      async ({
        input,
      }: {
        input: {
          storyId: string;
          segmentId: string;
          userId: string;
        };
      }) => {
        const { error } = await supabase.rpc("log_reading_progress", {
          p_story_id: input.storyId,
          p_segment_id: input.segmentId,
          p_user_id: input.userId,
        });

        if (error) {
          console.error("❌ Error logging progress:", error);
          throw error;
        }

        // Recalculate vector in background
        recalculateVector({ userId: input.userId });
      }
    ),
    incrementViewCount: fromPromise(
      async ({ input }: { input: { storyId: string } }) => {
        const { error } = await supabase.rpc("increment_story_view", {
          story_id: input.storyId,
        });
        if (error) {
          console.error("⚠️ Error incrementing view:", error);
          // Don't throw - this is non-critical
        } else {
          console.log("✅ View count incremented");
        }
      }
    ),
  },
  actions: {
    updatePage: assign({
      currentPage: ({ event }) => {
        if (event.type === "PAGE_FLIPPED") {
          return event.pageIndex;
        }
        return 0;
      },
    }),
    toggleMenu: assign({
      isMenuVisible: ({ context }) => !context.isMenuVisible,
    }),
    closeMenu: assign({
      isMenuVisible: false,
    }),
    toggleLanguage: assign({
      isVietnamese: ({ context }) => !context.isVietnamese,
    }),
    toggleAutoPlay: assign({
      isAutoPlay: ({ context }) => !context.isAutoPlay,
    }),
    toggleMute: assign({
      isMuted: ({ context }) => !context.isMuted,
    }),
    restart: assign({
      currentPage: 0,
    }),
    setStorySegments: assign({
      storySegments: ({ event }: any) => {
        if (event.output) {
          console.log("✅ Setting story segments:", event.output.length);
          return event.output as StorySegment[];
        }
        console.log("⚠️ No story segments in event");
        return [];
      },
    }),
    computeUrls: assign({
      imageUrls: ({ context }) => {
        const urls = context.storySegments
          .map((segment) => segment.image_url)
          .filter(Boolean) as string[];
        console.log("📷 Computed image URLs:", urls.length);
        return urls;
      },
      audioUrls: ({ context }) => {
        const targetLang = context.isVietnamese ? "vi" : "en";
        const urls = context.storySegments.map((segment) => {
          const audioSegment = segment.audio_segments?.find(
            (audio) =>
              audio.language === targetLang && audio.gender === context.gender
          );
          return audioSegment?.audio_url || "";
        });
        console.log("🔊 Computed audio URLs:", urls.length);
        return urls;
      },
    }),
    updateAudioUrls: assign({
      audioUrls: ({ context }) => {
        const targetLang = context.isVietnamese ? "vi" : "en";
        return context.storySegments.map((segment) => {
          const audioSegment = segment.audio_segments?.find(
            (audio) =>
              audio.language === targetLang && audio.gender === context.gender
          );
          return audioSegment?.audio_url || "";
        });
      },
    }),
    setError: assign({
      error: () => "Failed to load story segments",
    }),
  },
  guards: {
    hasNextPage: ({ context }) => {
      return context.currentPage < context.storySegments.length - 1;
    },
    shouldPlayAudio: ({ context }) => {
      // Audio tự động phát nếu không mute (bất kể isAutoPlay)
      const enabled = !context.isMuted;
      console.log("🎮 Guard: shouldPlayAudio", {
        isMuted: context.isMuted,
        result: enabled,
      });
      return enabled;
    },
    shouldAutoFlip: ({ context }) => {
      // Auto-flip page chỉ khi isAutoPlay = true
      const enabled = context.isAutoPlay;
      console.log("🎮 Guard: shouldAutoFlip", {
        isAutoPlay: context.isAutoPlay,
        result: enabled,
      });
      return enabled;
    },
    shouldLogProgress: ({ context }) => {
      return !!context.userId;
    },
    isPageBeyondTwo: ({ context }) => {
      return context.currentPage >= 2;
    },
  },
}).createMachine({
  id: "storyRead",
  initial: "loading",
  context: ({ input }: any) => ({
    storyId: (input?.storyId as string) || "",
    userId: input?.userId as string | undefined,
    currentPage: 0,
    isVietnamese: (input?.isVietnamese as boolean) ?? true,
    gender: (input?.gender as "male" | "female") ?? "female",
    isAutoPlay: (input?.isAutoPlay as boolean) ?? true,
    isMuted: false,
    isMenuVisible: false,
    storySegments: [],
    imageUrls: [],
    audioUrls: [],
  }),
  states: {
    loading: {
      initial: "fetchingSegments",
      states: {
        fetchingSegments: {
          invoke: {
            src: "loadStorySegments",
            input: ({ context }) => ({ storyId: context.storyId }),
            onDone: {
              target: "incrementingView",
              actions: ["setStorySegments", "computeUrls"],
            },
            onError: {
              target: "#storyRead.error",
              actions: "setError",
            },
          },
        },
        incrementingView: {
          invoke: {
            src: "incrementViewCount",
            input: ({ context }) => ({ storyId: context.storyId }),
            onDone: {
              target: "preloadingImages",
            },
            onError: {
              // Continue even if view count fails
              target: "preloadingImages",
            },
          },
        },
        preloadingImages: {
          on: {
            IMAGES_LOADED: {
              target: "#storyRead.ready",
            },
          },
        },
      },
    },
    ready: {
      initial: "checkingAutoPlay",
      states: {
        idle: {
          on: {
            PAGE_FLIPPED: {
              target: "pageFlipped",
            },
          },
        },
        pageFlipped: {
          entry: "updatePage",
          always: [
            {
              target: "loggingProgress",
              guard: "shouldLogProgress",
            },
            {
              target: "checkingAutoPlay",
            },
          ],
        },
        loggingProgress: {
          invoke: {
            src: "logReadingProgress",
            input: ({ context }) => ({
              storyId: context.storyId,
              segmentId: context.storySegments[context.currentPage]?.id || "",
              userId: context.userId || "",
            }),
            onDone: {
              target: "checkingAutoPlay",
            },
            onError: {
              // Continue even if logging fails
              target: "checkingAutoPlay",
            },
          },
        },
        checkingAutoPlay: {
          entry: () => {
            console.log("🔍 Checking if should play audio...");
          },
          always: [
            {
              target: "playingAudio",
              guard: "shouldPlayAudio",
              actions: () => console.log("✅ Not muted → playingAudio"),
            },
            {
              target: "idle",
              actions: () => console.log("🔇 Muted → idle"),
            },
          ],
        },
        playingAudio: {
          on: {
            AUDIO_FINISHED: [
              {
                target: "idle",
                guard: { type: "hasNextPage" },
                // Will be handled by hook to flip page
              },
              {
                target: "idle",
              },
            ],
            PAGE_FLIPPED: {
              target: "pageFlipped",
            },
          },
        },
      },
      on: {
        TOGGLE_MENU: {
          actions: "toggleMenu",
        },
        CLOSE_MENU: {
          actions: "closeMenu",
        },
        TOGGLE_LANGUAGE: {
          actions: ["toggleLanguage", "closeMenu", "updateAudioUrls"],
        },
        TOGGLE_AUTOPLAY: {
          actions: ["toggleAutoPlay", "closeMenu"],
        },
        TOGGLE_MUTE: {
          actions: ["toggleMute", "closeMenu"],
        },
        RESTART: {
          actions: ["restart", "closeMenu"],
        },
        BACK: {
          target: "finished",
        },
      },
    },
    error: {
      on: {
        RETRY: {
          target: "loading",
        },
      },
    },
    finished: {
      type: "final",
    },
  },
});

