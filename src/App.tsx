/**
 * NovaCut Pro - Editor de Video Profesional para Android
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { AndroidFrame } from './components/AndroidFrame';
import { PreviewCanvas } from './components/PreviewCanvas';
import { Timeline } from './components/Timeline';
import { AndroidToolbar } from './components/AndroidToolbar';
import { MediaLibraryModal } from './components/MediaLibraryModal';
import { FilterModal } from './components/FilterModal';
import { TextModal } from './components/TextModal';
import { TransitionsModal } from './components/TransitionsModal';
import { SpeedModal } from './components/SpeedModal';
import { AudioModal } from './components/AudioModal';
import { VoiceoverModal } from './components/VoiceoverModal';
import { StickersModal } from './components/StickersModal';
import { ExportModal } from './components/ExportModal';
import { HelpModal } from './components/HelpModal';

import { 
  VideoProject, 
  VideoClip, 
  AudioClip, 
  TextOverlay, 
  StickerOverlay, 
  AspectRatio, 
  Resolution,
  TransitionType 
} from './types/editor';
import { createDefaultProject } from './utils/sampleMedia';

export default function App() {
  const [project, setProject] = useState<VideoProject>(() => createDefaultProject());
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-1');
  const [selectedClipType, setSelectedClipType] = useState<'video' | 'audio' | 'text' | 'sticker' | null>('video');
  const [isAndroidFrame, setIsAndroidFrame] = useState(true);

  // Undo / Redo history
  const [history, setHistory] = useState<VideoProject[]>([]);
  const [redoStack, setRedoStack] = useState<VideoProject[]>([]);

  // Modals
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [editingText, setEditingText] = useState<TextOverlay | null>(null);
  const [isTransitionsModalOpen, setIsTransitionsModalOpen] = useState(false);
  const [transitionClipId, setTransitionClipId] = useState<string | null>(null);
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isVoiceoverModalOpen, setIsVoiceoverModalOpen] = useState(false);
  const [isStickersModalOpen, setIsStickersModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Calculate total duration from all video clips
  const totalDuration = Math.max(
    project.videoClips.reduce((max, c) => Math.max(max, c.start + c.duration), 0),
    project.audioClips.reduce((max, a) => Math.max(max, a.start + a.duration), 0),
    4
  );

  // Push to history for undo
  const saveToHistory = useCallback((currentProj: VideoProject) => {
    setHistory((prev) => [...prev.slice(-20), currentProj]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [project, ...prev]);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setProject(previous);
  }, [history, project]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, project]);
    setRedoStack((prev) => prev.slice(1));
    setProject(next);
  }, [redoStack, project]);

  // Selected clip object helper
  const selectedClip = project.videoClips.find((c) => c.id === selectedClipId) || null;

  // Split clip at current playhead
  const handleSplitClip = useCallback((clipIdToSplit?: string) => {
    const targetId = clipIdToSplit || selectedClipId;
    if (!targetId) return;

    const clipIndex = project.videoClips.findIndex((c) => c.id === targetId);
    if (clipIndex === -1) return;

    const clip = project.videoClips[clipIndex];
    if (currentTime <= clip.start + 0.1 || currentTime >= clip.start + clip.duration - 0.1) {
      return; // Can't split too close to edges
    }

    saveToHistory(project);

    const firstDuration = currentTime - clip.start;
    const secondDuration = clip.duration - firstDuration;

    const firstHalf: VideoClip = {
      ...clip,
      duration: firstDuration,
      transition: { type: 'none', duration: 0.5 },
    };

    const secondHalf: VideoClip = {
      ...clip,
      id: `clip-split-${Date.now()}`,
      start: currentTime,
      duration: secondDuration,
      sourceStart: clip.sourceStart + firstDuration * clip.speed,
    };

    const updatedClips = [
      ...project.videoClips.slice(0, clipIndex),
      firstHalf,
      secondHalf,
      ...project.videoClips.slice(clipIndex + 1),
    ];

    setProject({
      ...project,
      videoClips: updatedClips,
      lastModified: Date.now(),
    });
    setSelectedClipId(secondHalf.id);
  }, [selectedClipId, project, currentTime, saveToHistory]);

  // Delete clip
  const handleDeleteClip = useCallback((clipId: string) => {
    saveToHistory(project);
    const updatedClips = project.videoClips.filter((c) => c.id !== clipId);
    setProject({
      ...project,
      videoClips: updatedClips,
      lastModified: Date.now(),
    });
    setSelectedClipId(null);
  }, [project, saveToHistory]);

  // Duplicate clip
  const handleDuplicateClip = useCallback((clipId: string) => {
    const clip = project.videoClips.find((c) => c.id === clipId);
    if (!clip) return;

    saveToHistory(project);
    const newClip: VideoClip = {
      ...clip,
      id: `clip-dup-${Date.now()}`,
      start: totalDuration,
      title: `${clip.title} (Copia)`,
    };

    setProject({
      ...project,
      videoClips: [...project.videoClips, newClip],
      lastModified: Date.now(),
    });
    setSelectedClipId(newClip.id);
  }, [project, totalDuration, saveToHistory]);

  // Trim clip edges
  const handleTrimClip = useCallback((clipId: string, newStart: number, newDuration: number) => {
    setProject((prev) => {
      const updated = prev.videoClips.map((c) => {
        if (c.id === clipId) {
          return {
            ...c,
            start: Math.max(0, newStart),
            duration: Math.max(0.5, newDuration),
          };
        }
        return c;
      });
      return { ...prev, videoClips: updated };
    });
  }, []);

  // Update clip properties (Filter/Adjustments)
  const handleUpdateClip = useCallback((updatedClip: VideoClip) => {
    setProject((prev) => ({
      ...prev,
      videoClips: prev.videoClips.map((c) => (c.id === updatedClip.id ? updatedClip : c)),
      lastModified: Date.now(),
    }));
  }, []);

  // Update Transition
  const handleUpdateTransition = useCallback((clipId: string, type: TransitionType, duration: number) => {
    setProject((prev) => ({
      ...prev,
      videoClips: prev.videoClips.map((c) => {
        if (c.id === clipId) {
          return {
            ...c,
            transition: { type, duration },
          };
        }
        return c;
      }),
      lastModified: Date.now(),
    }));
  }, []);

  // Update Speed
  const handleUpdateSpeed = useCallback((clipId: string, speed: number) => {
    saveToHistory(project);
    setProject((prev) => ({
      ...prev,
      videoClips: prev.videoClips.map((c) => {
        if (c.id === clipId) {
          // Adjust duration inversely with speed
          const ratio = c.speed / speed;
          return {
            ...c,
            speed,
            duration: Math.max(0.5, c.duration * ratio),
          };
        }
        return c;
      }),
      lastModified: Date.now(),
    }));
  }, [project, saveToHistory]);

  // Add new media clip
  const handleAddClip = useCallback((newClip: VideoClip) => {
    saveToHistory(project);
    setProject((prev) => ({
      ...prev,
      videoClips: [...prev.videoClips, newClip],
      lastModified: Date.now(),
    }));
    setSelectedClipId(newClip.id);
  }, [project, saveToHistory]);

  // Save Text Overlay
  const handleSaveText = useCallback((overlay: TextOverlay) => {
    saveToHistory(project);
    setProject((prev) => {
      const exists = prev.textOverlays.some((t) => t.id === overlay.id);
      return {
        ...prev,
        textOverlays: exists
          ? prev.textOverlays.map((t) => (t.id === overlay.id ? overlay : t))
          : [...prev.textOverlays, overlay],
        lastModified: Date.now(),
      };
    });
  }, [project, saveToHistory]);

  // Save Sticker
  const handleAddSticker = useCallback((sticker: StickerOverlay) => {
    saveToHistory(project);
    setProject((prev) => ({
      ...prev,
      stickers: [...prev.stickers, sticker],
      lastModified: Date.now(),
    }));
  }, [project, saveToHistory]);

  // Add Audio
  const handleAddAudio = useCallback((audio: AudioClip) => {
    saveToHistory(project);
    setProject((prev) => ({
      ...prev,
      audioClips: [...prev.audioClips, audio],
      lastModified: Date.now(),
    }));
  }, [project, saveToHistory]);

  // Update Text Overlay drag position
  const handleUpdateTextOverlay = useCallback((overlay: TextOverlay) => {
    setProject((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.map((t) => (t.id === overlay.id ? overlay : t)),
    }));
  }, []);

  // Update Sticker Overlay drag position
  const handleUpdateStickerOverlay = useCallback((sticker: StickerOverlay) => {
    setProject((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) => (s.id === sticker.id ? sticker : s)),
    }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 's' || e.key === 'S' || e.key === 'c' || e.key === 'C') {
        if (selectedClipId) {
          handleSplitClip(selectedClipId);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClipId) {
          handleDeleteClip(selectedClipId);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, handleSplitClip, handleDeleteClip, handleUndo, handleRedo]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#080a0f] text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans']">
      {/* Top Bar Header */}
      <Header
        aspectRatio={project.aspectRatio}
        onAspectRatioChange={(ratio) => setProject({ ...project, aspectRatio: ratio })}
        isAndroidFrame={isAndroidFrame}
        onToggleAndroidFrame={() => setIsAndroidFrame(!isAndroidFrame)}
        onOpenExport={() => setIsExportModalOpen(true)}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 w-full h-[calc(100vh-56px)] flex flex-col overflow-hidden relative">
        <AndroidFrame isFrameActive={isAndroidFrame} aspectRatio={project.aspectRatio}>
          {/* Real-time Video Viewport */}
          <PreviewCanvas
            project={project}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeUpdate={(t) => setCurrentTime(t)}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            totalDuration={totalDuration}
            onUpdateTextOverlay={handleUpdateTextOverlay}
            onUpdateStickerOverlay={handleUpdateStickerOverlay}
          />

          {/* Multi-Track Interactive Timeline */}
          <Timeline
            project={project}
            currentTime={currentTime}
            totalDuration={totalDuration}
            onSeek={(t) => setCurrentTime(t)}
            selectedClipId={selectedClipId}
            onSelectClip={(id, type) => {
              setSelectedClipId(id);
              setSelectedClipType(type);
              if (type === 'text') {
                const textItem = project.textOverlays.find((t) => t.id === id);
                if (textItem) {
                  setEditingText(textItem);
                  setIsTextModalOpen(true);
                }
              }
            }}
            onSplitClip={handleSplitClip}
            onDeleteClip={handleDeleteClip}
            onDuplicateClip={handleDuplicateClip}
            onOpenSpeedModal={() => setIsSpeedModalOpen(true)}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
            onOpenTransitionModal={(clipId) => {
              setTransitionClipId(clipId);
              setIsTransitionsModalOpen(true);
            }}
            onTrimClip={handleTrimClip}
          />

          {/* Android Ergonomic Thumb Toolbar */}
          <AndroidToolbar
            onSplit={() => handleSplitClip()}
            onOpenMediaModal={() => setIsMediaModalOpen(true)}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
            onOpenAdjustModal={() => setIsFilterModalOpen(true)}
            onOpenTextModal={() => {
              setEditingText(null);
              setIsTextModalOpen(true);
            }}
            onOpenAudioModal={() => setIsAudioModalOpen(true)}
            onOpenSpeedModal={() => setIsSpeedModalOpen(true)}
            onOpenStickerModal={() => setIsStickersModalOpen(true)}
            onOpenAspectModal={() => {
              // Cycle aspect ratio on Android thumb click
              const nextRatio: AspectRatio = 
                project.aspectRatio === '9:16' ? '16:9' :
                project.aspectRatio === '16:9' ? '1:1' :
                project.aspectRatio === '1:1' ? '4:5' : '9:16';
              setProject({ ...project, aspectRatio: nextRatio });
            }}
            onOpenVoiceoverModal={() => setIsVoiceoverModalOpen(true)}
            canSplit={!!selectedClip && currentTime > selectedClip.start && currentTime < selectedClip.start + selectedClip.duration}
          />
        </AndroidFrame>
      </main>

      {/* Modals & Dialogs */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onAddClip={handleAddClip}
        timelineEndTime={totalDuration}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedClip={selectedClip}
        onUpdateClip={handleUpdateClip}
      />

      <TextModal
        isOpen={isTextModalOpen}
        onClose={() => {
          setIsTextModalOpen(false);
          setEditingText(null);
        }}
        onSaveText={handleSaveText}
        editingText={editingText}
        currentTime={currentTime}
      />

      <TransitionsModal
        isOpen={isTransitionsModalOpen}
        onClose={() => {
          setIsTransitionsModalOpen(false);
          setTransitionClipId(null);
        }}
        selectedClip={project.videoClips.find((c) => c.id === transitionClipId) || selectedClip}
        onUpdateTransition={handleUpdateTransition}
      />

      <SpeedModal
        isOpen={isSpeedModalOpen}
        onClose={() => setIsSpeedModalOpen(false)}
        selectedClip={selectedClip}
        onUpdateSpeed={handleUpdateSpeed}
      />

      <AudioModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onAddAudio={handleAddAudio}
        onOpenVoiceover={() => setIsVoiceoverModalOpen(true)}
        timelineEndTime={totalDuration}
      />

      <VoiceoverModal
        isOpen={isVoiceoverModalOpen}
        onClose={() => setIsVoiceoverModalOpen(false)}
        onSaveVoiceover={handleAddAudio}
        currentTime={currentTime}
      />

      <StickersModal
        isOpen={isStickersModalOpen}
        onClose={() => setIsStickersModalOpen(false)}
        onAddSticker={handleAddSticker}
        currentTime={currentTime}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        onUpdateResolution={(res) => setProject({ ...project, resolution: res })}
        onUpdateFps={(fps) => setProject({ ...project, fps })}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
