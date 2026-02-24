"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FilePlus, History, UserCircle } from "lucide-react";

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
}

export const Sidebar = ({ className, isMobile }: SidebarProps) => {
  const t = useTranslations("dashboard.navigation");
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/generate", label: t("generate"), icon: FilePlus },
    { href: "/history", label: t("history"), icon: History },
    { href: "/profile", label: t("profile"), icon: UserCircle },
  ];

  if (isMobile) {
    return (
      <nav className={cn("flex items-center justify-around px-4", className)}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-tight transition-colors",
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <aside className={cn("w-64 border-r border-gray-100 bg-white sticky top-16 h-[calc(100vh-64px)] p-6", className)}>
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "text-gray-500 hover:bg-slate-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
