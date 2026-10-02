import React, { useState, useRef } from 'react';
import { X, Music, Volume2, Play, Pause, Plus, Upload, Mic, Disc } from 'lucide-react';
import { AudioClip } from '../types/editor';
import { generateSyntheticMusic, generateSFX, getAudioContext } from '../utils/audioGenerator';

interface AudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAudio: (clip: AudioClip) => void;
  onOpenVoiceover: () => void;
  timelineEndTime: number;
}

export const AudioModal: React.FC<AudioModalProps> = ({
  isOpen,
  onClose,
  onAddAudio,
  onOpenVoiceover,
  timelineEndTime,
}) => {
  const [activeTab, setActiveTab] = useState<'music' | 'sfx' | 'upload'>('music');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const musicTracks: { id: string; type: 'lofi' | 'cinematic' | 'trap' | 'cyberpunk'; title: string; genre: string; duration: number }[] = [
    { id: 'm-lofi', type: 'lofi', title: 'Lo-Fi Chill Sunset', genre: 'Chill / Vlog', duration: 16 },
    { id: 'm-cine', type: 'cinematic', title: 'Cinematic Sub Bass', genre: 'Trailer / Épico', duration: 14 },
    { id: 'm-trap', type: 'trap', title: 'Upbeat Urban Beat', genre: 'Trap / TikTok', duration: 16 },
    { id: 'm-cyber', type: 'cyberpunk', title: 'Cyberpunk Pulse', genre: 'Electro / Synth', duration: 15 },
  ];

  const sfxTracks: { id: string; type: 'whoosh' | 'shutter' | 'impact' | 'pop' | 'glitch'; title: string; category: string }[] = [
    { id: 'sfx-whoosh', type: 'whoosh', title: 'Whoosh Rápido', category: 'Transición' },
    { id: 'sfx-shutter', type: 'shutter', title: 'Obturador Cámara', category: 'Acción' },
    { id: 'sfx-impact', type: 'impact', title: 'Impacto Cinemático', category: 'Épico' },
    { id: 'sfx-pop', type: 'pop', title: 'Pop Burbuja', category: 'UI / Like' },
    { id: 'sfx-glitch', type: 'glitch', title: 'Beep Glitch Digital', category: 'Ciber' },
  ];

  const handlePlayPreview = (id: string, url: string) => {
    if (playingId === id) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setPlayingId(null);
      return;
    }

    if (audioPreviewRef.current) {
      audioPreviewRef.current.src = url;
      audioPreviewRef.current.play();
      setPlayingId(id);
      audioPreviewRef.current.onended = () => setPlayingId(null);
    }
  };

  const handleInsertMusic = (item: typeof musicTracks[0]) => {
    const gen = generateSyntheticMusic(item.type, item.duration);
    const newAudio: AudioClip = {
      id: `audio-${Date.now()}`,
      title: item.title,
      src: gen.blobUrl,
      start: timelineEndTime,
      duration: item.duration,
      volume: 0.85,
      fadeIn: 0.5,
      fadeOut: 1.0,
      category: 'music',
      waveform: gen.waveform,
      audioBuffer: gen.buffer,
    };
    onAddAudio(newAudio);
    onClose();
  };

  const handleInsertSFX = (item: typeof sfxTracks[0]) => {
    const gen = generateSFX(item.type);
    const newAudio: AudioClip = {
      id: `sfx-${Date.now()}`,
      title: item.title,
      src: gen.blobUrl,
      start: timelineEndTime,
      duration: gen.duration,
      volume: 1.0,
      fadeIn: 0.05,
      fadeOut: 0.1,
      category: 'sfx',
      waveform: [0.3, 0.8, 0.5, 0.2],
    };
    onAddAudio(newAudio);
    onClose();
  };

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    const audioCtx = getAudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const newAudio: AudioClip = {
      id: `user-audio-${Date.now()}`,
      title: file.name.substring(0, 18),
      src: blobUrl,
      start: timelineEndTime,
      duration: Math.min(30, audioBuffer.duration),
      volume: 0.9,
      fadeIn: 0.5,
      fadeOut: 0.5,
      category: 'music',
      waveform: [0.4, 0.7, 0.9, 0.6, 0.8, 0.5, 0.7],
      audioBuffer,
    };

    onAddAudio(newAudio);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      {/* Hidden Audio Player for previewing tracks */}
      <audio ref={audioPreviewRef} className="hidden" />

      <div className="w-full max-w-lg bg-[#0e121a] border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white font-['Syne']">
              Música & Efectos de Sonido
            </h3>
          </div>
          <button
            onClick={() => {
              if (audioPreviewRef.current) audioPreviewRef.current.pause();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 flex items-center gap-2 border-b border-slate-800/80 bg-[#0a0d13]">
          <button
            onClick={() => setActiveTab('music')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'music'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Música Libre
          </button>
          <button
            onClick={() => setActiveTab('sfx')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'sfx'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Efectos (SFX)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Importar Audio
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenVoiceover();
            }}
            className="ml-auto pb-2.5 px-2 text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Grabar Voz</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3">
          {activeTab === 'music' && (
            <div className="space-y-2.5">
              {musicTracks.map((track) => (
                <div
                  key={track.id}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const synth = generateSyntheticMusic(track.type, track.duration);
                        handlePlayPreview(track.id, synth.blobUrl);
                      }}
                      className="w-9 h-9 rounded-full bg-teal-950/80 border border-teal-700/60 text-teal-400 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                    >
                      {playingId === track.id ? (
                        <Pause className="w-4 h-4 fill-teal-400" />
                      ) : (
                        <Play className="w-4 h-4 fill-teal-400 translate-x-0.5" />
                      )}
                    </button>
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {track.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {track.genre} · {track.duration}s
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInsertMusic(track)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sfx' && (
            <div className="space-y-2">
              {sfxTracks.map((sfx) => (
                <div
                  key={sfx.id}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const gen = generateSFX(sfx.type);
                        handlePlayPreview(sfx.id, gen.blobUrl);
                      }}
                      className="w-8 h-8 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-400 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                    >
                      {playingId === sfx.id ? (
                        <Pause className="w-3.5 h-3.5 fill-purple-400" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-purple-400 translate-x-0.5" />
                      )}
                    </button>
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {sfx.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {sfx.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInsertSFX(sfx)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Usar</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadAudio}
                accept="audio/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-teal-500/50 hover:border-teal-400 bg-teal-950/20 hover:bg-teal-950/30 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-teal-600/20 flex items-center justify-center text-teal-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-white block">
                    Selecciona una canción desde tu dispositivo
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Formatos admitidos: MP3, WAV, AAC, OGG
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
