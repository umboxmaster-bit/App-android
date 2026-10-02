import React, { useRef, useState } from 'react';
import { 
  Scissors, 
  Trash2, 
  Copy, 
  Sparkles, 
  Gauge, 
  Volume2, 
  ZoomIn, 
  ZoomOut,
  Type,
  Music,
  Smile,
  Layers
} from 'lucide-react';
import { VideoProject, VideoClip, AudioClip, TextOverlay, StickerOverlay } from '../types/editor';

interface TimelineProps {
  project: VideoProject;
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  selectedClipId: string | null;
  onSelectClip: (id: string | null, type: 'video' | 'audio' | 'text' | 'sticker') => void;
  onSplitClip: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onOpenSpeedModal: () => void;
  onOpenFilterModal: () => void;
  onOpenTransitionModal: (clipId: string) => void;
  onTrimClip: (clipId: string, newStart: number, newDuration: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  currentTime,
  totalDuration,
  onSeek,
  selectedClipId,
  onSelectClip,
  onSplitClip,
  onDeleteClip,
  onDuplicateClip,
  onOpenSpeedModal,
  onOpenFilterModal,
  onOpenTransitionModal,
  onTrimClip,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(48); // pixels per second
  const isDraggingPlayhead = useRef(false);
  const isTrimmingRef = useRef<{ clipId: string; side: 'left' | 'right'; initialX: number; initialStart: number; initialDuration: number } | null>(null);

  // Selected clip object
  const selectedVideoClip = project.videoClips.find((c) => c.id === selectedClipId);

  // Handle Playhead drag
  const handleTimelinePointerDown = (e: React.PointerEvent) => {
    if (isTrimmingRef.current) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    isDraggingPlayhead.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const rect = scrollEl.getBoundingClientRect();
    const scrollLeft = scrollEl.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft - 80; // 80px is track label column
    const clickedTime = Math.max(0, Math.min(totalDuration, clickX / zoom));
    onSeek(clickedTime);
  };

  const handleTimelinePointerMove = (e: React.PointerEvent) => {
    if (isTrimmingRef.current) {
      const { clipId, side, initialX, initialStart, initialDuration } = isTrimmingRef.current;
      const deltaSec = (e.clientX - initialX) / zoom;
      const clip = project.videoClips.find((c) => c.id === clipId);
      if (!clip) return;

      if (side === 'left') {
        const maxDelta = initialDuration - 0.5; // min 0.5s duration
        const safeDelta = Math.min(maxDelta, Math.max(-initialStart, deltaSec));
        onTrimClip(clipId, initialStart + safeDelta, initialDuration - safeDelta);
      } else {
        const newDur = Math.max(0.5, initialDuration + deltaSec);
        onTrimClip(clipId, initialStart, newDur);
      }
      return;
    }

    if (!isDraggingPlayhead.current || !scrollRef.current) return;
    const rect = scrollRef.current.getBoundingClientRect();
    const scrollLeft = scrollRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft - 80;
    const clickedTime = Math.max(0, Math.min(totalDuration, clickX / zoom));
    onSeek(clickedTime);
  };

  const handleTimelinePointerUp = (e: React.PointerEvent) => {
    isDraggingPlayhead.current = false;
    isTrimmingRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Start trimming clip edges
  const startTrim = (e: React.MouseEvent, clip: VideoClip, side: 'left' | 'right') => {
    e.stopPropagation();
    isTrimmingRef.current = {
      clipId: clip.id,
      side,
      initialX: e.clientX,
      initialStart: clip.start,
      initialDuration: clip.duration,
    };
  };

  // Generate ruler tick marks
  const rulerTicks = [];
  const maxRulerSec = Math.max(totalDuration + 5, 20);
  for (let s = 0; s <= maxRulerSec; s++) {
    rulerTicks.push(s);
  }

  const playheadPositionPx = 80 + currentTime * zoom;
  const totalTimelineWidthPx = Math.max(800, maxRulerSec * zoom + 160);

  return (
    <div
      ref={containerRef}
      className="bg-[#0b0e14] border-t border-slate-800/80 flex flex-col select-none relative z-20"
    >
      {/* Top Action Bar for Selected Clip & Zoom Controls */}
      <div className="h-9 px-3 bg-[#0e121a] border-b border-slate-800/60 flex items-center justify-between text-xs">
        {/* Left: Quick Actions if clip is selected */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {selectedVideoClip ? (
            <>
              <button
                onClick={() => onSplitClip(selectedVideoClip.id)}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-md font-medium transition-colors"
                title="Dividir clip en el cabezal actual"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Dividir</span>
              </button>

              <button
                onClick={onOpenSpeedModal}
                className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
              >
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedVideoClip.speed}x</span>
              </button>

              <button
                onClick={onOpenFilterModal}
                className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="capitalize">{selectedVideoClip.filter}</span>
              </button>

              <button
                onClick={() => onDuplicateClip(selectedVideoClip.id)}
                className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Duplicar</span>
              </button>

              <button
                onClick={() => onDeleteClip(selectedVideoClip.id)}
                className="flex items-center gap-1 px-2 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Borrar</span>
              </button>
            </>
          ) : (
            <span className="text-slate-400 text-[11px]">
              Selecciona un clip en la pista para cortar o ajustar
            </span>
          )}
        </div>

        {/* Right: Zoom buttons */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => setZoom(Math.max(20, zoom - 10))}
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reducir zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-['JetBrains_Mono'] px-1">{zoom}px/s</span>
          <button
            onClick={() => setZoom(Math.min(100, zoom + 10))}
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Multi-Track Scroll Area */}
      <div
        ref={scrollRef}
        onPointerDown={handleTimelinePointerDown}
        onPointerMove={handleTimelinePointerMove}
        onPointerUp={handleTimelinePointerUp}
        className="relative h-48 sm:h-52 overflow-x-auto overflow-y-hidden timeline-track-scroll bg-[#0a0d13]"
      >
        <div
          style={{ width: `${totalTimelineWidthPx}px` }}
          className="relative h-full flex flex-col"
        >
          {/* 1. Time Ruler */}
          <div className="h-6 w-full border-b border-slate-800/70 flex items-center relative pl-20 text-[10px] font-['JetBrains_Mono'] text-slate-400 select-none bg-[#0e121a]">
            {rulerTicks.map((sec) => (
              <div
                key={sec}
                style={{ left: `${80 + sec * zoom}px` }}
                className="absolute top-0 bottom-0 flex flex-col justify-end pb-0.5"
              >
                <span className="-translate-x-1/2">
                  00:{sec.toString().padStart(2, '0')}
                </span>
                <div className="w-[1px] h-1.5 bg-slate-700 mx-auto" />
              </div>
            ))}
          </div>

          {/* 2. Track 1: Text Overlays */}
          <div className="h-7 w-full border-b border-slate-800/40 relative flex items-center bg-[#090b10]">
            <div className="sticky left-0 w-20 h-full bg-[#0e121a] border-r border-slate-800/80 z-10 flex items-center gap-1.5 px-2 text-[10px] text-amber-400 font-medium">
              <Type className="w-3 h-3" />
              <span>Texto</span>
            </div>
            {project.textOverlays.map((textItem) => (
              <div
                key={textItem.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectClip(textItem.id, 'text');
                }}
                style={{
                  left: `${80 + textItem.start * zoom}px`,
                  width: `${Math.max(20, textItem.duration * zoom)}px`,
                }}
                className={`absolute h-5 rounded-md px-2 flex items-center justify-between text-[10px] font-medium truncate cursor-pointer transition-all border ${
                  selectedClipId === textItem.id
                    ? 'bg-amber-500 text-slate-950 font-bold border-white shadow-md'
                    : 'bg-amber-950/60 text-amber-300 border-amber-800/60 hover:bg-amber-900/60'
                }`}
              >
                <span className="truncate">{textItem.text}</span>
              </div>
            ))}
          </div>

          {/* 3. Track 2: Stickers & Overlays */}
          <div className="h-7 w-full border-b border-slate-800/40 relative flex items-center bg-[#090b10]">
            <div className="sticky left-0 w-20 h-full bg-[#0e121a] border-r border-slate-800/80 z-10 flex items-center gap-1.5 px-2 text-[10px] text-cyan-400 font-medium">
              <Smile className="w-3 h-3" />
              <span>Stickers</span>
            </div>
            {project.stickers.map((sticker) => (
              <div
                key={sticker.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectClip(sticker.id, 'sticker');
                }}
                style={{
                  left: `${80 + sticker.start * zoom}px`,
                  width: `${Math.max(20, sticker.duration * zoom)}px`,
                }}
                className={`absolute h-5 rounded-md px-1.5 flex items-center gap-1 text-[10px] font-medium truncate cursor-pointer transition-all border ${
                  selectedClipId === sticker.id
                    ? 'bg-cyan-500 text-slate-950 font-bold border-white shadow-md'
                    : 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60 hover:bg-cyan-900/60'
                }`}
              >
                <span>{sticker.emojiOrIcon}</span>
                <span className="truncate">{sticker.label}</span>
              </div>
            ))}
          </div>

