export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';

export type Resolution = '720p' | '1080p' | '4K';

export type FilterType = 
  | 'none' 
  | 'cinematic' 
  | 'cyberpunk' 
  | 'warm' 
  | 'mono' 
  | 'vintage' 
  | 'teal_orange' 
  | 'sunset' 
  | 'vibrant'
  | 'noir';

export type TransitionType = 
  | 'none' 
  | 'crossfade' 
  | 'slide_left' 
  | 'slide_right' 
  | 'zoom_in' 
  | 'zoom_out' 
  | 'flash_white' 
  | 'glitch';

export interface ClipAdjustments {
  brightness: number; // 0 to 2, default 1
  contrast: number;   // 0 to 2, default 1
  saturation: number; // 0 to 2, default 1
  exposure: number;   // -1 to 1, default 0
  vignette: number;   // 0 to 1, default 0
  blur: number;       // 0 to 20px, default 0
  glitch: number;     // 0 to 1, default 0
}

export interface VideoClip {
  id: string;
  type: 'video' | 'image' | 'procedural';
  title: string;
  src: string;
  thumbnail: string;
  start: number;         // Start time in timeline (seconds)
  duration: number;      // Duration on timeline (seconds)
  sourceStart: number;   // Trim in point (seconds)
  sourceDuration: number;// Original media duration (seconds)
  speed: number;         // 0.25 to 4.0
  volume: number;        // 0.0 to 2.0
  isMuted: boolean;
  filter: FilterType;
  adjustments: ClipAdjustments;
  transition: {
    type: TransitionType;
    duration: number; // seconds, usually 0.5s - 1.0s
  };
  transform: {
    x: number;       // offset percentage (-50 to 50)
    y: number;       // offset percentage (-50 to 50)
    scale: number;   // 0.5 to 3.0
    rotation: number;// degrees (-180 to 180)
    opacity: number; // 0.0 to 1.0
  };
  // Procedural generator scene key if generated
  proceduralTheme?: 'neon_city' | 'sunset_skate' | 'nature_drone' | 'tech_matrix' | 'abstract_glow';
}

export interface AudioClip {
  id: string;
  title: string;
  src: string;
  start: number;     // Start time in timeline
  duration: number;  // Duration on timeline
  volume: number;    // 0 to 2.0
  fadeIn: number;    // Fade in duration in seconds
  fadeOut: number;   // Fade out duration in seconds
  category: 'music' | 'sfx' | 'voiceover';
  waveform?: number[];
  audioBuffer?: AudioBuffer;
}

export interface TextOverlay {
  id: string;
  text: string;
  start: number;
  duration: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number;
  color: string;
  backgroundColor?: string;
  fontFamily: string;
  fontWeight: string;
  stylePreset: 'default' | 'neon' | 'subtitles' | 'badge' | 'cinematic';
  animation: 'none' | 'fade' | 'pop' | 'typewriter' | 'slide_up';
}

export interface StickerOverlay {
  id: string;
  emojiOrIcon: string;
  label: string;
  start: number;
  duration: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
}

export interface VideoProject {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  fps: number;
  resolution: Resolution;
  videoClips: VideoClip[];
  overlayClips: VideoClip[];
  audioClips: AudioClip[];
  textOverlays: TextOverlay[];
  stickers: StickerOverlay[];
  lastModified: number;
}
