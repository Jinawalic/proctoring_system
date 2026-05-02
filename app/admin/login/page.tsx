"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Mock login logic for now as requested "UI only"
    setTimeout(() => {
      if (email === "admin@proctor.com" && password === "admin123") {
        router.push("/admin/students");
      } else {
        setError("Invalid credentials. Use admin@proctor.com / admin123");
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 selection:bg-brand/30">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700" />

      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-hover shadow-lg shadow-brand/20 mb-4 animate-in fade-in zoom-in duration-700">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-zinc-500 mt-2 font-medium">AI Proctoring Command Center</p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-brand transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
                  placeholder="admin@proctor.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-zinc-400">Password</label>
                <button type="button" className="text-xs text-brand hover:text-brand-hover transition-colors">Forgot?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-brand transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" />
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-zinc-600 text-xs">
              System version v2.4.0 • Secure Encryption Enabled
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button 
            onClick={() => router.push("/")}
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            ← Back to Public Site
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .group-hover\\:animate-shine {
          animation: shine 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
