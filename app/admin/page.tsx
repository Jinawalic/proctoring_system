"use client";

import { useState } from "react";
import {
  Users,
  BookOpen,
  AlertTriangle,
  ShieldAlert,
  Search,
  Camera,
  X,
  CheckCircle2,
  Clock
} from "lucide-react";

// Mock Data
const STATS = [
  { label: "Total Students", value: "1,248", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active Exams", value: "45", icon: BookOpen, color: "text-green-600", bg: "bg-green-50" },
  { label: "Total Violations", value: "12", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { label: "Suspicious Sessions", value: "3", icon: ShieldAlert, color: "text-yellow-600", bg: "bg-yellow-50" },
];

const LIVE_SESSIONS = [
  { id: 1, student: "Alice Johnson", exam: "CS101", status: "Normal", faceStatus: "1 face", objectDetected: "None" },
  { id: 2, student: "Michael Smith", exam: "Math201", status: "Violation", faceStatus: "Multiple faces", objectDetected: "None" },
  { id: 3, student: "Sarah Williams", exam: "Physics105", status: "Normal", faceStatus: "1 face", objectDetected: "None" },
  { id: 4, student: "David Brown", exam: "CS101", status: "Violation", faceStatus: "1 face", objectDetected: "cell phone" },
];

const MOCK_VIOLATIONS = [
  { id: 101, student: "Michael Smith", type: "FACE", message: "Multiple faces detected", time: "10:45 AM", date: "2026-05-02", exam: "Math201", severity: "High" },
  { id: 102, student: "David Brown", type: "OBJECT", message: "cell phone detected", time: "10:48 AM", date: "2026-05-02", exam: "CS101", severity: "High" },
  { id: 103, student: "Emily Davis", type: "OBJECT", message: "laptop detected", time: "11:02 AM", date: "2026-05-01", exam: "History101", severity: "Medium" },
  { id: 104, student: "James Wilson", type: "FACE", message: "No face detected", time: "11:15 AM", date: "2026-05-01", exam: "Physics105", severity: "Medium" },
];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedViolation, setSelectedViolation] = useState<typeof MOCK_VIOLATIONS[0] | null>(null);

  const filteredViolations = MOCK_VIOLATIONS.filter(v =>
    v.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.exam.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time examination monitoring and proctoring status.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full border border-green-200 shadow-sm w-fit">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide">SYSTEM LIVE</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Monitoring - Takes up 1 column on LG */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 lg:col-span-1 flex flex-col h-[500px]">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Live Sessions</h2>
            <span className="text-xs font-medium text-brand bg-brand/10 px-2 py-1 rounded-md">{LIVE_SESSIONS.length} Active</span>
          </div>
          <div className="overflow-y-auto p-2 flex-1 custom-scrollbar">
            {LIVE_SESSIONS.map((session) => (
              <div key={session.id} className="p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors mb-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">{session.student}</h4>
                    <p className="text-xs text-gray-500">{session.exam}</p>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 ${session.status === 'Normal' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                </div>
                <div className="flex gap-2 text-[11px] font-medium uppercase tracking-wider">
                  <span className={`px-2 py-0.5 rounded ${session.faceStatus === '1 face' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                    {session.faceStatus}
                  </span>
                  <span className={`px-2 py-0.5 rounded ${session.objectDetected === 'None' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800'}`}>
                    {session.objectDetected !== 'None' ? session.objectDetected : 'Objects: Clear'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Violations Table - Takes up 2 columns on LG */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 lg:col-span-2 flex flex-col h-[500px]">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Recent Violations
            </h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search student or exam..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand w-full sm:w-64"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {filteredViolations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">All clear!</h3>
                <p className="text-sm mt-1">No violations match your search criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student & Exam</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Violation</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredViolations.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-sm">{v.student}</div>
                        <div className="text-xs text-gray-500">{v.exam}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded ${v.type === 'FACE' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                            {v.type}
                          </span>
                          <span className="text-sm text-gray-700">{v.message}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1.5" />
                          {v.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedViolation(v)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                        >
                          <Camera className="w-4 h-4" />
                          Evidence
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Evidence Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
