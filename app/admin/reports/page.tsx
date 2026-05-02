"use client";

import { FileText, Download, BarChart2 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-brand" />
            Reports & Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">Generate and export system analytics and audit logs.</p>
        </div>
        
        <button className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export All Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Report Cards */}
        {[
          { title: "Exam Completion Report", desc: "Detailed statistics on student completion rates.", date: "Updated 1 hour ago" },
          { title: "Violation Analysis", desc: "Breakdown of common irregularities and infractions.", date: "Updated today" },
          { title: "System Audit Logs", desc: "Technical logs of all system events and API calls.", date: "Real-time" },
          { title: "Student Performance", desc: "Aggregated scores and time-spent metrics.", date: "Updated yesterday" },
          { title: "Hardware Issues", desc: "Logs of camera/microphone permission failures.", date: "Updated 2 days ago" },
        ].map((report, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col group hover:shadow-md transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-brand/10 text-brand rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 leading-tight">{report.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{report.desc}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">{report.date}</span>
              <button className="text-brand text-sm font-medium hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Download CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
