import { cn } from "@/lib/utils";

/**
 * Componente base de botón reutilizable.
 *
 * Extiende los atributos nativos de `<button>` con soporte para variantes
 * de estilo y tamaños predefinidos. Usa `cn` (clsx + tailwind-merge) para
 * combinar clases de forma segura sin conflictos de Tailwind.
 *
 * Comportamiento por defecto:
 * - `variant`: `"primary"` — botón azul principal.
 * - `size`: `"md"` — tamaño mediano.
 * - Estado `disabled`: opacidad al 50% y cursor `not-allowed`.
 *
 * Variantes disponibles:
 * - `primary` — fondo azul, texto blanco. Acciones principales.
 * - `secondary` — fondo gris claro, texto oscuro. Acciones secundarias.
 * - `ghost` — sin fondo, con hover gris. Acciones terciarias o iconos.
 * - `outline` — borde gris, fondo transparente. Acciones alternativas.
 *
 * Tamaños disponibles:
 * - `sm` — `px-3 py-1.5 text-xs`. Botones compactos en tarjetas o toolbars.
 * - `md` — `px-4 py-2 text-sm`. Tamaño estándar en formularios.
 * - `lg` — `px-6 py-3 text-base`. CTAs prominentes.
 *
 * @example
 * <Button variant="primary" size="lg" onClick={handleSubmit}>
 *   Generar CV
 * </Button>
 *
 * <Button variant="outline" size="sm" disabled={isLoading}>
 *   Cancelar
 * </Button>
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500": variant === "primary",
          "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300": variant === "secondary",
          "text-gray-600 hover:bg-gray-100": variant === "ghost",
          "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50": variant === "outline",
          "px-3 py-1.5 text-xs": size === "sm",
          "px-4 py-2 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
