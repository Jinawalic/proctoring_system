"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  Users,
  FileText,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // All hooks must come before any conditional return (Rules of Hooks)
  useEffect(() => {
    // Login page needs no auth check
    if (pathname === "/admin/login") return;
    const admin = localStorage.getItem("admin");
    if (!admin) {
      router.replace("/admin/login");
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // Login page renders standalone — no sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Block render until auth is confirmed
  if (!isAuthorized) return null;

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    // { name: "Live Sessions", href: "/admin/sessions", icon: Video },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Exams", href: "/admin/exams", icon: FileText },
    { name: "Violations", href: "/admin/violations", icon: AlertTriangle },
    // { name: "Reports / Logs", href: "/admin/reports", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex text-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-gray-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-950 border-b border-gray-800">
          <span className="text-white text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand" />
            AI Proctoring
          </span>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-4">Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800/50 hover:text-white"
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-brand" : "text-gray-400 group-hover:text-gray-300"}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={() => { localStorage.removeItem("admin"); router.push("/admin/login"); }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
          <span className="font-bold text-gray-900">Admin Panel</span>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
