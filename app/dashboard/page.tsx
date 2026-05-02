"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, BookOpen, ChevronRight, CheckCircle2, Shield } from "lucide-react";


export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchExams = async () => {
      try {
        const res = await fetch("/api/exams");
        const data = await res.json();
        if (res.ok) {
          setExams(data.map((ex: any) => ({
            id: ex.id,
            title: ex.title,
            duration: ex.duration,
            questions: ex.questions,
            status: ex.status === 'Active' ? 'available' : ex.status.toLowerCase(),
            dueDate: ex.dueDate || "No due date"
          })));
        }
      } catch (error) {
        console.error("Failed to load exams");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Student Dashboard</h1>
            <p className="text-zinc-500 mt-1">Welcome back! You have 1 pending exam.</p>
          </div>
          <div className="flex items-center gap-3 bg-brand/10 px-4 py-2 rounded-lg border border-brand/20">
            <Shield className="w-5 h-5 text-brand" />
            <span className="text-sm font-medium text-brand">Secure Session</span>
          </div>
        </header>

        {/* Exams List */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Your Exams</h2>
          
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
                  <div className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${
                    exam.status === 'available' ? 'bg-green-100 text-green-700' :
                    exam.status === 'upcoming' ? 'bg-amber-100 text-amber-700' :
                    'bg-zinc-100 text-zinc-600'
                  }`}>
                    {exam.status}
                  </div>
                  {exam.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-zinc-400" />}
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
                  ) : (
                    <button disabled className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 text-zinc-500 font-medium cursor-not-allowed">
                      View Results
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
