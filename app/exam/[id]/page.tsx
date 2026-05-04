"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import ProctoringView from "@/components/ProctoringView";
import { Clock, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState<{time: string, type: string, msg: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load student and questions
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setStudent(JSON.parse(userStr));
    } else {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const { id } = unwrappedParams;
        
        // Fetch exam details
        const examRes = await fetch(`/api/exams`);
        const exams = await examRes.json();
        const currentExam = exams.find((ex: any) => ex.id === id);
        
        if (currentExam) {
          setExam(currentExam);
          setTimeLeft(currentExam.duration * 60);
        }

        // Mark exam as started
        await fetch(`/api/exams/${id}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: JSON.parse(userStr).id })
        });

        // Fetch questions
        const questionsRes = await fetch(`/api/exams/${id}/questions`);
        const questionsData = await questionsRes.json();
        setQuestions(questionsData);
      } catch (error) {
        console.error("Failed to fetch exam data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [unwrappedParams.id, router]);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0 && !loading && questions.length > 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, questions.length]);

  const formatTime = (seconds: number) => {
    if (seconds < 0) return "00:00";
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
      if (student) {
        fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            examId: unwrappedParams.id, 
            studentId: student.id,
            violation: newViolation 
          })
        }).catch(console.error);
      }

      return [...prev, newViolation];
    });
  }, [unwrappedParams.id, student]);

  const [toast, setToast] = useState<{ show: boolean, msg: string, type: "success" | "error" } | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return;
    setIsSubmitting(true);
    setShowConfirmSubmit(false);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          examId: unwrappedParams.id, 
          studentId: student?.id,
          answers, 
          violationsCount: violations.length 
        })
      });
      if (res.ok) {
        setIsSubmitted(true);
        showToast("Exam submitted successfully!", "success");
      } else {
        showToast("Submission failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Failed to submit exam", error);
      showToast("An error occurred during submission", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">Loading exam questions...</p>
        </div>
      </div>
    );
  }

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

  const currentQ = questions[currentQuestionIdx];

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 mb-2">No Questions Found</h2>
          <p className="text-zinc-500 mb-6">This exam doesn't have any questions yet or they failed to load.</p>
          <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-zinc-900 text-white rounded-lg">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
          {toast.msg}
        </div>
      )}

      {/* Confirmation Toast */}
      {showConfirmSubmit && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 flex flex-col items-center gap-4 animate-in slide-in-from-top-4 duration-300 w-full max-w-sm">
           <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
           </div>
           <div className="text-center">
              <h4 className="text-lg font-bold text-gray-900">Submit Exam?</h4>
              <p className="text-sm text-gray-500">Are you sure you want to finalize your submission? This action cannot be undone.</p>
           </div>
           <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Continue Exam
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover"
              >
                Yes, Submit
              </button>
           </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-zinc-900">Exam: {exam?.courseCode || 'Loading...'}</h1>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-sm font-medium text-zinc-600">
            Question {currentQuestionIdx + 1} of {questions.length}
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
            onClick={() => setShowConfirmSubmit(true)}
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
              {(currentQ.options as string[]).map((option, idx) => {
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
              {questions.map((_, idx) => (
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

            {currentQuestionIdx === questions.length - 1 ? (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
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

