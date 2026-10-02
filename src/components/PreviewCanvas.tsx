import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Maximize2, Volume2, VolumeX } from 'lucide-react';
import { VideoProject, TextOverlay, StickerOverlay } from '../types/editor';
import { renderFrame, getExportDimensions } from '../utils/videoExporter';
import { getAudioContext } from '../utils/audioGenerator';

interface PreviewCanvasProps {
  project: VideoProject;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onTogglePlay: () => void;
  totalDuration: number;
  onUpdateTextOverlay?: (overlay: TextOverlay) => void;
  onUpdateStickerOverlay?: (overlay: StickerOverlay) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  project,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onTogglePlay,
  totalDuration,
  onUpdateTextOverlay,
  onUpdateStickerOverlay,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isDraggingItemRef = useRef<{ type: 'text' | 'sticker'; id: string } | null>(null);

  // Video elements cache for user-uploaded videos
  const videoElementsRef = useRef<Map<string, HTMLVideoElement | HTMLImageElement>>(new Map());

  // Format time display: 00:04.12
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const frames = Math.floor((sec % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;
  };

  // Stop active synthetic audio sources
  const stopAudio = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // ignore already stopped
      }
    });
    activeSourcesRef.current = [];
  }, []);

  // Sync audio playback
  useEffect(() => {
    if (!isPlaying || isMuted) {
      stopAudio();
      return;
    }

    const audioCtx = getAudioContext();
    stopAudio();

    project.audioClips.forEach((clip) => {
      if (clip.audioBuffer && currentTime >= clip.start && currentTime < clip.start + clip.duration) {
        const offsetInClip = currentTime - clip.start;
        const source = audioCtx.createBufferSource();
        source.buffer = clip.audioBuffer;
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = clip.volume;
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const durationLeft = clip.duration - offsetInClip;
        source.start(0, offsetInClip, durationLeft);
        activeSourcesRef.current.push(source);
      }
    });

    return () => {
      stopAudio();
    };
  }, [isPlaying, isMuted, currentTime, project.audioClips, stopAudio]);

  // RequestAnimationFrame loop for video playback
  useEffect(() => {
    let animId: number;
    let lastStamp: number | null = null;

    const tick = (timestamp: number) => {
      if (lastStamp !== null && isPlaying) {
        const delta = (timestamp - lastStamp) / 1000;
        const newTime = currentTime + delta;
        if (newTime >= totalDuration) {
          onTimeUpdate(0);
          onTogglePlay();
        } else {
          onTimeUpdate(newTime);
        }
      }
      lastStamp = timestamp;
      if (isPlaying) {
        animId = requestAnimationFrame(tick);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(tick);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, currentTime, totalDuration, onTimeUpdate, onTogglePlay]);

  // Draw current frame to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderFrame(ctx, project, currentTime, canvas.width, canvas.height, videoElementsRef.current);
  }, [project, currentTime]);

  // Handle Dragging items directly on canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicked near a text overlay
    const hitText = project.textOverlays.find(
      (t) =>
        currentTime >= t.start &&
        currentTime < t.start + t.duration &&
        Math.abs(t.x - clickX) < 15 &&
        Math.abs(t.y - clickY) < 12
    );

    if (hitText) {
      isDraggingItemRef.current = { type: 'text', id: hitText.id };
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    // Check if clicked near a sticker
    const hitSticker = project.stickers.find(
      (s) =>
        currentTime >= s.start &&
        currentTime < s.start + s.duration &&
        Math.abs(s.x - clickX) < 15 &&
        Math.abs(s.y - clickY) < 12
    );

    if (hitSticker) {
      isDraggingItemRef.current = { type: 'sticker', id: hitSticker.id };
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingItemRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const curX = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const curY = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    if (isDraggingItemRef.current.type === 'text' && onUpdateTextOverlay) {
      const item = project.textOverlays.find((t) => t.id === isDraggingItemRef.current?.id);
      if (item) {
        onUpdateTextOverlay({ ...item, x: Math.round(curX), y: Math.round(curY) });
      }
    } else if (isDraggingItemRef.current.type === 'sticker' && onUpdateStickerOverlay) {
      const item = project.stickers.find((s) => s.id === isDraggingItemRef.current?.id);
      if (item) {
        onUpdateStickerOverlay({ ...item, x: Math.round(curX), y: Math.round(curY) });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingItemRef.current && canvasRef.current) {
      try {
        canvasRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      isDraggingItemRef.current = null;
    }
  };

  // Step 1 frame (1/30 sec)
  const stepFrame = (dir: -1 | 1) => {
    const nextTime = Math.max(0, Math.min(totalDuration, currentTime + dir * (1 / 30)));
    onTimeUpdate(nextTime);
  };

  // Aspect ratio css styles
  const getContainerAspect = () => {
    switch (project.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[380px] sm:max-h-[460px]';
      case '16:9':
        return 'aspect-[16/9] w-full max-w-[560px] max-h-[340px]';
      case '1:1':
        return 'aspect-square max-h-[360px]';
      case '4:5':
        return 'aspect-[4/5] max-h-[380px]';
      default:
        return 'aspect-[9/16] max-h-[380px]';
    }
  };

  const dimensions = getExportDimensions(project.aspectRatio, '720p');

  return (
    <div
      ref={containerRef}
      className="relative flex-1 bg-[#07080c] flex flex-col items-center justify-center p-2 sm:p-3 overflow-hidden"
    >
      {/* Canvas Wrapper */}
      <div
        className={`relative ${getContainerAspect()} bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 flex items-center justify-center group`}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={(e) => {
            // Click to toggle play if not dragging
            if (!isDraggingItemRef.current) {
              onTogglePlay();
            }
          }}
          className="w-full h-full object-contain cursor-pointer touch-none"
        />

        {/* Center Play Button Overlay on Hover/Paused */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="absolute inset-0 m-auto w-14 h-14 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform active:scale-90"
            title="Reproducir"
          >
            <Play className="w-6 h-6 fill-white translate-x-0.5" />
          </button>
        )}

        {/* Top Floating Badge: Aspect Ratio & Quality */}
        <div className="absolute top-2.5 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-slate-300 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{project.aspectRatio}</span>
          <span className="text-slate-500">·</span>
          <span>{project.fps} FPS</span>
        </div>

        {/* Quick audio toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          className="absolute top-2.5 right-3 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-colors"
          title={isMuted ? 'Activar sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Hint to drag elements */}
        <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
            Toca el texto o sticker para moverlo
          </span>
        </div>
      </div>

      {/* Floating Transport Bar under Canvas */}
      <div className="w-full max-w-sm mt-2 flex items-center justify-between px-3 py-1 bg-slate-900/90 border border-slate-800/80 rounded-xl backdrop-blur-md text-xs select-none">
        {/* Timecode display */}
        <div className="font-['JetBrains_Mono'] text-[11px] font-medium text-slate-300 flex items-center gap-1">
          <span className="text-indigo-400">{formatTimecode(currentTime)}</span>
          <span className="text-slate-500">/</span>
          <span>{formatTimecode(totalDuration)}</span>
        </div>

        {/* Transport controls */}
        <div className="flex items-center gap-1">
          {/* Jump to start */}
          <button
            onClick={() => onTimeUpdate(0)}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            title="Ir al inicio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* -1 Frame */}
          <button
            onClick={() => stepFrame(-1)}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            title="-1 Fotograma"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center transition-colors font-semibold"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
          </button>

          {/* +1 Frame */}
          <button
            onClick={() => stepFrame(1)}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            title="+1 Fotograma"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Fullscreen request */}
        <button
          onClick={() => {
            if (canvasRef.current && canvasRef.current.requestFullscreen) {
              canvasRef.current.requestFullscreen();
            }
          }}
          className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          title="Pantalla completa"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
