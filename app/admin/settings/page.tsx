"use client";

import { Settings, Save, Shield, Bell, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand" />
            System Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure AI sensitivity, notifications, and general preferences.</p>
        </div>
        
        <button className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover transition-colors flex items-center gap-2 shadow-sm">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
        
        {/* Section 1: AI Settings */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">AI Proctoring Configuration</h2>
          </div>
          <div className="space-y-5 max-w-2xl ml-7">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Object Detection Confidence Threshold</label>
              <div className="flex items-center gap-4">
                <input type="range" min="0.1" max="0.9" step="0.1" defaultValue="0.5" className="flex-1 accent-brand" />
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">0.5</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Lower values trigger more alerts but increase false positives.</p>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Auto-invalidate on severe violations</p>
                <p className="text-xs text-gray-500">Automatically end exam if unauthorized device is detected.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2 border-t border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Require multiple faces strictly</p>
                <p className="text-xs text-gray-500">Trigger violation immediately if zero faces are detected.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Notifications */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Admin Notifications</h2>
          </div>
          <div className="space-y-4 max-w-2xl ml-7">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="email_alerts" defaultChecked className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand" />
              <label htmlFor="email_alerts" className="text-sm text-gray-700">Email alerts for High-Severity violations</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="browser_alerts" defaultChecked className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand" />
              <label htmlFor="browser_alerts" className="text-sm text-gray-700">Browser push notifications during Live Sessions</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="daily_summary" className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand" />
              <label htmlFor="daily_summary" className="text-sm text-gray-700">Receive daily summary reports</label>
            </div>
          </div>
        </div>

        {/* Section 3: Data Management */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
          </div>
          <div className="space-y-4 max-w-2xl ml-7">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Retention Period</label>
              <select className="block w-full sm:w-64 pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-brand focus:border-brand rounded-md">
                <option>30 Days</option>
                <option>90 Days</option>
                <option>6 Months</option>
                <option>1 Year</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">Screenshots and logs will be permanently deleted after this period.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
