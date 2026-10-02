import React from 'react';
import { X, Gauge } from 'lucide-react';
import { VideoClip } from '../types/editor';

interface SpeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClip: VideoClip | null;
  onUpdateSpeed: (clipId: string, speed: number) => void;
}

export const SpeedModal: React.FC<SpeedModalProps> = ({
  isOpen,
  onClose,
  selectedClip,
  onUpdateSpeed,
}) => {
  if (!isOpen || !selectedClip) return null;

  const presets = [
    { label: '0.25x', value: 0.25, desc: 'Ultra Slow-Mo' },
    { label: '0.5x', value: 0.5, desc: 'Cámara Lenta' },
    { label: '1.0x', value: 1.0, desc: 'Normal' },
    { label: '1.5x', value: 1.5, desc: 'Dinámico' },
    { label: '2.0x', value: 2.0, desc: 'Rápido' },
    { label: '4.0x', value: 4.0, desc: 'Timelapse' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-bold text-white font-['Syne']">
              Control de Velocidad (Speed Ramp)
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
        <div className="p-5 space-y-6">
          {/* Quick presets */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-3">
              Preajustes de Velocidad
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {presets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => onUpdateSpeed(selectedClip.id, p.value)}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition-all active:scale-95 ${
                    selectedClip.speed === p.value
                      ? 'border-orange-500 bg-orange-950/60 shadow-md ring-1 ring-orange-500'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-bold text-white font-['JetBrains_Mono']">
                    {p.label}
                  </span>
                  <span className="text-[10px] text-slate-400">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Continuous slider */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Velocidad Personalizada</span>
              <span className="font-mono text-orange-400 font-bold">
                {selectedClip.speed.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.25"
              max="4.0"
              step="0.05"
              value={selectedClip.speed}
              onChange={(e) => onUpdateSpeed(selectedClip.id, parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c0f16]">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors"
          >
            Aplicar Velocidad
          </button>
        </div>
      </div>
    </div>
  );
};
