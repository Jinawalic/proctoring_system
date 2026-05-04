"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, BookOpen, ChevronRight, CheckCircle2, Shield, LogOut, FileSearch, Loader2, X } from "lucide-react";


export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Result States
  const [showResultDropdown, setShowResultDropdown] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [isFetchingResult, setIsFetchingResult] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchExams = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          router.replace("/");
          return;
        }
        const studentData = JSON.parse(userStr);
        setStudent(studentData);
        setIsAuthorized(true);

        const [examsRes, sessionsRes] = await Promise.all([
          fetch("/api/exams"),
          fetch(`/api/student/sessions?studentId=${studentData.id}`)
        ]);

        const examsData = await examsRes.json();
        const sessionsData = await sessionsRes.json();

        if (examsRes.ok && sessionsRes.ok) {
          setExams(examsData.map((ex: any) => {
            const session = sessionsData.find((s: any) => s.examId === ex.id);
            let status = ex.status === 'Active' ? 'available' : ex.status.toLowerCase();

            let score = null;
            if (session) {
              score = session.score;
              if (session.isInvalidated) {
                status = 'invalidated';
              } else if (session.submittedAt) {
                status = 'completed';
              }
            }

            return {
              id: ex.id,
              title: ex.title,
              duration: ex.duration,
              questions: ex.questions,
              status,
              score,
              dueDate: ex.dueDate || "No due date"
            };
          }));
        }
      } catch (error) {
        console.error("Failed to load exams");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleCheckResult = (exam: any) => {
    setSelectedResult(exam);
    setShowResultDropdown(false);
  };

  if (!mounted || !isAuthorized) return null;

  const completedExams = exams.filter(e => e.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Student Dashboard</h1>
              <p className="text-zinc-500 mt-1">Welcome back, <span className="font-semibold text-zinc-700">{student?.name}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowResultDropdown(!showResultDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FileSearch className="w-4 h-4 text-brand" />
                Check Result
              </button>

              {showResultDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-gray-50 bg-gray-50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Course</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {completedExams.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">No completed exams yet.</p>
                    ) : (
                      completedExams.map((exam) => (
                        <button
                          key={exam.id}
                          onClick={() => handleCheckResult(exam)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-brand/5 hover:text-brand transition-colors border-b border-gray-50 last:border-0"
                        >
                          <p className="font-semibold">{exam.title}</p>
                          <p className="text-xs opacity-70">Completed</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-100"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Result Overlay if selected */}
        {selectedResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedResult(null)} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-100">
              <div className="absolute top-4 right-4">
                <button onClick={() => setSelectedResult(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 ">{selectedResult.title}</h3>
                <p className="text-gray-400 font-medium text-sm mt-1">Examination Result</p>

                <div className="mt-3 py-8 bg-gray-50 rounded-[2rem] border border-gray-100 relative overflow-hidden group">

                  <p className="text-xs text-gray-400 font-bold uppercase mb-3">Final Score</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xl font-bold text-gray-700">
                      {selectedResult.score !== null ? selectedResult.score : "0"}
                    </span>
                    <span className="text-xl text-gray-400 font-bold">/ {selectedResult.questions}</span>
                  </div>

                  <div className="mt-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${(selectedResult.score / selectedResult.questions) >= 0.5
                      ? 'bg-green-500 text-white'
                      : 'bg-red-400 text-white'
                      }`}>
                      {(selectedResult.score / selectedResult.questions) >= 0.5 ? 'PASSED' : 'FAILED'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedResult(null)}
                  className="mt-8 w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  Close Result Window
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Exams List */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand" />
            Your Exams
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-pulse h-48" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.length === 0 && !isLoading && (
                <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No active exams available at the moment.</p>
                </div>
              )}
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-brand/30 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${exam.status === 'available' ? 'bg-green-100 text-green-700' :
                      exam.status === 'upcoming' ? 'bg-amber-100 text-amber-700' :
                        exam.status === 'invalidated' ? 'bg-red-100 text-red-700' :
                          'bg-zinc-100 text-zinc-600'
                      }`}>
                      {exam.status}
                    </div>
                    {(exam.status === 'completed' || exam.status === 'invalidated') && <CheckCircle2 className="w-5 h-5 text-zinc-400" />}
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 mb-2 line-clamp-2">
                    {exam.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-zinc-500 mb-6 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {exam.duration} mins
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      {exam.questions} Qs
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-zinc-100">
                    {exam.status === 'available' ? (
                      <button
                        onClick={() => router.push(`/exam/${exam.id}/pre-exam`)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors"
                      >
                        Start Exam
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : exam.status === 'upcoming' ? (
                      <button disabled className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 text-zinc-400 font-medium cursor-not-allowed">
                        Available {new Date(exam.dueDate).toLocaleDateString()}
                      </button>
                    ) : exam.status === 'invalidated' ? (
                      <button disabled className="w-full py-2.5 px-4 rounded-xl bg-red-50 text-red-400 font-medium cursor-not-allowed">
                        Disqualified
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCheckResult(exam)}
                        className="w-full py-2.5 px-4 rounded-xl bg-zinc-50 text-zinc-600 font-medium hover:bg-zinc-100 transition-colors border border-zinc-100"
                      >
                        View Result
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

