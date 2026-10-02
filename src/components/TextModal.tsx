import React, { useState } from 'react';
import { X, Type, Sparkles, Palette } from 'lucide-react';
import { TextOverlay } from '../types/editor';

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveText: (overlay: TextOverlay) => void;
  editingText: TextOverlay | null;
  currentTime: number;
}

export const TextModal: React.FC<TextModalProps> = ({
  isOpen,
  onClose,
  onSaveText,
  editingText,
  currentTime,
}) => {
  const [text, setText] = useState(editingText?.text || 'Tu Título Aquí ✨');
  const [fontFamily, setFontFamily] = useState(editingText?.fontFamily || 'Syne');
  const [fontSize, setFontSize] = useState(editingText?.fontSize || 26);
  const [color, setColor] = useState(editingText?.color || '#ffffff');
  const [backgroundColor, setBackgroundColor] = useState(
    editingText?.backgroundColor || 'rgba(0, 0, 0, 0.7)'
  );
  const [stylePreset, setStylePreset] = useState<TextOverlay['stylePreset']>(
    editingText?.stylePreset || 'neon'
  );
  const [animation, setAnimation] = useState<TextOverlay['animation']>(
    editingText?.animation || 'pop'
  );
  const [duration, setDuration] = useState(editingText?.duration || 3.5);

  if (!isOpen) return null;

  const colorPresets = [
    { label: 'Blanco', value: '#ffffff' },
    { label: 'Amarillo', value: '#fef08a' },
    { label: 'Cian', value: '#38bdf8' },
    { label: 'Rosa Neón', value: '#f43f5e' },
    { label: 'Lima', value: '#a3e635' },
    { label: 'Púrpura', value: '#c084fc' },
  ];

  const handleSave = () => {
    if (!text.trim()) return;

    const overlay: TextOverlay = {
      id: editingText?.id || `text-${Date.now()}`,
      text,
      start: editingText ? editingText.start : currentTime,
      duration,
      x: editingText?.x || 50,
      y: editingText?.y || 45,
      fontSize,
      color,
      backgroundColor,
      fontFamily,
      fontWeight: '800',
      stylePreset,
      animation,
    };

    onSaveText(overlay);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#0e121a] border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-['Syne']">
              {editingText ? 'Editar Subtítulo' : 'Nuevo Texto Animado'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Contenido del texto</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe aquí tu subtítulo..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Quick Style Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Estilo Visual</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setStylePreset('neon');
                  setColor('#ffffff');
                  setBackgroundColor('rgba(0, 0, 0, 0.6)');
                  setFontFamily('Syne');
                }}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  stylePreset === 'neon'
                    ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                ⚡ Neón Glow
              </button>

              <button
                type="button"
                onClick={() => {
                  setStylePreset('subtitles');
                  setColor('#fef08a');
                  setBackgroundColor('rgba(15, 23, 42, 0.85)');
                  setFontFamily('Plus Jakarta Sans');
                }}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  stylePreset === 'subtitles'
                    ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                📱 Subtítulo Viral
              </button>

              <button
                type="button"
                onClick={() => {
                  setStylePreset('cinematic');
                  setColor('#ffffff');
                  setBackgroundColor('transparent');
                  setFontFamily('Syne');
                }}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  stylePreset === 'cinematic'
                    ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                🎬 Cinemático
              </button>
            </div>
          </div>

          {/* Color Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-sky-400" />
              <span>Color del Texto</span>
            </label>
            <div className="flex items-center gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform active:scale-90 ${
                    color === c.value ? 'border-white scale-110 shadow-lg' : 'border-slate-700'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Animation & Typography */}
          <div className="grid grid-cols-2 gap-3">
            {/* Animación */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Animación</label>
              <select
                value={animation}
                onChange={(e) => setAnimation(e.target.value as TextOverlay['animation'])}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="pop">Pop Zoom</option>
                <option value="fade">Fundido Suave</option>
                <option value="slide_up">Deslizar Arriba</option>
                <option value="none">Estático</option>
              </select>
            </div>

            {/* Tipografía */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Fuente</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="Syne">Syne (Negrita / Titulares)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta (Moderno)</option>
                <option value="JetBrains Mono">JetBrains Mono (Código)</option>
              </select>
            </div>
          </div>

          {/* Duración Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Duración en Pantalla</span>
              <span className="font-mono text-indigo-400">{duration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c0f16]">
          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors"
          >
            Guardar Subtítulo
          </button>
        </div>
      </div>
    </div>
  );
};
