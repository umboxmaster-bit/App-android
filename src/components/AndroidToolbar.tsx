import React from 'react';
import { 
  Scissors, 
  PlusCircle, 
  Sparkles, 
  Sliders, 
  Type, 
  Music, 
  Gauge, 
  Smile, 
  Ratio,
  Mic
} from 'lucide-react';

interface AndroidToolbarProps {
  onSplit: () => void;
  onOpenMediaModal: () => void;
  onOpenFilterModal: () => void;
  onOpenAdjustModal: () => void;
  onOpenTextModal: () => void;
  onOpenAudioModal: () => void;
  onOpenSpeedModal: () => void;
  onOpenStickerModal: () => void;
  onOpenAspectModal: () => void;
  onOpenVoiceoverModal: () => void;
  canSplit: boolean;
}

export const AndroidToolbar: React.FC<AndroidToolbarProps> = ({
  onSplit,
  onOpenMediaModal,
  onOpenFilterModal,
  onOpenAdjustModal,
  onOpenTextModal,
  onOpenAudioModal,
  onOpenSpeedModal,
  onOpenStickerModal,
  onOpenAspectModal,
  onOpenVoiceoverModal,
  canSplit,
}) => {
  const tools = [
    {
      id: 'split',
      label: 'Cortar',
      icon: Scissors,
      action: onSplit,
      disabled: !canSplit,
      highlight: true,
      color: 'text-indigo-400',
    },
    {
      id: 'add',
      label: 'Añadir',
      icon: PlusCircle,
      action: onOpenMediaModal,
      color: 'text-emerald-400',
    },
    {
      id: 'filter',
      label: 'Filtros',
      icon: Sparkles,
      action: onOpenFilterModal,
      color: 'text-purple-400',
    },
    {
      id: 'adjust',
      label: 'Ajustes',
      icon: Sliders,
      action: onOpenAdjustModal,
      color: 'text-sky-400',
    },
    {
      id: 'text',
      label: 'Texto',
      icon: Type,
      action: onOpenTextModal,
      color: 'text-amber-400',
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: Music,
      action: onOpenAudioModal,
      color: 'text-teal-400',
    },
    {
      id: 'voiceover',
      label: 'Voz / Mic',
      icon: Mic,
      action: onOpenVoiceoverModal,
      color: 'text-rose-400',
    },
    {
      id: 'speed',
      label: 'Velocidad',
      icon: Gauge,
      action: onOpenSpeedModal,
      color: 'text-orange-400',
    },
    {
      id: 'sticker',
      label: 'Sticker',
      icon: Smile,
      action: onOpenStickerModal,
      color: 'text-yellow-400',
    },
    {
      id: 'canvas',
      label: 'Formato',
      icon: Ratio,
      action: onOpenAspectModal,
      color: 'text-blue-400',
    },
  ];

  return (
    <div className="h-16 bg-[#0c0f16] border-t border-slate-800 px-2 flex items-center overflow-x-auto gap-1 select-none z-20 pb-safe">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.id}
            onClick={tool.action}
            disabled={tool.disabled}
            className={`min-w-[56px] min-h-[48px] px-2 py-1 flex flex-col items-center justify-center rounded-xl transition-all shrink-0 active:scale-95 ${
              tool.disabled
                ? 'opacity-35 cursor-not-allowed text-slate-500'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            } ${tool.highlight && canSplit ? 'bg-indigo-950/70 border border-indigo-700/60 shadow-sm' : ''}`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${tool.color}`} />
            <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
              {tool.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
