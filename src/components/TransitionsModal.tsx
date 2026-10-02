import React from 'react';
import { X, Zap } from 'lucide-react';
import { VideoClip, TransitionType } from '../types/editor';

interface TransitionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClip: VideoClip | null;
  onUpdateTransition: (clipId: string, type: TransitionType, duration: number) => void;
}

export const TransitionsModal: React.FC<TransitionsModalProps> = ({
  isOpen,
  onClose,
  selectedClip,
  onUpdateTransition,
}) => {
  if (!isOpen || !selectedClip) return null;

  const transitions: { type: TransitionType; label: string; icon: string; desc: string }[] = [
    { type: 'none', label: 'Corte Directo', icon: '✂️', desc: 'Sin transición entre clips' },
    { type: 'crossfade', label: 'Disolución Cruzada', icon: '🌫️', desc: 'Fundido suave y continuo' },
    { type: 'flash_white', label: 'Flash Blanco', icon: '⚡', desc: 'Destello de luz estilo videoclip' },
    { type: 'glitch', label: 'Corte Glitch', icon: '👾', desc: 'Distorsión cibernética digital' },
    { type: 'zoom_in', label: 'Zoom Dinámico', icon: '🔍', desc: 'Empuje hacia el siguiente clip' },
    { type: 'slide_left', label: 'Barrido Lateral', icon: '➡️', desc: 'Desplazamiento horizontal fluido' },
  ];

  const handleSelect = (type: TransitionType) => {
    onUpdateTransition(selectedClip.id, type, selectedClip.transition.duration || 0.5);
  };

  const handleDuration = (duration: number) => {
    onUpdateTransition(selectedClip.id, selectedClip.transition.type, duration);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-['Syne']">
              Transiciones de Video
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
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-2.5">
            {transitions.map((t) => (
              <button
                key={t.type}
                onClick={() => handleSelect(t.type)}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all active:scale-95 ${
                  selectedClip.transition.type === t.type
                    ? 'border-indigo-500 bg-indigo-950/60 shadow-md ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{t.icon}</span>
                  <span className="text-xs font-semibold text-white">{t.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {t.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Transition Duration Slider */}
          {selectedClip.transition.type !== 'none' && (
            <div className="space-y-1.5 pt-3 border-t border-slate-800">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Duración de la Transición</span>
                <span className="font-mono text-indigo-400">
                  {selectedClip.transition.duration.toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.5"
                step="0.1"
                value={selectedClip.transition.duration}
                onChange={(e) => handleDuration(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c0f16]">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
