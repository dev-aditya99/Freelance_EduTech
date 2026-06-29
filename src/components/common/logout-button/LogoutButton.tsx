"use client";
import { LogOut } from "lucide-react";
import { useLogout } from "./useLogout";

type Props = {
  type: "admin" | "user";
  label?: string;
  className?: string;
};

export default function LogoutButton({
  type,
  label = "Logout",
  className = "",
}: Props) {
  const { logout } = useLogout(type);

  return (
    <button onClick={logout} className={className}>
      <LogOut size={16} />
      <span>{label}</span>
    </button>
  );
}
