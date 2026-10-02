import React from 'react';
import { X, Sparkles, Sliders, RotateCcw } from 'lucide-react';
import { VideoClip, FilterType, ClipAdjustments } from '../types/editor';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClip: VideoClip | null;
  onUpdateClip: (clip: VideoClip) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  selectedClip,
  onUpdateClip,
}) => {
  if (!isOpen || !selectedClip) return null;

  const filters: { id: FilterType; label: string; desc: string; previewClass: string }[] = [
    { id: 'none', label: 'Original', desc: 'Sin filtro', previewClass: '' },
    { id: 'cinematic', label: 'Cinemático', desc: 'Teal & Orange', previewClass: 'contrast-125 saturate-110 sepia-[0.15]' },
    { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Neón futurista', previewClass: 'hue-rotate-180 saturate-150 contrast-125' },
    { id: 'sunset', label: 'Atardecer', desc: 'Tonos dorados cálidos', previewClass: 'sepia-[0.25] saturate-125' },
    { id: 'noir', label: 'Noir B&W', desc: 'Monocromo dramático', previewClass: 'grayscale contrast-150' },
    { id: 'vintage', label: 'Vintage 90s', desc: 'Aspecto película retro', previewClass: 'sepia-[0.4] contrast-90 brightness-110' },
    { id: 'teal_orange', label: 'Blockbuster', desc: 'Hollywood look', previewClass: 'hue-rotate-15 contrast-125 saturate-125' },
    { id: 'vibrant', label: 'Vibrante', desc: 'Colores intensos', previewClass: 'saturate-200 contrast-110' },
  ];

  const handleFilterChange = (filter: FilterType) => {
    onUpdateClip({
      ...selectedClip,
      filter,
    });
  };

  const handleAdjustmentChange = (key: keyof ClipAdjustments, value: number) => {
    onUpdateClip({
      ...selectedClip,
      adjustments: {
        ...selectedClip.adjustments,
        [key]: value,
      },
    });
  };

  const handleReset = () => {
    onUpdateClip({
      ...selectedClip,
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
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#0e121a] border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white font-['Syne']">
              Filtros & Gradación de Color
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
              title="Restablecer valores"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px]">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* LUT Filter Presets */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-3">
              Estilos de Color (LUTs)
            </span>
            <div className="grid grid-cols-4 gap-2.5">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFilterChange(f.id)}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all active:scale-95 ${
                    selectedClip.filter === f.id
                      ? 'bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-full aspect-square rounded-lg overflow-hidden relative bg-slate-950 ${f.previewClass}`}>
                    <img
                      src={selectedClip.thumbnail}
                      alt={f.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-white truncate max-w-full">
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Precision Adjustment Sliders */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Ajustes Finos</span>
            </div>

            {/* Brillo */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Brillo</span>
                <span className="font-mono text-indigo-400">
                  {Math.round(selectedClip.adjustments.brightness * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.6"
                step="0.05"
                value={selectedClip.adjustments.brightness}
                onChange={(e) => handleAdjustmentChange('brightness', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Contraste */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Contraste</span>
                <span className="font-mono text-indigo-400">
                  {Math.round(selectedClip.adjustments.contrast * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.05"
                value={selectedClip.adjustments.contrast}
                onChange={(e) => handleAdjustmentChange('contrast', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Saturación */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Saturación</span>
                <span className="font-mono text-indigo-400">
                  {Math.round(selectedClip.adjustments.saturation * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2.2"
                step="0.05"
                value={selectedClip.adjustments.saturation}
                onChange={(e) => handleAdjustmentChange('saturation', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Viñeta */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Viñeta Cinemática</span>
                <span className="font-mono text-indigo-400">
                  {Math.round(selectedClip.adjustments.vignette * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={selectedClip.adjustments.vignette}
                onChange={(e) => handleAdjustmentChange('vignette', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Desenfoque */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Desenfoque (Blur)</span>
                <span className="font-mono text-indigo-400">
                  {selectedClip.adjustments.blur}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={selectedClip.adjustments.blur}
                onChange={(e) => handleAdjustmentChange('blur', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c0f16]">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors"
          >
            Aplicar y Volver
          </button>
        </div>
      </div>
    </div>
  );
};
