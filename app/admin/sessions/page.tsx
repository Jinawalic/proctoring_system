"use client";

import { Video, Search, Filter, X, Signal, User, ShieldAlert } from "lucide-react";
import { useState } from "react";

const INITIAL_SESSIONS = [
  { id: 1, student: "Alice Johnson", exam: "CS101", duration: "45m", status: "Active", alerts: 0, fps: 24, latency: 120 },
  { id: 2, student: "Michael Smith", exam: "Math201", duration: "12m", status: "Active", alerts: 3, fps: 15, latency: 450 },
  { id: 3, student: "Sarah Williams", exam: "Physics105", duration: "1h 15m", status: "Completed", alerts: 0, fps: 0, latency: 0 },
  { id: 4, student: "David Brown", exam: "CS101", duration: "5m", status: "Active", alerts: 1, fps: 30, latency: 85 },
];

export default function LiveSessionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStream, setSelectedStream] = useState<typeof INITIAL_SESSIONS[0] | null>(null);

  const filteredSessions = INITIAL_SESSIONS.filter(s => 
    s.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.exam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-6 h-6 text-brand" />
            Live Sessions
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitor all ongoing and recently completed exam sessions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search sessions..."
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
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Alerts</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSessions.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{session.student}</td>
                <td className="px-6 py-4 text-gray-500">{session.exam}</td>
                <td className="px-6 py-4 text-gray-500">{session.duration}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                    session.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {session.status}
                    {session.status === 'Active' && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse my-auto" />}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {session.alerts > 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                      {session.alerts}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedStream(session)}
                    disabled={session.status === 'Completed'}
                    className={`font-medium text-sm transition-colors ${
                      session.status === 'Active' ? 'text-brand hover:text-brand-hover' : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    View Stream
                  </button>
                </td>
              </tr>
            ))}
            {filteredSessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No sessions found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stream Modal */}
      {selectedStream && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedStream(null)} />
          <div className="relative bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-zinc-800">
            
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-sm font-semibold text-white">Live Feed: {selectedStream.student}</h3>
                <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">{selectedStream.exam}</span>
              </div>
              <button 
                onClick={() => setSelectedStream(null)}
                className="text-zinc-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
              {/* Mock Video Placeholder */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                <User className="w-32 h-32 text-zinc-700" />
              </div>
              
              {/* Overlays */}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-mono text-green-400 border border-green-400/20">
                  {selectedStream.fps} FPS
                </div>
                <div className={`bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-mono border ${
                  selectedStream.latency < 200 ? 'text-green-400 border-green-400/20' : 'text-amber-400 border-amber-400/20'
                }`}>
                  <Signal className="w-3 h-3 inline mr-1" />
                  {selectedStream.latency}ms
                </div>
              </div>

              <div className="absolute bottom-4 left-4">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm text-white font-medium border border-white/10 flex items-center gap-2">
                  <Video className="w-4 h-4 text-brand" />
                  REC
                </div>
              </div>

              {/* Alert Overlays if any */}
              {selectedStream.alerts > 0 && (
                <div className="absolute top-4 right-4 animate-pulse">
                  <div className="bg-red-500/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-bold text-white shadow-lg border border-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    {selectedStream.alerts} Active Violations
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-zinc-900 flex justify-between items-center border-t border-zinc-800">
              <p className="text-xs text-zinc-500">Stream connected securely via WebRTC. AI monitoring active.</p>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm font-medium transition-colors border border-zinc-700">
                  Pause Monitor
                </button>
                <button className="px-4 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-md text-sm font-medium transition-colors border border-red-500/30">
                  Terminate Exam
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
