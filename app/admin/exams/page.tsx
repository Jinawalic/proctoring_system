"use client";

import { FileText, Search, Plus, X, Settings2, Edit, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

const INITIAL_EXAMS = [
  { id: "EXM-001", name: "CS101 - Introduction to Computer Science", questions: 20, duration: "30", status: "Active" },
  { id: "EXM-002", name: "Math201 - Advanced Calculus", questions: 40, duration: "60", status: "Draft" },
  { id: "EXM-003", name: "Physics105 - Mechanics", questions: 30, duration: "45", status: "Closed" },
  { id: "EXM-004", name: "History101 - World History", questions: 50, duration: "60", status: "Active" },
];

export default function ExamsPage() {
  const [exams, setExams] = useState(INITIAL_EXAMS);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [manageExam, setManageExam] = useState<typeof INITIAL_EXAMS[0] | null>(null);

  // States
  const [newExam, setNewExam] = useState({ name: "", questions: "", duration: "" });
  const [isSavingExam, setIsSavingExam] = useState(false);

  // Questions State
  const [currentQuestion, setCurrentQuestion] = useState({ text: "", options: ["", "", "", ""], correctOption: 0 });
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [savedQuestionsCount, setSavedQuestionsCount] = useState(0);

  // Toast
  const [toast, setToast] = useState<{ show: boolean, msg: string, type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.name || !newExam.questions || !newExam.duration) return;

    setIsSavingExam(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newId = `EXM-00${exams.length + 1}`;
    setExams([...exams, {
      ...newExam,
      id: newId,
      questions: parseInt(newExam.questions),
      status: "Draft"
    }]);

    setIsSavingExam(false);
    setIsCreateModalOpen(false);
    showToast("Exam draft saved successfully!", "success");

    // Open questions modal
    setSavedQuestionsCount(0);
    setCurrentQuestion({ text: "", options: ["", "", "", ""], correctOption: 0 });
    setIsQuestionsModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.text || currentQuestion.options.some(o => !o)) {
      showToast("Please fill all question fields and options.", "error");
      return;
    }

    setIsSavingQuestion(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setSavedQuestionsCount(prev => prev + 1);
    setIsSavingQuestion(false);
    showToast("Question saved successfully!", "success");

    // Reset for next question
    setCurrentQuestion({ text: "", options: ["", "", "", ""], correctOption: 0 });
  };

  const handleSaveManage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageExam) return;
    setExams(exams.map(ex => ex.id === manageExam.id ? manageExam : ex));
    setManageExam(null);
    showToast("Exam updated successfully!", "success");
  };

  const handleDeleteExam = () => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      if (!manageExam) return;
      setExams(exams.filter(ex => ex.id !== manageExam.id));
      setManageExam(null);
      showToast("Exam deleted successfully!", "success");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 relative">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand" />
            Exams Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create, edit, and monitor examination papers.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Exam
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Code</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Questions</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredExams.map((exam) => (
              <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{exam.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{exam.name}</td>
                <td className="px-6 py-4 text-gray-500">{exam.questions}</td>
                <td className="px-6 py-4 text-gray-500">{exam.duration}m</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${exam.status === 'Active' ? 'bg-green-100 text-green-700' :
                    exam.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                    {exam.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setManageExam(exam)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-sm"
                  >
                    <Settings2 className="w-4 h-4" />
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {filteredExams.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No exams found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Exam Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSavingExam && setIsCreateModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand" /> Create New Exam
              </h3>
              <button disabled={isSavingExam} onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-700 disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
                <input
                  type="text" required value={newExam.name} onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                  placeholder="e.g. Intro to Biology"
                  disabled={isSavingExam}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                  <input
                    type="number" required min="1" value={newExam.questions} onChange={(e) => setNewExam({ ...newExam, questions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                    placeholder="e.g. 50"
                    disabled={isSavingExam}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                  <input
                    type="number" required min="1" value={newExam.duration} onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                    placeholder="e.g. 60"
                    disabled={isSavingExam}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" disabled={isSavingExam} onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSavingExam} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover shadow-sm disabled:opacity-70 flex items-center gap-2">
                  {isSavingExam && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Questions Modal */}
      {isQuestionsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Questions</h3>
                <p className="text-xs text-gray-500 mt-1">Saved: {savedQuestionsCount} / {newExam.questions || "∞"}</p>
              </div>
              <button disabled={isSavingQuestion} onClick={() => setIsQuestionsModalOpen(false)} className="text-gray-400 hover:text-gray-700 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50">
                Finish & Close
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                <textarea
                  required
                  rows={3}
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand resize-none"
                  placeholder="Enter the question here..."
                  disabled={isSavingQuestion}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Multiple Choice Options</label>
                <div className="space-y-3">
                  {currentQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOption"
                          id={`opt-${idx}`}
                          checked={currentQuestion.correctOption === idx}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctOption: idx })}
                          className="w-4 h-4 text-brand focus:ring-brand border-gray-300 cursor-pointer"
                          disabled={isSavingQuestion}
                        />
                        <label htmlFor={`opt-${idx}`} className="text-sm font-medium text-gray-500 w-24 cursor-pointer">
                          Option {String.fromCharCode(65 + idx)}
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...currentQuestion.options];
                          newOpts[idx] = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOpts });
                        }}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-colors ${currentQuestion.correctOption === idx ? 'border-green-400 bg-green-50' : 'border-gray-300'
                          }`}
                        placeholder={`Enter option ${String.fromCharCode(65 + idx)}...`}
                        disabled={isSavingQuestion}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select the radio button next to the correct answer.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="submit" disabled={isSavingQuestion} className="px-6 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover shadow-sm disabled:opacity-70 flex items-center gap-2">
                  {isSavingQuestion && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Question & Next
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Exam Modal */}
      {manageExam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setManageExam(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-gray-500" /> Manage Exam
              </h3>
              <button onClick={() => setManageExam(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input type="text" disabled value={manageExam.id} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input
                  type="text" required value={manageExam.name} onChange={(e) => setManageExam({ ...manageExam, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                  <input
                    type="number" required min="1" value={manageExam.duration} onChange={(e) => setManageExam({ ...manageExam, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={manageExam.status} onChange={(e) => setManageExam({ ...manageExam, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-between border-t border-gray-100">
                <button type="button" onClick={handleDeleteExam} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">Delete Exam</button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setManageExam(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover shadow-sm">Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
