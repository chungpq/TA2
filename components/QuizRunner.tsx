import React, { useState, useEffect } from 'react';
import { Exercise, QuestionItem } from '../types';
import { ArrowLeft, Check, X, ArrowRight } from 'lucide-react';
import { MatchingGame } from './MatchingGame';

interface Props {
  exercise: Exercise;
  onComplete: (id: string, score: number, maxScore: number) => void;
  onBack: () => void;
}

export const QuizRunner: React.FC<Props> = ({ exercise, onComplete, onBack }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  // For rearrange questions, we might need pre-processed shuffled words
  const [shuffledOptions, setShuffledOptions] = useState<Record<number, string[]>>({});

  useEffect(() => {
    if (exercise.type === 'rearrange' && exercise.items) {
      const newShuffled: Record<number, string[]> = {};
      exercise.items.forEach((item, idx) => {
        // Simple shuffle of the question string (which usually contains slashed parts "I/go/school")
        // Or if the question is "I/go", we split by /. 
        // If question is a full sentence to rearrange, we split by space.
        // Based on JSON: "always/ at nine o’clock/..." -> split by /
        if (!item.question) return;

        let parts = item.question.split('/');
        if (parts.length === 1) parts = item.question.split(' ');
        
        // Shuffle
        for (let i = parts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [parts[i], parts[j]] = [parts[j], parts[i]];
        }
        newShuffled[idx] = parts.map(s => s.trim());
      });
      setShuffledOptions(newShuffled);
    }
  }, [exercise]);

  const handleTextChange = (index: number, value: string) => {
    setUserAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleOptionSelect = (index: number, value: string) => {
    setUserAnswers(prev => ({ ...prev, [index]: value }));
  };

  const calculateScore = () => {
    if (!exercise.items) return 0;
    let correct = 0;
    exercise.items.forEach((item, index) => {
      const userAns = (userAnswers[index] || '').trim().toLowerCase();
      // Simple normalization for check
      const correctAns = item.correct_answer.trim().toLowerCase();
      
      // For rewrite/rearrange, exact match might be strict, but we'll stick to it for now
      // Removing punctuation for softer check could be an improvement
      const normalize = (s: string) => s.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");
      
      if (normalize(userAns) === normalize(correctAns)) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = () => {
    const score = calculateScore();
    const max = exercise.items?.length || 0;
    setShowResults(true);
    // Delay slightly to let user see feedback before navigating away if we wanted auto-nav, 
    // but here we show a "Finish" button.
  };
  
  const handleFinish = () => {
     const score = calculateScore();
     const max = exercise.items?.length || 0;
     onComplete(exercise.id, score, max);
  };

  // Special renderer for Matching
  if (exercise.type === 'matching' && exercise.pairs) {
      return (
        <MatchingGame 
            pairs={exercise.pairs} 
            instruction={exercise.instruction}
            onComplete={(score) => onComplete(exercise.id, score, exercise.pairs!.length)}
            onBack={onBack}
        />
      );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full">
          <ArrowLeft />
        </button>
        <div>
           <h2 className="text-xl font-bold text-gray-800">{exercise.topic || "Exercise"}</h2>
           <p className="text-gray-500 text-sm">{exercise.instruction}</p>
        </div>
      </div>

      {exercise.items?.map((item, index) => {
        const isCorrect = (userAnswers[index] || '').trim().toLowerCase().replace(/[.,]/g, '') === item.correct_answer.trim().toLowerCase().replace(/[.,]/g, '');
        
        return (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded text-sm">Q{index + 1}</span>
                {showResults && (
                    isCorrect 
                    ? <span className="text-green-500 flex items-center"><Check size={18} className="mr-1"/> Correct</span> 
                    : <span className="text-red-500 flex items-center"><X size={18} className="mr-1"/> Incorrect</span>
                )}
            </div>

            {item.question && (
              <p className="text-lg font-medium text-gray-800 mb-4">{item.question}</p>
            )}

            {/* --- RENDER INPUT TYPES --- */}
            
            {/* 1. Multiple Choice / Phonetics */}
            {(exercise.type === 'multiple_choice' || exercise.type === 'phonetics_odd_one_out' || exercise.type === 'cloze_test') && item.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => !showResults && handleOptionSelect(index, opt)}
                    disabled={showResults}
                    className={`p-3 rounded-lg border text-left transition-all
                      ${userAnswers[index] === opt 
                        ? (showResults 
                            ? (opt.toLowerCase() === item.correct_answer.toLowerCase() ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800')
                            : 'bg-primary/10 border-primary text-primary font-bold') 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }
                      ${showResults && opt.toLowerCase() === item.correct_answer.toLowerCase() && 'bg-green-100 border-green-500 ring-2 ring-green-200'}
                    `}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* 2. Fill in Blank / Conjugation / Rewrite */}
            {(exercise.type === 'fill_in_blank' || exercise.type === 'conjugation' || exercise.type === 'rewrite') && (
              <div className="space-y-2">
                 <input
                    type="text"
                    value={userAnswers[index] || ''}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    disabled={showResults}
                    placeholder="Type answer here..."
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none
                        ${showResults 
                            ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                            : 'border-gray-300'
                        }
                    `}
                 />
                 {showResults && !isCorrect && (
                     <div className="text-sm text-green-600 font-medium mt-2">
                        Correct Answer: {item.correct_answer}
                     </div>
                 )}
              </div>
            )}

            {/* 3. Rearrange */}
            {exercise.type === 'rearrange' && shuffledOptions[index] && (
               <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                     {(userAnswers[index] || '').split(' ').filter(Boolean).map((word, wordIdx) => (
                        <button 
                            key={wordIdx}
                            disabled={showResults}
                            onClick={() => {
                                if(showResults) return;
                                // Remove word from answer
                                const current = (userAnswers[index] || '').split(' ').filter(Boolean);
                                current.splice(wordIdx, 1);
                                handleTextChange(index, current.join(' '));
                            }}
                            className="bg-white px-3 py-1 rounded shadow-sm border border-gray-200 hover:bg-red-50 text-sm"
                        >
                            {word}
                        </button>
                     ))}
                  </div>
                  <div className="text-xs text-gray-500">Tap words below to build the sentence:</div>
                  <div className="flex flex-wrap gap-2">
                      {shuffledOptions[index].map((word, wIdx) => (
                          <button
                            key={wIdx}
                            disabled={showResults}
                            onClick={() => {
                                const current = (userAnswers[index] || '');
                                handleTextChange(index, current ? current + ' ' + word : word);
                            }}
                            className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-100 font-medium transition-colors"
                          >
                             {word}
                          </button>
                      ))}
                  </div>
                   {showResults && !isCorrect && (
                     <div className="text-sm text-green-600 font-medium mt-2">
                        Correct: {item.correct_answer}
                     </div>
                 )}
               </div>
            )}

          </div>
        );
      })}

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-lg flex justify-end">
          <div className="max-w-7xl mx-auto w-full flex justify-end">
            {!showResults ? (
                <button 
                    onClick={handleSubmit}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform active:scale-95 flex items-center"
                >
                    Check Answers
                </button>
            ) : (
                <button 
                    onClick={handleFinish}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform active:scale-95 flex items-center"
                >
                    Complete & Save <ArrowRight className="ml-2" />
                </button>
            )}
          </div>
      </div>
    </div>
  );
};