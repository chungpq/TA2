import React, { useState, useEffect } from 'react';
import { LEARNING_DATA } from './constants';
import { Section, Exercise, UserProgress } from './types';
import { BookOpen, Star, Award, ChevronRight, Home, BrainCircuit, GraduationCap } from 'lucide-react';
import { VocabularyViewer } from './components/VocabularyViewer';
import { QuizRunner } from './components/QuizRunner';
import { ResultsView } from './components/ResultsView';
import {  ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

enum AppView {
  DASHBOARD,
  VOCABULARY,
  EXERCISE,
  RESULT
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('english_explorer_progress');
    return saved ? JSON.parse(saved) : { xp: 0, completedSections: [], scores: {}, difficultWords: [] };
  });

  useEffect(() => {
    localStorage.setItem('english_explorer_progress', JSON.stringify(progress));
  }, [progress]);

  const handleStartSection = (section: Section, exercise?: Exercise) => {
    setActiveSection(section);
    if (section.section_type === 'vocabulary') {
      setCurrentView(AppView.VOCABULARY);
    } else if (exercise) {
        setActiveExercise(exercise);
        setCurrentView(AppView.EXERCISE);
    }
  };

  const handleCompleteActivity = (id: string, score: number, maxScore: number) => {
    const newXp = Math.floor((score / maxScore) * 100);
    const hasCompletedBefore = progress.completedSections.includes(id);
    
    // Only give full XP first time, 10% for replay
    const xpGain = hasCompletedBefore ? Math.ceil(newXp * 0.1) : newXp;

    setProgress(prev => ({
      ...prev,
      xp: prev.xp + xpGain,
      completedSections: hasCompletedBefore ? prev.completedSections : [...prev.completedSections, id],
      scores: { ...prev.scores, [id]: Math.max(prev.scores[id] || 0, newXp) }
    }));
    
    // Pass results to result view if needed, but for now we just go back to dashboard or show a modal
    // Simple flow: Go to Results View
    setCurrentView(AppView.RESULT);
  };

  const handleToggleDifficult = (word: string) => {
    setProgress(prev => {
      const current = prev.difficultWords || [];
      const updated = current.includes(word)
        ? current.filter(w => w !== word)
        : [...current, word];
      return { ...prev, difficultWords: updated };
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.VOCABULARY:
        return activeSection?.items ? (
          <VocabularyViewer 
            items={activeSection.items} 
            onBack={() => setCurrentView(AppView.DASHBOARD)} 
            difficultWords={progress.difficultWords || []}
            onToggleDifficult={handleToggleDifficult}
          />
        ) : null;
      
      case AppView.EXERCISE:
        return activeExercise ? (
          <QuizRunner 
            exercise={activeExercise}
            onComplete={handleCompleteActivity}
            onBack={() => setCurrentView(AppView.DASHBOARD)}
          />
        ) : null;
      
      case AppView.RESULT:
        return (
           <ResultsView 
             onHome={() => setCurrentView(AppView.DASHBOARD)}
             xp={progress.xp}
           />
        );

      case AppView.DASHBOARD:
      default:
        return (
          <Dashboard 
            progress={progress} 
            onStartVocabulary={(s) => handleStartSection(s)}
            onStartExercise={(s, e) => handleStartSection(s, e)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-gray-800 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView(AppView.DASHBOARD)}>
            <div className="bg-primary text-white p-2 rounded-lg">
               <BookOpen size={24} />
            </div>
            <span className="font-bold text-xl text-primary hidden sm:inline">{LEARNING_DATA.unit_info.unit_title}</span>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="flex items-center bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full border border-yellow-300">
                <Star className="w-4 h-4 mr-1 fill-current" />
                <span className="font-bold">{progress.xp} XP</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

// --- Sub Components ---

const Dashboard: React.FC<{
  progress: UserProgress;
  onStartVocabulary: (section: Section) => void;
  onStartExercise: (section: Section, exercise: Exercise) => void;
}> = ({ progress, onStartVocabulary, onStartExercise }) => {
  
  const completionRate = (progress.completedSections.length / 15) * 100; // Approx total activities
  
  const data = [
    { name: 'Completed', value: progress.completedSections.length },
    { name: 'Remaining', value: 15 - progress.completedSections.length },
  ];
  const COLORS = ['#10B981', '#E5E7EB'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-indigo-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2">Welcome Back, Student!</h1>
          <p className="opacity-90">Ready to master Unit 1: {LEARNING_DATA.unit_info.unit_title}?</p>
          <div className="mt-6 flex items-center space-x-2">
            <div className="w-full max-w-xs bg-white/20 rounded-full h-3">
              <div 
                className="bg-accent h-3 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold">{Math.round(completionRate)}% Complete</span>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
          <Award size={200} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content List */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <BrainCircuit className="mr-2 text-primary" /> Learning Path
          </h2>
          
          <div className="space-y-4">
            {LEARNING_DATA.content.map((section, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-gray-700 capitalize flex items-center">
                    {section.section_type === 'vocabulary' && <BookOpen className="w-5 h-5 mr-2 text-secondary" />}
                    {section.section_type === 'grammar_exercises' && <BrainCircuit className="w-5 h-5 mr-2 text-primary" />}
                    {section.section_type === 'test' && <GraduationCap className="w-5 h-5 mr-2 text-red-500" />}
                    {section.title || section.test_name || section.topic || 'Section'}
                  </h3>
                </div>
                
                <div className="p-4">
                  {section.section_type === 'vocabulary' && (
                     <button 
                        onClick={() => onStartVocabulary(section)}
                        className="w-full flex items-center justify-between p-4 bg-secondary/10 hover:bg-secondary/20 rounded-xl transition-colors group text-left"
                      >
                        <div>
                          <p className="font-bold text-secondary">Flashcards & Pronunciation</p>
                          <p className="text-sm text-gray-500">{section.items?.length} words</p>
                        </div>
                        <ChevronRight className="text-secondary group-hover:translate-x-1 transition-transform" />
                     </button>
                  )}

                  {section.section_type !== 'vocabulary' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(section.exercises || section.questions || []).map((ex) => {
                         const isDone = progress.completedSections.includes(ex.id);
                         const score = progress.scores[ex.id];
                         return (
                          <button 
                            key={ex.id}
                            onClick={() => onStartExercise(section, ex)}
                            className={`p-3 rounded-lg border text-left transition-all hover:shadow-md flex items-center justify-between
                              ${isDone ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-primary/50'}
                            `}
                          >
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${isDone ? 'text-green-800' : 'text-gray-700'}`}>
                                  {ex.type.replace(/_/g, ' ').toUpperCase()}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{ex.instruction}</p>
                            </div>
                            {isDone && (
                              <div className="ml-2 bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                                {score}%
                              </div>
                            )}
                          </button>
                         )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-4">Your Progress</h3>
              <div className="h-48 w-full flex justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-center">
                 <p className="text-3xl font-bold text-primary">{progress.xp}</p>
                 <p className="text-sm text-gray-500 uppercase tracking-wide">Total XP</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;