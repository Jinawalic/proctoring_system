"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  BookOpen,
  AlertTriangle,
  ShieldAlert,
  Search,
  Camera,
  X,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

const PAGE_SIZE = 8;

type Violation = {
  id: string;
  studentId: string;
  examId: string;
  student: string;
  matricNumber: string;
  exam: string;
  examTitle: string;
  date: string;
  time: string;
  severity: string;
  aggregatedTypes: Record<string, number>;
  evidence: { id: string; type: string; message: string; time: string; date: string }[];
};

type Session = {
  id: string;
  status: string;
  faceStatus: string;
  objectDetected: string;
  student: { name: string; matricNumber: string };
  exam: { courseCode: string; title: string };
};

type Stats = {
  totalStudents: number;
  activeExams: number;
  totalViolations: number;
  suspiciousSessions: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [liveSessions, setLiveSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [isInvalidating, setIsInvalidating] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const [statsRes, violationsRes, sessionsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/violations"),
        fetch("/api/admin/sessions"),
      ]);
      const [statsData, violationsData, sessionsData] = await Promise.all([
        statsRes.json(),
        violationsRes.json(),
        sessionsRes.json(),
      ]);
      if (statsRes.ok) setStats(statsData);
      if (violationsRes.ok) setViolations(Array.isArray(violationsData) ? violationsData : []);
      if (sessionsRes.ok) setLiveSessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch {
      showToast("Failed to load dashboard data", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Auto-refresh live sessions every 30s
    const interval = setInterval(() => fetchAll(true), 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleInvalidate = async () => {
    if (!selectedViolation) return;
    setIsInvalidating(true);
    try {
      const res = await fetch("/api/admin/sessions/invalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedViolation.studentId,
          examId: selectedViolation.examId,
        }),
      });
      if (res.ok) {
        showToast(`Exam invalidated for ${selectedViolation.student}`, "success");
        setSelectedViolation(null);
        fetchAll(true);
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to invalidate", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setIsInvalidating(false);
    }
  };

  // Filter + paginate violations
  const filtered = violations.filter(
    (v) =>
      v.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.exam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.matricNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const STAT_CONFIG = [
    {
      label: "Total Students",
      value: stats?.totalStudents ?? "—",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Active Exams",
      value: stats?.activeExams ?? "—",
      icon: BookOpen,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      label: "Total Violations",
      value: stats?.totalViolations ?? "—",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
    },
    // {
    //   label: "Suspicious Sessions",
    //   value: stats?.suspiciousSessions ?? "—",
    //   icon: ShieldAlert,
    //   color: "text-yellow-600",
    //   bg: "bg-yellow-50",
    //   border: "border-yellow-100",
    // },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top-2 ${toast.type === "success"
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time examination monitoring and proctoring status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAll(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full border border-green-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide">SYSTEM LIVE</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {STAT_CONFIG.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`bg-white rounded-xl shadow-sm border ${stat.border} px-4 py-3 flex items-center gap-4 hover:shadow-md transition-shadow`}
              >
                <div className={`p-3 rounded-xl ${stat.bg} border ${stat.border}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value.toLocaleString()}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Sessions Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 lg:col-span-1 flex flex-col h-[500px]">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Live Sessions</h2>
            <span className="text-xs font-medium text-brand bg-brand/10 px-2 py-1 rounded-md">
              {liveSessions.length} Active
            </span>
          </div>
          <div className="overflow-y-auto p-2 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : liveSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <CheckCircle2 className="w-10 h-10 text-gray-300" />
                <p className="text-sm">No active sessions</p>
              </div>
            ) : (
              liveSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors mb-1"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">{session.student.name}</h4>
                      <p className="text-xs text-gray-500">{session.exam.courseCode}</p>
                    </div>
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1 ${session.status === "Normal"
                        ? "bg-green-500"
                        : "bg-red-500 animate-pulse"
                        }`}
                    />
                  </div>
                  <div className="flex gap-2 text-[11px] font-medium uppercase tracking-wider flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded ${session.faceStatus === "1 face"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {session.faceStatus}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${session.objectDetected === "None"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {session.objectDetected !== "None" ? session.objectDetected : "Objects: Clear"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Violations Table with Pagination */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 lg:col-span-2 flex flex-col h-[500px]">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Recent Violations
              {violations.length > 0 && (
                <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {violations.length}
                </span>
              )}
            </h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search student or exam..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand w-full sm:w-56"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : paginated.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">All clear!</h3>
                <p className="text-sm mt-1">No violations match your search criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Student &amp; Exam
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Violation
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((v) => {
                    const firstType = Object.entries(v.aggregatedTypes)[0];
                    return (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="font-medium text-gray-900 text-sm">{v.student}</div>
                          <div className="text-xs text-gray-400">{v.exam}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col items-start gap-1">
                            {firstType && (
                              <>
                                <span
                                  className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded ${firstType[0].startsWith("FACE")
                                    ? "bg-red-100 text-red-700 border border-red-200"
                                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                    }`}
                                >
                                  {firstType[0].split(":")[0]} ({firstType[1]})
                                </span>
                                <span className="text-xs text-gray-600">
                                  {firstType[0].split(": ")[1] || firstType[0]}
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                            {v.time}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{v.date}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedViolation(v)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-xs"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            Evidence
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination footer */}
          {!isLoading && filtered.length > PAGE_SIZE && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50 rounded-b-xl">
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages} &nbsp;·&nbsp; {filtered.length} violations
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-md text-xs font-medium border transition-colors ${page === p
                        ? "bg-brand text-white border-brand"
                        : "border-gray-300 text-gray-600 hover:bg-white"
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Evidence + Invalidate Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isInvalidating && setSelectedViolation(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Violation Evidence</h3>
              <button
                onClick={() => !isInvalidating && setSelectedViolation(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
                disabled={isInvalidating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Screenshot grid */}
              <div className="bg-gray-900 rounded-xl p-4 grid grid-cols-4 gap-2">
                {selectedViolation.evidence.slice(0, 6).map((ev, i) => (
                  <div
                    key={ev.id || i}
                    className="aspect-square bg-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-500 border border-gray-700"
                  >
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-medium">{ev.time}</span>
                  </div>
                ))}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Student</p>
                  <p className="text-sm font-bold text-gray-900">{selectedViolation.student}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Exam</p>
                  <p className="text-sm font-bold text-gray-900">{selectedViolation.exam}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Matric Number</p>
                  <p className="text-sm font-bold text-gray-900">{selectedViolation.matricNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Detection Details</p>
                  <div className="space-y-1">
                    {Object.entries(selectedViolation.aggregatedTypes).map(([key, count]) => (
                      <div key={key} className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${key.startsWith("FACE")
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {key.split(":")[0]} ({count})
                        </span>
                        <span className="text-xs text-gray-700">{key.split(": ")[1] || key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
              {/* Left side – destructive action */}
              <button
                onClick={() => {
                  // Delete the student linked to this violation
                  if (confirm(`Delete student ${selectedViolation.student}? This cannot be undone.`)) {
                    fetch(`/api/admin/students/${selectedViolation.studentId}`, { method: "DELETE" })
                      .then((r) => {
                        if (r.ok) {
                          showToast(`Student ${selectedViolation.student} deleted`, "success");
                          setSelectedViolation(null);
                          fetchAll(true);
                        } else {
                          showToast("Failed to delete student", "error");
                        }
                      })
                      .catch(() => showToast("An error occurred", "error"));
                  }
                }}
                disabled={isInvalidating}
                className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Delete Student
              </button>

              {/* Right side */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedViolation(null)}
                  disabled={isInvalidating}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Close
                </button>
                <button
                  onClick={handleInvalidate}
                  disabled={isInvalidating}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isInvalidating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Invalidate Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
