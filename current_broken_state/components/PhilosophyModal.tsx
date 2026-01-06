import React, { useMemo } from 'react';
import { BrainCircuitIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PhilosophySection: React.FC<{ title: string; items: string[]; titleColor: string; }> = ({ title, items, titleColor }) => (
    <div>
        <h4 className={`font-bold text-lg mb-3 ${titleColor}`}>{title}</h4>
        <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] font-mono list-disc list-inside">
            {items.map((item, index) => <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/(".*?")/g, '<span class="text-[var(--color-text)]">$&</span>') }}></li>)}
        </ul>
    </div>
);

const PhilosophyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    
    const anjuran = [
        "Plan your trade, trade your plan.",
        "Always use a Stop Loss.",
        "Focus on Risk-Reward Ratio (RRR).",
        "Let your winners run, cut your losers short.",
        "Trade with the trend, not against it.",
    ];

    const larangan = [
        "Do not overtrade or overleverage.",
        "Never trade based on emotions (FOMO/FUD).",
        "Don't revenge trade after a loss.",
        "Don't risk more than you can afford to lose.",
        "Avoid trading on low-quality setups.",
    ];

    const motivasi = [
        `"The market is a device for transferring money from the impatient to the patient." - W. Buffett`,
        `"The goal of a successful trader is to make the best trades. Money is secondary." - A. Elder`,
        `"I'm always thinking about losing money as opposed to making money." - Paul Tudor Jones`,
    ];


  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-[var(--color-bg)]/70 backdrop-blur-2xl border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-text)] tracking-wide flex items-center gap-3">
            <BrainCircuitIcon />
            Trading Philosophy
          </h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-[var(--color-text-secondary)] transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto text-[var(--color-text-secondary)] text-sm">
            <div className="space-y-8">
                <PhilosophySection title="Anjuran (Core Advice)" items={anjuran} titleColor="text-green-400" />
                <PhilosophySection title="Larangan (Prohibitions)" items={larangan} titleColor="text-red-400" />
                <PhilosophySection title="Motivasi (Motivation)" items={motivasi} titleColor="text-yellow-400" />
            </div>
        </main>
      </div>
       <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
          .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default PhilosophyModal;
