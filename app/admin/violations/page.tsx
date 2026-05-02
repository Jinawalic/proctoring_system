"use client";

import { AlertTriangle, Search, Filter, Camera, X } from "lucide-react";
import { useState } from "react";

const MOCK_VIOLATIONS = [
  { id: 101, student: "Michael Smith", type: "FACE", message: "Multiple faces detected", time: "10:45 AM", date: "2026-05-02", exam: "Math201", severity: "High" },
  { id: 102, student: "David Brown", type: "OBJECT", message: "cell phone detected", time: "10:48 AM", date: "2026-05-02", exam: "CS101", severity: "High" },
  { id: 103, student: "Emily Davis", type: "OBJECT", message: "laptop detected", time: "11:02 AM", date: "2026-05-01", exam: "History101", severity: "Medium" },
  { id: 104, student: "James Wilson", type: "FACE", message: "No face detected", time: "11:15 AM", date: "2026-05-01", exam: "Physics105", severity: "Medium" },
];

export default function ViolationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedViolation, setSelectedViolation] = useState<typeof MOCK_VIOLATIONS[0] | null>(null);

  const filteredViolations = MOCK_VIOLATIONS.filter(v => 
    v.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.exam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
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
            {filteredViolations.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{v.date}</div>
                  <div className="text-xs text-gray-500">{v.time}</div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{v.student}</td>
                <td className="px-6 py-4 text-gray-500">{v.exam}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      v.type === 'FACE' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {v.type}
                    </span>
                    <span className="text-sm text-gray-700">{v.message}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                    v.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
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
            ))}
            {filteredViolations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No violations found matching your criteria.
                </td>
              </tr>
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
              {/* Mock Screenshot */}
              <div className="aspect-video bg-gray-900 rounded-lg mb-6 relative overflow-hidden group flex items-center justify-center border border-gray-200 shadow-inner">
                <Camera className="w-12 h-12 text-gray-700" />
                <div className="absolute inset-0 border-4 border-red-500/30 pointer-events-none" />
                {/* Simulated bounding box */}
                <div className="absolute top-1/4 left-1/3 w-32 h-40 border-2 border-red-500 bg-red-500/20 pointer-events-none" />
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
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Time Logged</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedViolation.date} {selectedViolation.time}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Detection Details</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                      selectedViolation.type === 'FACE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedViolation.type}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{selectedViolation.message}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedViolation(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={() => setSelectedViolation(null)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                Invalidate Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
