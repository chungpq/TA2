import React, { useState, useEffect, useMemo } from 'react';
import { VocabularyItem } from '../types';
import { Volume2, ArrowLeft, RefreshCw, Star, ChevronLeft, ChevronRight, LayoutGrid, RectangleHorizontal, Filter } from 'lucide-react';

interface Props {
  items: VocabularyItem[];
  onBack: () => void;
  difficultWords: string[];
  onToggleDifficult: (word: string) => void;
}

export const VocabularyViewer: React.FC<Props> = ({ items, onBack, difficultWords, onToggleDifficult }) => {
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null); // For Grid
  const [isSingleFlipped, setIsSingleFlipped] = useState(false); // For Single
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDifficultOnly, setShowDifficultOnly] = useState(false);

  // Filter items based on difficulty toggle
  const displayItems = useMemo(() => {
    if (showDifficultOnly) {
      return items.filter(item => difficultWords.includes(item.word));
    }
    return items;
  }, [items, showDifficultOnly, difficultWords]);

  // Reset index when filter changes to avoid out of bounds
  useEffect(() => {
    setCurrentIndex(0);
    setIsSingleFlipped(false);
    setFlippedIndex(null);
  }, [showDifficultOnly, viewMode]);

  const speak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    setIsSingleFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % displayItems.length);
  };

  const handlePrev = () => {
    setIsSingleFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
  };

  const toggleSingleFlip = () => {
    setIsSingleFlipped(!isSingleFlipped);
  };

  const handleGridCardClick = (index: number) => {
    setFlippedIndex(flippedIndex === index ? null : index);
  };

  // Safe check for current item in single view
  const currentItem = displayItems[currentIndex];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Vocabulary Flashcards</h2>
            <p className="text-sm text-gray-500">
               {displayItems.length} words {showDifficultOnly && '(Filtered)'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
           <button 
             onClick={() => setShowDifficultOnly(!showDifficultOnly)}
             className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
               showDifficultOnly 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'text-gray-600 hover:bg-gray-100'
             }`}
           >
              <Filter size={16} className="mr-1.5" />
              Difficult Only
           </button>
           <div className="w-px h-6 bg-gray-200 mx-1"></div>
           <button 
             onClick={() => setViewMode('single')}
             className={`p-1.5 rounded-md transition-colors ${viewMode === 'single' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
             title="Single Card View"
           >
             <RectangleHorizontal size={20} />
           </button>
           <button 
             onClick={() => setViewMode('grid')}
             className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
             title="Grid View"
           >
             <LayoutGrid size={20} />
           </button>
        </div>
      </div>

      {displayItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
             <Star className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-700">No words found</h3>
          <p className="text-gray-500">
            {showDifficultOnly 
              ? "You haven't marked any words as difficult yet." 
              : "This section has no vocabulary items."}
          </p>
          {showDifficultOnly && (
             <button 
               onClick={() => setShowDifficultOnly(false)}
               className="mt-4 text-primary font-bold hover:underline"
             >
               View all words
             </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'single' && (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md perspective-container relative mb-8">
                 {/* Card Container */}
                 <div 
                    className={`flip-card h-80 w-full cursor-pointer group ${isSingleFlipped ? 'flipped' : ''}`}
                    onClick={toggleSingleFlip}
                  >
                    <div className="flip-card-inner relative w-full h-full text-center transition-transform duration-500 shadow-xl rounded-3xl">
                      
                      {/* Front */}
                      <div className="flip-card-front absolute w-full h-full bg-white rounded-3xl flex flex-col items-center justify-center p-8 border border-gray-100">
                         {/* Controls on card */}
                         <div className="absolute top-4 right-4 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleDifficult(currentItem.word);
                              }}
                              className={`p-2 rounded-full transition-all ${
                                difficultWords.includes(currentItem.word) 
                                  ? 'text-yellow-400 hover:bg-yellow-50' 
                                  : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-50'
                              }`}
                            >
                               <Star size={24} fill={difficultWords.includes(currentItem.word) ? "currentColor" : "none"} />
                            </button>
                         </div>
                         <div className="absolute top-4 left-4">
                           <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                              {currentItem.type}
                           </span>
                         </div>

                        <h3 className="text-4xl font-extrabold text-gray-800 mb-3">{currentItem.word}</h3>
                        <p className="text-xl text-gray-500 font-serif italic mb-8">{currentItem.pronunciation}</p>
                        
                        <button 
                          onClick={(e) => speak(currentItem.word, e)}
                          className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition shadow-lg hover:scale-105 active:scale-95"
                        >
                          <Volume2 size={32} />
                        </button>
                        
                        <div className="absolute bottom-6 text-gray-400 text-sm flex items-center animate-pulse">
                            <RefreshCw size={14} className="mr-1" /> Tap to flip
                        </div>
                      </div>

                      {/* Back */}
                      <div className="flip-card-back absolute w-full h-full bg-gradient-to-br from-primary to-indigo-600 text-white rounded-3xl flex flex-col items-center justify-center p-8">
                         <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleDifficult(currentItem.word);
                                }}
                                className="p-2 text-white/80 hover:text-white transition-colors"
                            >
                                <Star size={24} fill={difficultWords.includes(currentItem.word) ? "currentColor" : "none"} />
                            </button>
                         </div>
                         <h3 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-6">Meaning</h3>
                         <p className="text-3xl font-bold text-center leading-relaxed">{currentItem.meaning}</p>
                      </div>

                    </div>
                  </div>
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between w-full max-w-md bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                  <button 
                    onClick={handlePrev}
                    className="p-3 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                  >
                     <ChevronLeft size={24} />
                  </button>
                  <span className="font-bold text-gray-400 font-mono">
                    {currentIndex + 1} / {displayItems.length}
                  </span>
                  <button 
                    onClick={handleNext}
                    className="p-3 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                  >
                     <ChevronRight size={24} />
                  </button>
              </div>
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayItems.map((item, index) => (
                <div 
                  key={item.word} // Use word as key for stability
                  className={`flip-card h-64 cursor-pointer ${flippedIndex === index ? 'flipped' : ''}`}
                  onClick={() => handleGridCardClick(index)}
                >
                  <div className="flip-card-inner relative w-full h-full text-center transition-transform duration-500 shadow-lg rounded-2xl">
                    
                    {/* Front */}
                    <div className="flip-card-front absolute w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center p-6 border-2 border-primary/10">
                      <div className="absolute top-3 right-3 z-10">
                         <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleDifficult(item.word);
                            }}
                            className={`p-1.5 rounded-full transition-all ${
                                difficultWords.includes(item.word) 
                                  ? 'text-yellow-400' 
                                  : 'text-gray-200 hover:text-yellow-400'
                            }`}
                         >
                            <Star size={20} fill={difficultWords.includes(item.word) ? "currentColor" : "none"} />
                         </button>
                      </div>
                      
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mb-4">
                        {item.type}
                      </span>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2 truncate max-w-full px-2">{item.word}</h3>
                      <p className="text-gray-500 font-serif italic mb-6">{item.pronunciation}</p>
                      <button 
                        onClick={(e) => speak(item.word, e)}
                        className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition shadow-md group"
                      >
                        <Volume2 size={20} className="group-active:scale-90 transition-transform" />
                      </button>
                    </div>

                    {/* Back */}
                    <div className="flip-card-back absolute w-full h-full bg-gradient-to-br from-primary to-indigo-600 text-white rounded-2xl flex flex-col items-center justify-center p-6">
                       <h3 className="text-xl font-bold mb-4">Meaning</h3>
                       <p className="text-lg text-center font-medium leading-relaxed">{item.meaning}</p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};