"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import ProctoringView from "@/components/ProctoringView";
import { Clock, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

// Mock Exam Questions
const MOCK_QUESTIONS = [
  { id: 1, text: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Markup Language", "Hyper Tabular Markup Language", "None of these"] },
  { id: 2, text: "Which of the following is not a JavaScript framework?", options: ["Vue", "React", "Node", "Cassandra"] },
  { id: 3, text: "What is the CSS property used to change text color?", options: ["text-color", "color", "font-color", "text-style"] },
  { id: 4, text: "What is the correct way to declare a variable in ES6?", options: ["var", "let", "const", "Both let and const"] },
  { id: 5, text: "Which symbol is used for comments in JavaScript?", options: ["//", "<!--", "/*", "#"] }
];

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins
  const [violations, setViolations] = useState<{time: string, type: string, msg: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option: string) => {
    setAnswers({
      ...answers,
      [currentQuestionIdx]: option
    });
  };

  const handleViolation = useCallback((type: string, message: string) => {
    setViolations(prev => {
      // Prevent spamming the same violation if it happened in the last 3 seconds
      const last = prev[prev.length - 1];
      if (last && last.msg === message && (new Date().getTime() - new Date(last.time).getTime() < 3000)) {
        return prev;
      }
      
      const newViolation = { time: new Date().toISOString(), type, msg: message };
      
      // Log to API (fire and forget)
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: unwrappedParams.id, violation: newViolation })
      }).catch(console.error);

      return [...prev, newViolation];
    });
  }, [unwrappedParams.id]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          examId: unwrappedParams.id, 
          answers, 
          violationsCount: violations.length 
        })
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit exam", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-200">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Exam Submitted!</h1>
          <p className="text-zinc-500 mb-6">
            Your answers have been saved successfully. You may now close this window.
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = MOCK_QUESTIONS[currentQuestionIdx];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-zinc-900">Exam: CS101</h1>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-sm font-medium text-zinc-600">
            Question {currentQuestionIdx + 1} of {MOCK_QUESTIONS.length}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
            timeLeft < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-brand/10 text-brand'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg font-medium shadow-sm disabled:opacity-70 transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Finish Exam'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-4 gap-6 overflow-hidden">
        
        {/* Left Side: Exam Interface */}
        <div className="flex-1 flex flex-col gap-6 max-w-4xl overflow-y-auto">
          {/* Question Box */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 flex-1">
            <h2 className="text-2xl font-semibold text-zinc-900 mb-8 leading-snug">
              <span className="text-brand mr-2">{currentQuestionIdx + 1}.</span> 
              {currentQ.text}
            </h2>

            <div className="space-y-4">
              {currentQ.options.map((option, idx) => {
                const isSelected = answers[currentQuestionIdx] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full flex items-center p-4 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'border-brand bg-brand/5 ring-1 ring-brand' 
                        : 'border-zinc-200 hover:border-brand/50 hover:bg-zinc-50:bg-zinc-900/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 shrink-0 ${
                      isSelected ? 'border-brand' : 'border-zinc-400'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-brand rounded-full" />}
                    </div>
                    <span className={`text-lg ${isSelected ? 'text-zinc-900 font-medium' : 'text-zinc-700'}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-zinc-700 hover:bg-zinc-100:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>
            
            <div className="flex gap-1.5">
              {MOCK_QUESTIONS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentQuestionIdx 
                      ? 'bg-brand scale-125' 
                      : answers[idx] 
                        ? 'bg-brand/40' 
                        : 'bg-zinc-300'
                  }`}
                />
              ))}
            </div>

            {currentQuestionIdx === MOCK_QUESTIONS.length - 1 ? (
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to submit your exam?")) {
                    handleSubmit();
                  }
                }}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.min(MOCK_QUESTIONS.length - 1, prev + 1))}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-zinc-900 hover:bg-black:bg-zinc-700 transition-colors"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Proctoring Overlay */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4">
          <div className="h-[300px] lg:h-auto lg:aspect-[4/3] w-full shrink-0">
            <ProctoringView onViolation={handleViolation} />
          </div>

          {/* Violations Log Preview (Optional for debugging) */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 flex flex-col overflow-hidden">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Activity Log ({violations.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {violations.length === 0 ? (
                <p className="text-xs text-zinc-500 italic text-center py-4">No irregularities detected.</p>
              ) : (
                violations.slice().reverse().map((v, i) => (
                  <div key={i} className="text-xs p-2 rounded bg-red-50 border border-red-100 text-red-800">
                    <span className="opacity-70 font-mono mr-2">{new Date(v.time).toLocaleTimeString()}</span>
                    {v.msg}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
