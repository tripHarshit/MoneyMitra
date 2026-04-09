import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserLevel } from '../services/userService';
import { generateLesson } from '../geminiService';
import { GraduationCap, ArrowLeft, CheckCircle2, XCircle, Award, ArrowRight } from 'lucide-react';

const LearningHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  
  const [lessonData, setLessonData] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizResult, setQuizResult] = useState(null); // 'correct' | 'incorrect' | null
  const [leveledUp, setLeveledUp] = useState(false);

  // Initialize and load user data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          const currentLev = profile.currentLevel || 1;
          setLevel(currentLev);
          setXp(profile.totalXP || 0);
          setUserDetails({
            occupation: profile.preferences?.occupation || 'Student',
            ageGroup: profile.preferences?.ageGroup || '18-24',
            primaryGoal: profile.preferences?.financialGoal || 'save'
          });
          
          fetchLesson({
            occupation: profile.preferences?.occupation || 'Student',
            ageGroup: profile.preferences?.ageGroup || '18-24',
            primaryGoal: profile.preferences?.financialGoal || 'save'
          }, currentLev);
        }
      } catch (error) {
        console.error('Error loading profile for learning hub:', error);
      }
    };
    loadData();
  }, [user]);

  const fetchLesson = async (details, targetLevel) => {
    setLoading(true);
    setQuizMode(false);
    setSelectedOption(null);
    setQuizResult(null);
    setLeveledUp(false);
    try {
      const data = await generateLesson(details, targetLevel);
      setLessonData(data);
    } catch (error) {
      console.error('Lesson generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (index) => {
    if (quizResult === 'correct') return; // prevent changing after correct
    setSelectedOption(index);
  };

  const checkAnswer = async () => {
    if (selectedOption === null || !lessonData?.quiz) return;
    
    // Default to index 0 if correctIndex is not provided
    const correctIndex = lessonData.quiz.correctIndex !== undefined ? lessonData.quiz.correctIndex : 0;
    if (selectedOption === correctIndex) {
      setQuizResult('correct');
      // Update level and XP in Firestore
      try {
        const newLevel = level + 1;
        const xpEarned = 50; // Award 50 XP per level
        await updateUserLevel(user.uid, newLevel, xpEarned);
        setLevel(newLevel);
        setXp(xp + xpEarned);
        setLeveledUp(true);
      } catch (error) {
        console.error('Error updating level:', error);
      }
    } else {
      setQuizResult('incorrect');
    }
  };

  const nextLevel = () => {
    fetchLesson(userDetails, level); // level was already incremented
  };

  // Custom markdown styled components mirroring MessageBubble
  const markdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-xl font-semibold mt-4 mb-2 text-indigo-300" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-lg font-semibold mt-3 mb-2 text-indigo-300" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-3 mb-2 text-indigo-300" {...props} />,
    strong: ({node, ...props}) => <strong className="font-semibold text-emerald-400" {...props} />,
    p: ({node, ...props}) => <p className="my-3 text-gray-300 leading-relaxed text-[15px]" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside my-3 space-y-2 text-gray-300" {...props} />,
    li: ({node, ...props}) => <li className="ml-2" {...props} />,
  };

  return (
    <div className="min-h-screen bg-[#0F1115] p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl overflow-y-auto chat-scroll pb-20">
        
        {/* Header & Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-all font-medium py-2"
          >
            <ArrowLeft size={20} /> Dashboard
          </button>
          
          <div className="flex items-center gap-4 bg-[#1A1D23] px-4 py-2 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-indigo-400" size={20} />
              <span className="text-white font-semibold flex items-center gap-1">Level <span className="text-indigo-400 bg-indigo-500/10 px-2 rounded-md">{level}</span></span>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <Award className="text-amber-400" size={20} />
              <span className="text-white font-semibold font-mono">{xp} XP</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
             <div className="h-10 rounded-xl shimmer w-1/2"></div>
             <div className="h-32 rounded-2xl shimmer w-full"></div>
             <div className="h-32 rounded-2xl shimmer w-full"></div>
          </div>
        ) : lessonData ? (
          <div className="space-y-6 animate-fade-in">
            {/* Lesson Content Area */}
            {!quizMode && (
              <div className="glass p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none blur-2xl"></div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-6">{lessonData.title}</h1>
                <div className="prose prose-sm max-w-none prose-invert mb-8">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {lessonData.content}
                  </ReactMarkdown>
                </div>
                
                <button
                  onClick={() => setQuizMode(true)}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-1"
                >
                  Take the Quiz to Level Up!
                </button>
              </div>
            )}

            {/* Quiz Mode Area */}
            {quizMode && (
              <div className="space-y-6">
                <div className="glass p-8 rounded-3xl border border-white/5 shadow-2xl">
                  <h2 className="text-2xl font-bold text-white mb-6">Knowledge Check</h2>
                  <p className="text-lg text-gray-200 mb-8 font-medium">{lessonData.quiz?.question || "Are you ready to test your knowledge?"}</p>
                  
                  <div className="space-y-3 mb-8">
                    {(lessonData.quiz?.options || []).map((option, index) => {
                      const isSelected = selectedOption === index;
                      const isCorrect = lessonData.quiz?.correctIndex === index;
                      const showResult = quizResult !== null;
                      
                      let btnStyle = "bg-[#1A1D23] border border-white/5 hover:border-indigo-500/50 hover:bg-[#22262E] text-gray-300";
                      
                      if (isSelected && !showResult) {
                        btnStyle = "bg-indigo-500/20 border border-indigo-500 text-white ring-2 ring-indigo-500/20";
                      } else if (showResult) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500/20 border border-emerald-500 text-emerald-100";
                        } else if (isSelected && !isCorrect) {
                          btnStyle = "bg-red-500/20 border border-red-500 text-red-100";
                        }
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(index)}
                          className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 font-medium ${btnStyle}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {!showResult ? (
                    <button
                      onClick={checkAnswer}
                      disabled={selectedOption === null}
                      className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 transition-all font-medium text-lg"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <div className="animate-fade-in">
                      {quizResult === 'correct' ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center">
                          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                          <h3 className="text-2xl font-bold text-emerald-400 mb-2">Level Up!</h3>
                          <p className="text-emerald-100/80 mb-4">{lessonData.quiz?.explanation || "Great job! You mastered this concept."}</p>
                          <button
                            onClick={nextLevel}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all mt-2"
                          >
                            Continue to Level {level} <ArrowRight size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-center">
                          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                          <h3 className="text-xl font-bold text-red-400 mb-2">Not quite right</h3>
                          <p className="text-red-100/80 mb-4">Try reviewing the lesson material and giving it another shot.</p>
                          <button
                            onClick={() => {
                              setSelectedOption(null);
                              setQuizResult(null);
                            }}
                            className="px-6 py-3 bg-[#22262E] hover:bg-[#2A2E35] text-white rounded-xl font-semibold transition-all"
                          >
                            Try Again
                          </button>
                          <button
                            onClick={() => setQuizMode(false)}
                            className="px-6 py-3 bg-transparent text-gray-400 hover:text-white rounded-xl font-bold transition-all mt-2 ml-4"
                          >
                            Read Lesson Again
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center mt-20 text-gray-400">
            Failed to load lesson. Please refresh.
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningHub;
