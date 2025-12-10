import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Home, Award } from 'lucide-react';

interface Props {
  onHome: () => void;
  xp: number;
}

export const ResultsView: React.FC<Props> = ({ onHome, xp }) => {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#EC4899', '#F59E0B']
    });
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
       <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-4 relative">
          <Award size={64} className="text-yellow-600" />
          <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
            + XP
          </div>
       </div>

       <h2 className="text-4xl font-extrabold text-gray-800">Great Job!</h2>
       <p className="text-gray-500 max-w-md text-lg">
         You've completed this activity successfully. Your total XP is now <span className="text-primary font-bold">{xp}</span>.
       </p>

       <button
        onClick={onHome}
        className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all hover:scale-105"
       >
         <Home size={20} />
         <span>Back to Dashboard</span>
       </button>
    </div>
  );
};