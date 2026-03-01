"use client";

import { signOut } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { LogOut, User, Globe, Loader2 } from "lucide-react";
import { setUserLocale } from "@/lib/locale";

/**
 * Props del componente Navbar.
 */
interface NavbarProps {
  /** Nombre del usuario autenticado para mostrar en la barra. */
  userName: string;
  /** URL del avatar del usuario (Google o GitHub). Puede ser null si no está disponible. */
  userImage?: string | null;
}

/**
 * Barra de navegación superior del dashboard.
 *
 * Client Component — usa hooks de Next.js y next-intl que requieren el runtime del cliente.
 *
 * Responsabilidades:
 * - Muestra el logo y nombre de la app.
 * - Selector de idioma (ES / EN): alterna el locale llamando a la Server Action
 *   `setUserLocale` dentro de `startTransition` para marcar la transición como
 *   no-urgente. Tras guardar la cookie, llama a `router.refresh()` para que el
 *   servidor re-renderice con el nuevo locale sin navegación completa.
 *   Durante la transición muestra un spinner (`Loader2`) en lugar del ícono de globo.
 * - Avatar del usuario: muestra la imagen de Google/GitHub con `next/image`
 *   (los dominios están permitidos en `next.config.ts`), o un ícono de usuario
 *   como fallback si no hay imagen.
 * - Botón de logout: llama a `signOut` de NextAuth redirigiendo a `/`.
 *
 * La navbar usa `sticky top-0 z-50` con `backdrop-blur-md` para permanecer
 * visible durante el scroll con efecto glass.
 *
 * @see lib/locale.ts — Server Actions `setUserLocale` y `getUserLocale`
 * @see next.config.ts — dominios de imágenes remotas permitidos
 * @see app/(dashboard)/layout.tsx — recibe la sesión y pasa las props
 *
 * @example
 * <Navbar userName={session.user.name} userImage={session.user.image} />
 */
export const Navbar = ({ userName, userImage }: NavbarProps) => {
  const t = useTranslations("dashboard.navbar");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  /**
   * Alterna el idioma entre 'es' y 'en', persiste en cookie y refresca la página.
   * Envuelto en `startTransition` para no bloquear la UI durante la Server Action.
   */
  const toggleLanguage = () => {
    const nextLocale = locale === "es" ? "en" : "es";
    startTransition(async () => {
      await setUserLocale(nextLocale);
      router.refresh();
    });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">S</div>
          <span className="text-xl font-bold tracking-tight text-gray-900">SmartApply</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            disabled={isPending}
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            <span className="uppercase">{locale}</span>
          </button>

          <div className="h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-gray-900">{userName}</p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('profile')}</p>
              </div>
              <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-gray-100">
                {userImage ? (
                  <Image src={userImage} alt={userName} width={40} height={40} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600">
                    <User className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="group flex items-center gap-2"
            >
              <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
