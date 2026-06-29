"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useAdminAuthStore } from "@/store/admin-auth.store";

export default function AdminLogin() {
  const router = useRouter();

  const login = useAdminAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.replace("/admin/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Invalid credentials",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9] px-4 font-sora">
      <div className="bg-white w-full max-w-105 rounded-2xl p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#3451E9] rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <GraduationCap size={24} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            EduAdmin
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Sign in to your workspace
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700 block">
              Administrator Email
            </label>
            <div className="relative flex items-center">
              <Mail
                size={18}
                className="absolute left-3.5 text-slate-400"
                strokeWidth={2}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eduadmin.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3451E9]/20 focus:border-[#3451E9] transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-slate-700 block">
                Password
              </label>
              <button
                type="button"
                className="text-[13px] font-bold text-[#3451E9] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock
                size={18}
                className="absolute left-3.5 text-slate-400"
                strokeWidth={2}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3451E9]/20 focus:border-[#3451E9] transition-all tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <Eye size={18} strokeWidth={2} />
                ) : (
                  <EyeOff size={18} strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#3451E9] focus:ring-[#3451E9]/20 cursor-pointer"
            />
            <label
              htmlFor="remember"
              className="text-sm text-slate-600 cursor-pointer select-none"
            >
              Remember this device
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 disabled:bg-[#1E3A8A]/70 disabled:cursor-not-allowed text-white py-3 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In...
              </div>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-1.5">
          <p className="text-[11px] text-slate-500 font-medium">
            Secure access for authorized personnel only.
          </p>
          <div className="text-[11px] font-semibold text-[#3451E9]">
            <button className="hover:underline">Terms of Service</button>
            <span className="mx-1.5 text-slate-400">•</span>
            <button className="hover:underline">Privacy Policy</button>
          </div>
        </div>
      </div>
    </div>
  );
}
