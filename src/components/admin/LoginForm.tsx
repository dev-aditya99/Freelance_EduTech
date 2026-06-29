"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/services/admin-auth.service";
import { useAdminAuthStore } from "@/store/admin-auth.store";

export default function LoginForm() {
  const router = useRouter();
  const setAdmin = useAdminAuthStore((state) => state.setAdmin);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await adminLogin(email, password);
      setAdmin(data.admin, data.accessToken);
      router.push("/admin/dashboard");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-2 h-12 px-4 border rounded-lg"
        />
      </div>

      <div>
        <label>Password</label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-2 h-12 px-4 border rounded-lg"
        />
      </div>

      <button
        disabled={loading}
        className="w-full h-12 bg-blue-600 text-white rounded-lg"
      >
        {loading ? "Logging In..." : "Login"}
      </button>
    </form>
  );
}
