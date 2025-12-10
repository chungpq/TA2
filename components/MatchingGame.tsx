import React, { useState, useEffect } from 'react';
import { MatchingPair } from '../types';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface Props {
  pairs: MatchingPair[];
  instruction: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export const MatchingGame: React.FC<Props> = ({ pairs, instruction, onComplete, onBack }) => {
  const [leftItems, setLeftItems] = useState<{id: number, text: string}[]>([]);
  const [rightItems, setRightItems] = useState<{id: number, text: string}[]>([]);
  
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]); // Store IDs of matched left items
  const [wrongAttempt, setWrongAttempt] = useState(false);

  useEffect(() => {
    // Initialize
    const left = pairs.map((p, i) => ({ id: i, text: p.question }));
    // Shuffle right
    const right = pairs.map((p, i) => ({ id: i, text: p.answer }));
    for (let i = right.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [right[i], right[j]] = [right[j], right[i]];
    }
    setLeftItems(left);
    setRightItems(right);
  }, [pairs]);

  const handleLeftClick = (id: number) => {
    if (matchedPairs.includes(id)) return;
    setSelectedLeft(id);
    setWrongAttempt(false);
  };

  const handleRightClick = (id: number) => {
    if (selectedLeft === null || matchedPairs.includes(id)) return;

    if (selectedLeft === id) {
        // Match!
        const newMatched = [...matchedPairs, id];
        setMatchedPairs(newMatched);
        setSelectedLeft(null);

        if (newMatched.length === pairs.length) {
            setTimeout(() => {
                onComplete(pairs.length);
            }, 1000);
        }
    } else {
        // Wrong
        setWrongAttempt(true);
        setTimeout(() => setWrongAttempt(false), 500);
        setSelectedLeft(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
       <div className="flex items-center space-x-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full">
          <ArrowLeft />
        </button>
        <div>
           <h2 className="text-xl font-bold text-gray-800">Matching Game</h2>
           <p className="text-gray-500">{instruction}</p>
        </div>
      </div>

      <div className="flex justify-between gap-8 relative">
         {/* Wrong feedback overlay */}
         {wrongAttempt && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-red-500 text-white px-6 py-2 rounded-full font-bold animate-bounce">
                    Try Again!
                </div>
            </div>
         )}

         {/* Left Column */}
         <div className="flex-1 space-y-4">
            {leftItems.map((item) => {
                const isMatched = matchedPairs.includes(item.id);
                const isSelected = selectedLeft === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => handleLeftClick(item.id)}
                        disabled={isMatched}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                            ${isMatched 
                                ? 'bg-green-100 border-green-400 text-green-800 opacity-50' 
                                : isSelected 
                                    ? 'bg-blue-50 border-blue-500 shadow-md scale-105'
                                    : 'bg-white border-gray-200 hover:border-blue-300'
                            }
                        `}
                    >
                        {item.text}
                    </button>
                );
            })}
         </div>

         {/* Right Column */}
         <div className="flex-1 space-y-4">
            {rightItems.map((item) => {
                const isMatched = matchedPairs.includes(item.id);
                return (
                    <button
                        key={item.id}
                        onClick={() => handleRightClick(item.id)}
                        disabled={isMatched}
                         className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                            ${isMatched 
                                ? 'bg-green-100 border-green-400 text-green-800 opacity-50' 
                                : 'bg-white border-gray-200 hover:border-blue-300'
                            }
                        `}
                    >
                        {item.text}
                        {isMatched && <CheckCircle size={16} className="inline ml-2"/>}
                    </button>
                );
            })}
         </div>
      </div>
    </div>
  );
};