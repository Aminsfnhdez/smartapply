"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FilePlus, History, UserCircle } from "lucide-react";

/**
 * Props del componente Sidebar.
 */
interface SidebarProps {
  /** Clases adicionales para el contenedor raíz. */
  className?: string;
  /**
   * Si es true, renderiza la versión móvil (barra inferior horizontal).
   * Si es false o undefined, renderiza la versión desktop (sidebar lateral).
   */
  isMobile?: boolean;
}

/**
 * Navegación lateral del dashboard con soporte para desktop y móvil.
 *
 * Client Component — usa `usePathname` para detectar la ruta activa
 * y resaltar el enlace correspondiente.
 *
 * El componente tiene dos modos de renderizado controlados por `isMobile`:
 *
 * **Desktop** (`isMobile = false`):
 * - Sidebar fijo de 64px de ancho (`w-64`), sticky bajo la Navbar.
 * - Links con ícono + texto, resaltado azul en la ruta activa.
 * - Usado en `app/(dashboard)/layout.tsx` visible desde `sm` breakpoint.
 *
 * **Móvil** (`isMobile = true`):
 * - Barra de navegación inferior horizontal con íconos y etiquetas compactas.
 * - Links en columna (ícono + texto pequeño), resaltado azul en activa.
 * - Usado como barra inferior fija en pantallas pequeñas.
 *
 * Los 4 enlaces de navegación son:
 * - `/dashboard` — Dashboard (métricas y actividad reciente).
 * - `/generate` — Generar CV.
 * - `/history` — Historial de CVs.
 * - `/profile` — Perfil profesional.
 *
 * Los textos están externalizados en `messages/` bajo `dashboard.navigation`.
 *
 * @see app/(dashboard)/layout.tsx — renderiza ambas versiones según breakpoint
 *
 * @example
 * // Desktop
 * <Sidebar className="hidden sm:block" />
 *
 * // Móvil
 * <Sidebar isMobile className="sm:hidden fixed bottom-0 w-full border-t bg-white h-16" />
 */
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
