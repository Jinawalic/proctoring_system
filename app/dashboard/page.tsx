"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, BookOpen, ChevronRight, CheckCircle2, Shield } from "lucide-react";

// Mock Exam Data
const EXAMS = [
  {
    id: "cs101",
    title: "Introduction to Computer Science",
    duration: 30, // in minutes
    questions: 20,
    status: "available", // available, completed, upcoming
    dueDate: "2026-05-05",
  },
  {
    id: "math201",
    title: "Advanced Calculus II",
    duration: 60,
    questions: 40,
    status: "upcoming",
    dueDate: "2026-05-10",
  },
  {
    id: "phy105",
    title: "Physics Mechanics",
    duration: 45,
    questions: 30,
    status: "completed",
    dueDate: "2026-05-01",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXAMS.map((exam) => (
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
        </div>

      </div>
    </div>
  );
}
