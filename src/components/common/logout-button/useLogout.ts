"use client";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/store/admin-auth.store";

type LogoutType = "admin" | "user";

export function useLogout(type: LogoutType) {
  const router = useRouter();
  const adminLogout = useAdminAuthStore((state) => state.logout);
  const logout = async () => {
    try {
      switch (type) {
        case "admin":
          await adminLogout();
          router.replace("/admin/login");
          break;

        case "user":
          // future user logout

          break;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    logout,
  };
}
