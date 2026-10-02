import React from 'react';
import { X, Smile } from 'lucide-react';
import { StickerOverlay } from '../types/editor';

interface StickersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSticker: (sticker: StickerOverlay) => void;
  currentTime: number;
}

export const StickersModal: React.FC<StickersModalProps> = ({
  isOpen,
  onClose,
  onAddSticker,
  currentTime,
}) => {
  if (!isOpen) return null;

  const stickers = [
    { emoji: '🔥', label: 'Fuego' },
    { emoji: '⚡', label: 'Rayo' },
    { emoji: '🚀', label: 'Cohete' },
    { emoji: '💯', label: '100' },
    { emoji: '✨', label: 'Brillo' },
    { emoji: '💥', label: 'Boom' },
    { emoji: '❤️', label: 'Corazón' },
    { emoji: '🏆', label: 'Trofeo' },
    { emoji: '📱', label: 'Android' },
    { emoji: '🎬', label: 'Cine' },
    { emoji: '📸', label: 'Foto' },
    { emoji: '🎵', label: 'Nota' },
    { emoji: '🔔', label: 'Campana' },
    { emoji: '🎯', label: 'Diana' },
    { emoji: '👍', label: 'Like' },
    { emoji: '😎', label: 'Cool' },
  ];

  const handleSelect = (item: typeof stickers[0]) => {
    const newSticker: StickerOverlay = {
      id: `sticker-${Date.now()}`,
      emojiOrIcon: item.emoji,
      label: item.label,
      start: currentTime,
      duration: 3.0,
      x: 50,
      y: 30,
      scale: 1.2,
      rotation: 0,
    };
    onAddSticker(newSticker);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-bold text-white font-['Syne']">
              Stickers & Insignias
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
        <div className="p-5">
          <span className="text-xs font-semibold text-slate-300 block mb-3">
            Toca un sticker para añadirlo al fotograma actual
          </span>
          <div className="grid grid-cols-4 gap-3">
            {stickers.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSelect(s)}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-yellow-500/70 hover:bg-yellow-950/20 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-[10px] text-slate-400 font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
