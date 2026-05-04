"use client";

import { Users, Search, MoreVertical, X, Edit2, Trash2, Key, Loader2, CheckCircle2, AlertCircle, Upload, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const PAGE_SIZE = 10;

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<any | null>(null);
  const [resetPasswordStudent, setResetPasswordStudent] = useState<any | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<any | null>(null);

  const [newStudent, setNewStudent] = useState({ name: "", email: "", matricNumber: "" });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Toast
  const [toast, setToast] = useState<{ show: boolean, msg: string, type: "success" | "error" } | null>(null);

  // CSV Import
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    message: string;
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      showToast("Failed to load students", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.matricNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const paginatedStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email || !newStudent.matricNumber) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });
      const data = await res.json();
      if (res.ok) {
        setStudents([data, ...students]);
        setNewStudent({ name: "", email: "", matricNumber: "" });
        setIsAddModalOpen(false);
        showToast("Student added successfully with default password '12345678'", "success");
      } else {
        showToast(data.error || "Failed to add student", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/students/${editStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editStudent.name,
          email: editStudent.email,
          matricNumber: editStudent.matricNumber,
        }),
      });
      if (res.ok) {
        setStudents(students.map(s => s.id === editStudent.id ? editStudent : s));
        setEditStudent(null);
        showToast("Student details updated successfully!", "success");
      } else {
        showToast("Failed to update student", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordStudent) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/students/${resetPasswordStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "12345678" }),
      });
      if (res.ok) {
        setResetPasswordStudent(null);
        showToast(`Password for ${resetPasswordStudent.name} reset to '12345678'`, "success");
      } else {
        showToast("Failed to reset password", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/students/${studentToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStudents(students.filter(s => s.id !== studentToDelete.id));
        setStudentToDelete(null);
        showToast("Student deleted successfully!", "success");
      } else {
        showToast("Failed to delete student", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) return;
    setIsImporting(true);
    setImportResult(null);
    try {
      const form = new FormData();
      form.append("file", csvFile);
      const res = await fetch("/api/admin/students/import", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult(data);
        if (data.created > 0) fetchStudents();
      } else {
        showToast(data.error || "Import failed", "error");
      }
    } catch {
      showToast("An error occurred during import", "error");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 relative" onClick={() => setActiveDropdown(null)}>

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
            <Users className="w-6 h-6 text-brand" />
            Students Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered students and their exam records.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => { setIsImportModalOpen(true); setCsvFile(null); setImportResult(null); }}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover transition-colors shadow-sm"
          >
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Matric Number</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Exams Enrolled</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Exams Completed</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{student.matricNumber}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 text-gray-500">{student.email}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">{student.enrolled}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">{student.completed}</td>
                <td className="px-6 py-4 text-right relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === student.id ? null : student.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors focus:outline-none"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {activeDropdown === student.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-8 top-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] py-1"
                    >
                      <button
                        onClick={() => { setEditStudent(student); setActiveDropdown(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" /> Edit Details
                      </button>
                      <button
                        onClick={() => { setResetPasswordStudent(student); setActiveDropdown(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Key className="w-4 h-4 text-gray-400" /> Reset Password
                      </button>
                      <button
                        onClick={() => { setStudentToDelete(student); setActiveDropdown(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" /> Delete Student
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No students found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {filteredStudents.length > PAGE_SIZE && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages} &nbsp;·&nbsp; {filteredStudents.length} students
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
                const pg = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-md text-xs font-medium border transition-colors ${
                      page === pg
                        ? "bg-brand text-white border-brand"
                        : "border-gray-300 text-gray-600 hover:bg-white"
                    }`}
                  >
                    {pg}
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

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSaving && setIsAddModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add New Student</h3>
              <button disabled={isSaving} onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text" required disabled={isSaving}
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                <input
                  type="text" required disabled={isSaving}
                  value={newStudent.matricNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, matricNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  placeholder="e.g. NSU/CSC/3001/2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email" required disabled={isSaving}
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  placeholder="jane@example.com"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 border border-blue-100">
                <Key className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-800">
                  Student will be saved with the default password: <strong className="font-mono">12345678</strong>.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" disabled={isSaving} onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover shadow-sm disabled:opacity-70 flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSaving && setEditStudent(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Edit Student Details</h3>
              <button disabled={isSaving} onClick={() => setEditStudent(null)} className="text-gray-400 hover:text-gray-700 disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                <input type="text" disabled value={editStudent.matricNumber} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text" required disabled={isSaving}
                  value={editStudent.name}
                  onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email" required disabled={isSaving}
                  value={editStudent.email}
                  onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" disabled={isSaving} onClick={() => setEditStudent(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover shadow-sm disabled:opacity-70 flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSaving && setResetPasswordStudent(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Password</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to reset the password for <strong>{resetPasswordStudent.name}</strong> to the default <code className="bg-gray-100 px-1 rounded">12345678</code>?
              </p>

              <div className="flex justify-center gap-3">
                <button type="button" disabled={isSaving} onClick={() => setResetPasswordStudent(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex-1 disabled:opacity-50">
                  Cancel
                </button>
                <button type="button" disabled={isSaving} onClick={handleResetPassword} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm flex-1 disabled:opacity-70 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSaving && setStudentToDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Student</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <strong>{studentToDelete.name}</strong>? This action cannot be undone.
              </p>

              <div className="flex justify-center gap-3">
                <button type="button" disabled={isSaving} onClick={() => setStudentToDelete(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex-1 disabled:opacity-50">
                  Cancel
                </button>
                <button type="button" disabled={isSaving} onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm flex-1 disabled:opacity-70 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isImporting && setIsImportModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand" />
                Import Students from CSV
              </h3>
              <button disabled={isImporting} onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-700 disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 space-y-1">
                <p className="font-semibold flex items-center gap-1"><FileText className="w-4 h-4" /> CSV Format Required:</p>
                <p>Your CSV file must have exactly these column headers:</p>
                <code className="block bg-white border border-blue-200 rounded px-2 py-1 font-mono text-xs mt-1">
                  Student Name, Matric Number
                </code>
                <p className="text-xs text-blue-600 mt-1">Students already in the database will be skipped. Default password <strong>12345678</strong> will be assigned.</p>
              </div>

              {/* File Picker */}
              {!importResult && (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand transition-colors cursor-pointer"
                  onClick={() => document.getElementById('csv-file-input')?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  {csvFile ? (
                    <p className="text-sm font-medium text-gray-800">{csvFile.name}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Click to select a <strong>.csv</strong> file</p>
                  )}
                  <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setCsvFile(f);
                      setImportResult(null);
                    }}
                  />
                </div>
              )}

              {/* Import Results */}
              {importResult && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-700">{importResult.created}</p>
                      <p className="text-xs text-green-600 mt-0.5">Created</p>
                    </div>
                    <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-700">{importResult.skipped}</p>
                      <p className="text-xs text-yellow-600 mt-0.5">Skipped (exist)</p>
                    </div>
                    {importResult.errors.length > 0 && (
                      <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-700">{importResult.errors.length}</p>
                        <p className="text-xs text-red-600 mt-0.5">Errors</p>
                      </div>
                    )}
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                      <p className="text-xs font-semibold text-red-700 mb-1">Row Errors:</p>
                      {importResult.errors.map((e, i) => (
                        <p key={i} className="text-xs text-red-600">{e}</p>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => { setCsvFile(null); setImportResult(null); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Import Another File
                  </button>
                </div>
              )}

              {/* Action buttons */}
              {!importResult && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!csvFile || isImporting}
                    onClick={handleImportCSV}
                    className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isImporting ? "Importing..." : "Upload & Import"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