          {/* 4. Track 3: Main Video Track (Filmstrip with thumbnails) */}
          <div className="h-16 w-full border-b border-slate-800/60 relative flex items-center bg-[#06080c]">
            <div className="sticky left-0 w-20 h-full bg-[#0e121a] border-r border-slate-800/80 z-10 flex items-center gap-1.5 px-2 text-[10px] text-indigo-400 font-medium">
              <Layers className="w-3 h-3" />
              <span>Video</span>
            </div>

            {project.videoClips.map((clip, index) => {
              const clipWidth = clip.duration * zoom;
              const isSelected = selectedClipId === clip.id;

              return (
                <div
                  key={clip.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClip(clip.id, 'video');
                  }}
                  style={{
                    left: `${80 + clip.start * zoom}px`,
                    width: `${clipWidth}px`,
                  }}
                  className={`absolute h-14 rounded-lg overflow-hidden flex flex-col justify-between cursor-pointer border-2 transition-shadow group ${
                    isSelected
                      ? 'border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg'
                      : 'border-slate-700/80 hover:border-slate-500'
                  } bg-slate-900`}
                >
                  {/* Filmstrip thumbnail backgrounds */}
                  <div className="absolute inset-0 flex opacity-75 group-hover:opacity-90 transition-opacity">
                    <img
                      src={clip.thumbnail}
                      alt={clip.title}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                  </div>

                  {/* Clip Label */}
                  <div className="relative z-10 p-1 flex items-center justify-between text-[10px] font-semibold text-white drop-shadow">
                    <span className="truncate max-w-[80px]">{clip.title}</span>
                    <span className="font-['JetBrains_Mono'] text-[9px] text-indigo-300">
                      {clip.duration.toFixed(1)}s
                    </span>
                  </div>

                  {/* Transition button at the end of clip if not last */}
                  {index < project.videoClips.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTransitionModal(clip.id);
                      }}
                      title="Configurar transición"
                      className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-slate-900 border border-indigo-500 text-indigo-400 hover:scale-110 flex items-center justify-center shadow-lg transition-transform text-[9px]"
                    >
                      ⚡
                    </button>
                  )}

