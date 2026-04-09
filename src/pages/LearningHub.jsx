import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserLevel } from '../services/userService';
import { generateLesson } from '../geminiService';
import { ArrowLeft, CheckCircle2, XCircle, Sparkles, Lock, Award, BookOpen, TrendingUp } from 'lucide-react';

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
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          const currentLev = profile.currentLevel || 1;
          setLevel(currentLev);
          setXp(profile.totalXP || 0);
          const details = {
            occupation: profile.preferences?.occupation || 'Student',
            ageGroup: profile.preferences?.ageGroup || '18-24',
            primaryGoal: profile.preferences?.financialGoal || 'save',
          };
          setUserDetails(details);
          fetchLesson(details, currentLev);
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
    if (quizResult === 'correct') return;
    setSelectedOption(index);
  };

  const checkAnswer = async () => {
    if (selectedOption === null || !lessonData?.quiz) return;

    const correctIndex = lessonData.quiz.correctIndex !== undefined ? lessonData.quiz.correctIndex : 0;

    if (selectedOption === correctIndex) {
      setQuizResult('correct');
      try {
        const newLevel = level + 1;
        const xpEarned = 50;
        await updateUserLevel(user.uid, newLevel, xpEarned);
        setLevel(newLevel);
        setXp((prev) => prev + xpEarned);
      } catch (error) {
        console.error('Error updating level:', error);
      }
    } else {
      setQuizResult('incorrect');
    }
  };

  const nextLevel = () => {
    fetchLesson(userDetails, level);
  };

  const markdownComponents = {
    h1: ({ node, ...props }) => <h1 className="mb-3 mt-4 text-2xl font-bold text-emerald-950" {...props} />,
    h2: ({ node, ...props }) => <h2 className="mb-3 mt-4 text-xl font-bold text-emerald-900" {...props} />,
    h3: ({ node, ...props }) => <h3 className="mb-2 mt-4 text-lg font-bold text-emerald-900" {...props} />,
    p: ({ node, ...props }) => <p className="my-3 leading-relaxed text-[#3d4a42]" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-semibold text-emerald-800" {...props} />,
    ul: ({ node, ...props }) => <ul className="my-3 list-inside list-disc space-y-1.5 text-[#3d4a42]" {...props} />,
    li: ({ node, ...props }) => <li className="ml-1" {...props} />,
  };

  const showResult = quizResult !== null;
  const options = lessonData?.quiz?.options || [];
  const correctIndex = lessonData?.quiz?.correctIndex !== undefined ? lessonData.quiz.correctIndex : 0;

  return (
    <div className="min-h-screen bg-[#f2fcf8] px-5 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white/80 px-6 py-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="rounded-full p-2 text-[#3d4a42] transition hover:bg-[#ecf6f2]"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-emerald-900">Learning Hub</h1>
              <p className="text-sm text-[#3d4a42]">Build wealth literacy with guided lessons and level-based challenges.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-[#ffdcc3]/40 px-3 py-1.5 text-xs font-bold text-[#6e3900]">
              <Award className="h-4 w-4" />
              {xp} XP
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
              <Sparkles className="h-4 w-4" />
              Level {level}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="h-14 rounded-2xl shimmer"></div>
              <div className="h-64 rounded-2xl shimmer"></div>
              <div className="h-56 rounded-2xl shimmer"></div>
            </div>
            <div className="space-y-4 lg:col-span-4">
              <div className="h-40 rounded-2xl shimmer"></div>
              <div className="h-64 rounded-2xl shimmer"></div>
            </div>
          </div>
        ) : lessonData ? (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              {!quizMode && (
                <section className="rounded-3xl border-l-8 border-emerald-700 bg-white p-8 panel-shadow md:p-10">
                  <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    <span>Module {level}</span>
                    <span className="h-1 w-1 rounded-full bg-emerald-300"></span>
                    <span>{userDetails?.primaryGoal || 'Financial Growth'}</span>
                  </div>

                  <article className="prose max-w-none">
                    <h2 className="font-headline mb-4 text-3xl font-extrabold leading-tight text-emerald-950">{lessonData.title}</h2>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {lessonData.content}
                    </ReactMarkdown>

                    <div className="my-6 flex gap-3 rounded-2xl border border-emerald-100 bg-[#ecf6f2] p-4">
                      <Sparkles className="h-5 w-5 shrink-0 text-emerald-700" />
                      <p className="text-sm text-[#3d4a42]">
                        AI Strategy Tip: connect this lesson with your goal <strong>{userDetails?.primaryGoal}</strong> for better long-term retention.
                      </p>
                    </div>
                  </article>
                </section>
              )}

              {!quizMode ? (
                <section className="rounded-3xl border border-emerald-100 bg-[#ecf6f2] p-8 md:p-10">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="font-headline text-2xl font-extrabold text-emerald-950">Quick Check</h3>
                      <p className="mt-1 text-sm text-[#3d4a42]">Test your understanding before unlocking the next level.</p>
                    </div>
                    <span className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                      Question 1 of 1
                    </span>
                  </div>

                  <button
                    onClick={() => setQuizMode(true)}
                    className="gradient-emerald w-full rounded-2xl py-4 text-sm font-bold text-white transition hover:brightness-105"
                  >
                    Start Quiz
                  </button>
                </section>
              ) : (
                <section className="rounded-3xl border border-emerald-100 bg-white p-8 panel-shadow md:p-10">
                  <div className="mb-7 flex items-center justify-between">
                    <h3 className="font-headline text-2xl font-extrabold text-emerald-950">Knowledge Check</h3>
                    <button
                      onClick={() => setQuizMode(false)}
                      className="rounded-lg border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      Back to Lesson
                    </button>
                  </div>

                  <p className="mb-6 text-lg font-semibold italic text-emerald-900">{lessonData.quiz?.question || 'What did you learn from this module?'}</p>

                  <div className="space-y-3">
                    {options.map((option, index) => {
                      const isSelected = selectedOption === index;
                      const isCorrect = index === correctIndex;

                      let style = 'border-emerald-100 bg-white text-emerald-900 hover:shadow-sm';
                      if (isSelected && !showResult) style = 'border-emerald-500 bg-emerald-50 text-emerald-900';
                      if (showResult && isCorrect) style = 'border-emerald-600 bg-emerald-100 text-emerald-900';
                      if (showResult && isSelected && !isCorrect) style = 'border-red-400 bg-red-50 text-red-800';

                      return (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(index)}
                          className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left text-sm font-medium transition ${style}`}
                        >
                          <span>{option}</span>
                          {showResult && isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : null}
                          {showResult && isSelected && !isCorrect ? <XCircle className="h-4 w-4 text-red-700" /> : null}
                        </button>
                      );
                    })}
                  </div>

                  {!showResult ? (
                    <button
                      onClick={checkAnswer}
                      disabled={selectedOption === null}
                      className="gradient-emerald mt-6 w-full rounded-2xl py-4 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      Submit Answer
                    </button>
                  ) : quizResult === 'correct' ? (
                    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                      <CheckCircle2 className="mx-auto mb-3 h-11 w-11 text-emerald-700" />
                      <h4 className="font-headline text-2xl font-extrabold text-emerald-900">Level Up!</h4>
                      <p className="mt-2 text-sm text-emerald-800">{lessonData.quiz?.explanation || 'Great job. You have mastered this module.'}</p>

                      <button
                        onClick={nextLevel}
                        className="gradient-emerald mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
                      >
                        Continue to Level {level}
                        <TrendingUp className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                      <XCircle className="mx-auto mb-3 h-11 w-11 text-red-600" />
                      <h4 className="font-headline text-xl font-extrabold text-red-800">Not quite right</h4>
                      <p className="mt-1 text-sm text-red-700">Try again or revisit the lesson content before reattempting.</p>
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedOption(null);
                            setQuizResult(null);
                          }}
                          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => setQuizMode(false)}
                          className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          Read Lesson Again
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="space-y-8 lg:col-span-4">
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-700 p-7 text-white panel-shadow">
                <h4 className="font-headline text-xl font-bold">Great job!</h4>
                <p className="mt-1 text-4xl font-extrabold text-emerald-200">+50 XP</p>
                <p className="mt-3 text-sm text-emerald-100">Daily Streak: 12 Days</p>
                <button className="mt-5 w-full rounded-xl bg-emerald-300 py-2.5 text-sm font-extrabold text-emerald-950 transition hover:brightness-95">
                  Claim Rewards
                </button>
              </div>

              <div className="rounded-3xl border-2 border-amber-300 bg-white p-1 panel-shadow">
                <div className="rounded-[1.35rem] bg-[#ffdcc3]/40 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#8d4b00] text-3xl font-black text-white shadow">
                    {level + 1}
                  </div>
                  <h4 className="font-headline text-2xl font-extrabold text-[#2f1500]">Level {level + 1} Unlocked</h4>
                  <p className="mt-1 text-sm text-[#6e3900]">You have reached a stronger learning tier.</p>

                  <div className="mt-5 space-y-3 text-left">
                    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-white/70 p-3">
                      <Lock className="h-4 w-4 text-[#8d4b00]" />
                      <div>
                        <p className="text-xs font-bold text-[#8d4b00]">New Perk</p>
                        <p className="text-xs text-[#6e3900]">Early access to market insights</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-white/70 p-3">
                      <BookOpen className="h-4 w-4 text-[#8d4b00]" />
                      <div>
                        <p className="text-xs font-bold text-[#8d4b00]">New Perk</p>
                        <p className="text-xs text-[#6e3900]">Custom investment dashboard</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center">
            <p className="text-[#3d4a42]">Failed to load lesson. Please refresh.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningHub;
