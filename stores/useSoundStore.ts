// src/stores/useSoundStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioSource
} from 'expo-audio';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SoundType = 'theme' | 'ui' | 'other' | string;

export type SoundConfig = {
  volume?: number;               // 0..1
  loop?: boolean;                // lặp
  rate?: number;                 // playback rate
  pitchCorrectionQuality?: 'low' | 'medium' | 'high';
};

export type RegisterSound = {
  key: string;                   // unique
  source: AudioSource;           // require(...) hoặc { uri, headers }
  type?: SoundType;              // default 'other'
  config?: SoundConfig;
};

type SoundMeta = {
  key: string;
  type: SoundType;
  baseVolume: number;            // lưu volume config
  loop: boolean;
  rate?: number;
  pitchCorrectionQuality?: 'low' | 'medium' | 'high';
};

// Không persist các player (native handle)
const players: Record<string, AudioPlayer> = {};
const metas: Record<string, SoundMeta> = {};

type State = {
  // Settings
  globalEnabled: boolean;
  typeEnabled: Record<string, boolean>; // per type

  // Lifecycle
  isReady: boolean;
  init: () => Promise<void>;
  unloadAll: () => Promise<void>;

  // Registry
  register: (s: RegisterSound) => void;
  unregister: (key: string) => void;
  clearRegistry: () => void;

  // Control
  play: (key: string) => void;
  pause: (key: string) => void;
  stop: (key: string) => void;       // seekTo(0) và pause
  setVolume: (key: string, v: number) => void;
  setTypeEnabled: (type: SoundType, enabled: boolean) => void;
  setGlobalEnabled: (enabled: boolean) => void;
  updateConfig: (key: string, cfg: SoundConfig) => void;
};

export const useSoundStore = create<State>()(
  persist(
    (set, get) => ({
      globalEnabled: true,
      typeEnabled: {}, // ví dụ { ui: true, theme: false }
      isReady: false,

      init: async () => {
        if (get().isReady) return;
        await setAudioModeAsync({
          playsInSilentMode: true, // đổi false nếu muốn tôn trọng silent switch
          interruptionMode: 'duckOthers',
          interruptionModeAndroid: 'duckOthers',
          shouldPlayInBackground: false,
          shouldRouteThroughEarpiece: false,
          allowsRecording: false,
        });
        set({ isReady: true });
      },

      unloadAll: async () => {
        Object.values(players).forEach(p => { try { p.pause(); } catch {} });

        Object.values(players).forEach(p => { try { p.remove(); } catch {} });
        Object.keys(players).forEach(k => delete players[k]);
        Object.keys(metas).forEach(k => delete metas[k]);
        set({ isReady: false });
      },

      register: ({ key, source, type = 'other', config }: RegisterSound) => {
        // nếu đã có -> bỏ cũ
        if (players[key]) { try { players[key].remove(); } catch {} }
        const p = createAudioPlayer(source);
        players[key] = p;

        // meta mặc định
        metas[key] = {
          key,
          type,
          baseVolume: config?.volume ?? 1,
          loop: !!config?.loop,
          rate: config?.rate,
          pitchCorrectionQuality: config?.pitchCorrectionQuality,
        };

        // áp config lên player
        try {
          if (config?.loop !== undefined) (p as any).loop = !!config.loop;
          if (config?.volume !== undefined) (p as any).volume = clamp01(config.volume);
          if (config?.rate !== undefined)
            (p as any).setPlaybackRate(config.rate, config.pitchCorrectionQuality);
          p.seekTo(0); // “kích” load & để sẵn ở đầu
        } catch {}
      },

      unregister: (key: string) => {
        const p = players[key];
        if (p) { try { p.remove(); } catch {} }
        delete players[key];
        delete metas[key];
      },

      clearRegistry: () => {
        Object.keys(players).forEach(k => {
          try { players[k].remove(); } catch {}
          delete players[k];
          delete metas[k];
        });
      },

      play: (key: string) => {
        const { globalEnabled, typeEnabled } = get();
        if (!globalEnabled) return;
        const p = players[key]; const m = metas[key];
        if (!p || !m) return;
        if (typeEnabled[m.type] === false) return;

        try {
          // expo-audio KHÔNG auto reset → tự seek về đầu trước khi play
          p.seekTo(0);
          p.play();
        } catch {}
      },

      pause: (key: string) => {
        const p = players[key];
        if (!p) return;
        try { p.pause(); } catch {}
      },

      stop: (key: string) => {
        const p = players[key];
        if (!p) return;
        try { p.pause(); p.seekTo(0); } catch {}
      },

      setVolume: (key: string, v: number) => {
        const p = players[key]; const m = metas[key];
        if (!p || !m) return;
        m.baseVolume = clamp01(v);
        try { (p as any).volume = m.baseVolume; } catch {}
      },

      setTypeEnabled: (type: SoundType, enabled: boolean) => {
        set(s => ({ typeEnabled: { ...s.typeEnabled, [type]: enabled } }));
      },

      setGlobalEnabled: (enabled: boolean) => set({ globalEnabled: enabled }),

      updateConfig: (key, cfg) => {
        const p = players[key]; const m = metas[key];
        if (!p || !m) return;
        if (cfg.volume !== undefined) { m.baseVolume = clamp01(cfg.volume); (p as any).volume = m.baseVolume; }
        if (cfg.loop !== undefined)   { m.loop = !!cfg.loop; (p as any).loop = m.loop; }
        if (cfg.rate !== undefined)   { m.rate = cfg.rate; (p as any).setPlaybackRate(cfg.rate, cfg.pitchCorrectionQuality ?? m.pitchCorrectionQuality); }
        if (cfg.pitchCorrectionQuality) m.pitchCorrectionQuality = cfg.pitchCorrectionQuality;
      },
    }),
    {
      name: 'sound-settings-v1',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist chỉ **setting**, không persist registry / player
      partialize: (s) => ({ globalEnabled: s.globalEnabled, typeEnabled: s.typeEnabled }),
      version: 1,
    }
  )
);

// helper
function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
