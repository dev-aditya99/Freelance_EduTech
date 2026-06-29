"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { motion } from "framer-motion";
import { useAdminAuthStore } from "@/store/admin-auth.store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { fetchAdmin, isAuthenticated } = useAdminAuthStore();
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchAdmin();
      setCheckingAuth(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (!checkingAuth && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [checkingAuth, isAuthenticated]);

  if (!mounted) {
    return null;
  }

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-full flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setIsMobileOpen}
      />

      <motion.div className="w-full flex flex-col flex-1 min-w-0">
        <Header
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          toggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
        />

        <main className="flex-1 overflow-auto p-6 min-w-0">{children}</main>
      </motion.div>
    </div>
  );
}
