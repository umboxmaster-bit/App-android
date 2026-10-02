import React, { useRef } from 'react';
import { X, Upload, Video, Image, Sparkles } from 'lucide-react';
import { VideoClip } from '../types/editor';
import { generateProceduralThumbnail, extractThumbnailFromFile } from '../utils/sampleMedia';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClip: (clip: VideoClip) => void;
  timelineEndTime: number;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddClip,
  timelineEndTime,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const proceduralPresets: {
    theme: VideoClip['proceduralTheme'];
    title: string;
    filter: VideoClip['filter'];
    desc: string;
  }[] = [
    {
      theme: 'neon_city',
      title: 'Intro Cyberpunk Neón',
      filter: 'cyberpunk',
      desc: 'Cuadrícula retro synthwave con sol futurista',
    },
    {
      theme: 'sunset_skate',
      title: 'Atardecer Skater 4K',
      filter: 'sunset',
      desc: 'Horizonte dorado con silueta dinámica',
    },
    {
      theme: 'nature_drone',
      title: 'Toma Drone Cordillera',
      filter: 'cinematic',
      desc: 'Montañas y lago esmeralda con reflejos',
    },
    {
      theme: 'tech_matrix',
      title: 'Matriz HUD Futurista',
      filter: 'vibrant',
      desc: 'Anillos holográficos y telemetría digital',
    },
  ];

  const handleAddPreset = (preset: typeof proceduralPresets[0]) => {
    const newClip: VideoClip = {
      id: `clip-${Date.now()}`,
      type: 'procedural',
      proceduralTheme: preset.theme,
      title: preset.title,
      src: '',
      thumbnail: generateProceduralThumbnail(preset.theme),
      start: timelineEndTime,
      duration: 4.0,
      sourceStart: 0,
      sourceDuration: 10,
      speed: 1.0,
      volume: 1.0,
      isMuted: false,
      filter: preset.filter,
      adjustments: {
        brightness: 1.0,
        contrast: 1.1,
        saturation: 1.15,
        exposure: 0,
        vignette: 0.2,
        blur: 0,
        glitch: 0,
      },
      transition: {
        type: 'crossfade',
        duration: 0.5,
      },
      transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
    };

    onAddClip(newClip);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) continue;

      const blobUrl = URL.createObjectURL(file);
      const thumbnail = await extractThumbnailFromFile(file);

      const newClip: VideoClip = {
        id: `clip-upload-${Date.now()}-${i}`,
        type: isVideo ? 'video' : 'image',
        title: file.name.substring(0, 18),
        src: blobUrl,
        thumbnail: thumbnail || generateProceduralThumbnail('abstract_glow'),
        start: timelineEndTime + i * 4.0,
        duration: 4.0,
        sourceStart: 0,
        sourceDuration: 10,
        speed: 1.0,
        volume: 1.0,
        isMuted: false,
        filter: 'none',
        adjustments: {
          brightness: 1.0,
          contrast: 1.0,
          saturation: 1.0,
          exposure: 0,
          vignette: 0,
          blur: 0,
          glitch: 0,
        },
        transition: {
          type: 'none',
          duration: 0.5,
        },
        transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
      };

      onAddClip(newClip);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#0e121a] border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-['Syne']">
              Biblioteca de Medios
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Upload Button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="video/*,image/*"
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 px-4 border-2 border-dashed border-indigo-500/50 hover:border-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 group-hover:bg-indigo-600/30 flex items-center justify-center text-indigo-400">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <span className="text-xs font-semibold text-white block">
                  Importar desde tu Android o PC
                </span>
                <span className="text-[11px] text-slate-400">
                  Soporta videos (.mp4, .webm, .mov) y fotos (.png, .jpg)
                </span>
              </div>
            </button>
          </div>

          {/* Procedural Clips Section */}
          <div>
            <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tomas Cinemáticas Predefinidas</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {proceduralPresets.map((preset) => {
                const thumb = generateProceduralThumbnail(preset.theme);
                return (
                  <button
                    key={preset.theme}
                    onClick={() => handleAddPreset(preset)}
                    className="p-2 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl flex flex-col text-left transition-all group active:scale-95"
                  >
                    <div className="w-full aspect-video rounded-lg overflow-hidden relative mb-2 bg-black">
                      <img
                        src={thumb}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                        4.0s
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-white truncate">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
