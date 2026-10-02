import React from 'react';
import { X, Smartphone, Scissors, Sparkles, Mic, Download, Type } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: Scissors,
      title: 'Corte de Precisión (Split)',
      desc: 'Mueve el cabezal rojo al punto exacto y toca "Cortar" o usa el botón de la barra inferior para dividir el clip.',
      color: 'text-indigo-400 bg-indigo-950/60',
    },
    {
      icon: Type,
      title: 'Subtítulos & Arrastre Libre',
      desc: 'Añade textos animados y arrástralos directamente con el dedo o mouse sobre el reproductor de video para posicionarlos.',
      color: 'text-amber-400 bg-amber-950/60',
    },
    {
      icon: Sparkles,
      title: 'LUTs Cinemáticos & Ajustes',
      desc: 'Aplica estilos de color Cyberpunk, Atardecer, Noir o Blockbuster y ajusta brillo, contraste, saturación y viñeta.',
      color: 'text-purple-400 bg-purple-950/60',
    },
    {
      icon: Mic,
      title: 'Grabador de Voz en Off',
      desc: 'Graba tu voz en directo con el micrófono del celular y colócala al instante como pista de narración en el video.',
      color: 'text-rose-400 bg-rose-950/60',
    },
    {
      icon: Smartphone,
      title: 'Modo Android & PWA Instalable',
      desc: 'Cambia entre el marco de smartphone Android y pantalla completa. Instálalo como app nativa en tu teléfono Android.',
      color: 'text-emerald-400 bg-emerald-950/60',
    },
    {
      icon: Download,
      title: 'Exportación 4K sin Marca de Agua',
      desc: 'Renderiza directamente en tu navegador en 4K, 1080p o 720p a 30 o 60 FPS con formatos listos para Reels, TikTok o YouTube.',
      color: 'text-sky-400 bg-sky-950/60',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-['Syne']">
            Guía de NovaCut Pro para Android
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl flex items-start gap-3"
              >
                <div className={`p-2 rounded-lg shrink-0 ${feat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{feat.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c0f16]">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            ¡Entendido, empezar a editar!
          </button>
        </div>
      </div>
    </div>
  );
};