                  {/* Trim Handles when selected */}
                  {isSelected && (
                    <>
                      {/* Left Trim Handle */}
                      <div
                        onMouseDown={(e) => startTrim(e, clip, 'left')}
                        title="Ajustar inicio de clip"
                        className="absolute left-0 top-0 bottom-0 w-3 bg-indigo-500 hover:bg-white cursor-ew-resize z-20 flex items-center justify-center rounded-l"
                      >
                        <div className="w-0.5 h-4 bg-slate-950 rounded-full" />
                      </div>

                      {/* Right Trim Handle */}
                      <div
                        onMouseDown={(e) => startTrim(e, clip, 'right')}
                        title="Ajustar fin de clip"
                        className="absolute right-0 top-0 bottom-0 w-3 bg-indigo-500 hover:bg-white cursor-ew-resize z-20 flex items-center justify-center rounded-r"
                      >
                        <div className="w-0.5 h-4 bg-slate-950 rounded-full" />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* 5. Track 4: Audio Track (Waveforms) */}
          <div className="h-10 w-full relative flex items-center bg-[#07090e]">
            <div className="sticky left-0 w-20 h-full bg-[#0e121a] border-r border-slate-800/80 z-10 flex items-center gap-1.5 px-2 text-[10px] text-emerald-400 font-medium">
              <Music className="w-3 h-3" />
              <span>Audio</span>
            </div>

            {project.audioClips.map((audio) => {
              const audioWidth = audio.duration * zoom;
              const isSelected = selectedClipId === audio.id;
              const waveformBars = audio.waveform || [0.4, 0.7, 0.9, 0.5, 0.8, 0.3, 0.6, 0.85];

              return (
                <div
                  key={audio.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClip(audio.id, 'audio');
                  }}
                  style={{
                    left: `${80 + audio.start * zoom}px`,
                    width: `${audioWidth}px`,
                  }}
                  className={`absolute h-8 rounded-md px-2 flex items-center gap-1.5 cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-emerald-600/90 text-white border-white shadow-md'
                      : 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
                  }`}
                >
                  <Volume2 className="w-3 h-3 shrink-0" />
                  <span className="text-[10px] font-medium truncate max-w-[80px]">
                    {audio.title}
                  </span>

                  {/* Waveform graphic */}
                  <div className="flex-1 h-5 flex items-center gap-0.5 overflow-hidden ml-1">
                    {waveformBars.slice(0, Math.floor(audioWidth / 4)).map((val, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${Math.round(val * 100)}%` }}
                        className="w-0.5 bg-emerald-400/80 rounded-full min-h-[3px]"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 6. Playhead Scrubber Needle */}
          <div
            style={{ left: `${playheadPositionPx}px` }}
            className="absolute top-0 bottom-0 w-[2px] bg-rose-500 z-30 pointer-events-none transition-none shadow-[0_0_8px_rgba(244,63,94,0.8)]"
          >
            {/* Playhead Handle Top */}
            <div className="w-4 h-4 bg-rose-500 -translate-x-1/2 -top-0 rounded-b-md shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
