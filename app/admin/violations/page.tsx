"use client";

import { AlertTriangle, Search, Filter, Camera, X, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ViolationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<any | null>(null);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const res = await fetch("/api/admin/violations");
        const data = await res.json();
        if (res.ok) {
          setViolations(data);
        }
      } catch (error) {
        console.error("Failed to fetch violations");
      } finally {
        setLoading(false);
      }
    };
    fetchViolations();
  }, []);

  const filteredViolations = violations.filter(v =>
    v.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.exam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toast
  const [toast, setToast] = useState<{ show: boolean, msg: string, type: "success" | "error" } | null>(null);
  const [showConfirmInvalidate, setShowConfirmInvalidate] = useState<{ studentId: string, examId: string } | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<{ studentId: string, studentName: string } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInvalidate = async (studentId: string, examId: string) => {
    try {
      const res = await fetch("/api/admin/sessions/invalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, examId })
      });
      if (res.ok) {
        showToast("Exam invalidated successfully.", "success");
        setSelectedViolation(null);
        setShowConfirmInvalidate(null);
        // Refresh violations after a short delay
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast("Failed to invalidate exam.", "error");
      }
    } catch (error) {
      console.error("Invalidate error:", error);
      showToast("An error occurred", "error");
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Student "${studentName}" deleted successfully.`, "success");
        setSelectedViolation(null);
        setShowConfirmDelete(null);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast("Failed to delete student.", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 relative">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
          {toast.msg}
        </div>
      )}

      {/* Confirmation Toast */}
      {showConfirmInvalidate && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 flex flex-col items-center gap-4 animate-in slide-in-from-top-4 duration-300 w-full max-w-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-900">Invalidate Exam?</h4>
            <p className="text-sm text-gray-500">Are you sure you want to invalidate this exam? The student will be disqualified immediately.</p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setShowConfirmInvalidate(null)}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleInvalidate(showConfirmInvalidate.studentId, showConfirmInvalidate.examId)}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              Yes, Invalidate
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Toast */}
      {showConfirmDelete && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 flex flex-col items-center gap-4 animate-in slide-in-from-top-4 duration-300 w-full max-w-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-900">Delete Student?</h4>
            <p className="text-sm text-gray-500">Are you sure you want to permanently delete <strong>{showConfirmDelete.studentName}</strong>? This cannot be undone.</p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setShowConfirmDelete(null)}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteStudent(showConfirmDelete.studentId, showConfirmDelete.studentName)}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Violations Log
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review all automatically flagged system irregularities.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand w-full sm:w-64"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Violation Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin text-brand" />
                    <p className="text-sm font-medium">Fetching violations...</p>
                  </div>
                </td>
              </tr>
            ) : filteredViolations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle className="w-8 h-8 text-gray-300" />
                    <p className="text-sm">No violations found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredViolations.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{v.date}</div>
                    <div className="text-xs text-gray-500">{v.time}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{v.student}</td>
                  <td className="px-6 py-4 text-gray-500">{v.exam}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(v.aggregatedTypes as Record<string, number>).map(([typeKey, count], idx) => {
                        const [type, msg] = typeKey.split(": ");
                        return (
                          <div key={idx} className="flex flex-col items-start gap-1">
                            <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded ${type === 'FACE' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              }`}>
                              {type} ({count})
                            </span>
                            <span className="text-sm text-gray-700">{msg}</span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${v.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                      {v.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedViolation(v)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                    >
                      <Camera className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Evidence Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedViolation(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Violation Evidence
              </h3>
              <button
                onClick={() => setSelectedViolation(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Evidence Images Grid */}
              <div className="bg-gray-900 rounded-lg mb-6 p-4 border border-gray-200 shadow-inner">
                <div className="grid grid-cols-4 gap-2">
                  {selectedViolation.evidence && selectedViolation.evidence.length > 0 ? (
                    selectedViolation.evidence.map((ev: any, idx: number) => (
                      <div key={idx} className="aspect-video bg-gray-800 rounded border border-gray-700 overflow-hidden relative group">
                        {/* Since we don't have real images yet, we show a placeholder with the violation type */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[8px] text-white text-center truncate">
                          {ev.time}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-4 aspect-video flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-700" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Student</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedViolation.student}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Exam</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedViolation.exam}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Matric Number</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedViolation.matricNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Detection Details</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedViolation.aggregatedTypes as Record<string, number>).map(([typeKey, count], idx) => {
                      const [type, msg] = typeKey.split(": ");
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${type === 'FACE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {type} ({count})
                          </span>
                          <span className="text-sm font-semibold text-gray-900">{msg}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
              {/* Left – Delete */}
              <button
                onClick={() => setShowConfirmDelete({ studentId: selectedViolation.studentId, studentName: selectedViolation.student })}
                className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
              >
                Delete Student
              </button>
              {/* Right – Close + Invalidate */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedViolation(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowConfirmInvalidate({ studentId: selectedViolation.studentId, examId: selectedViolation.examId })}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
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

