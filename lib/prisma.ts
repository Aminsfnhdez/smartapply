import { PrismaClient } from '@prisma/client'
import { env } from './env'

/**
 * Referencia global para el cliente Prisma en entornos de desarrollo.
 *
 * En desarrollo, Next.js recarga los módulos frecuentemente (Fast Refresh),
 * lo que crearía múltiples instancias de PrismaClient y agotaría el pool
 * de conexiones. Al guardar la instancia en `globalThis`, se reutiliza
 * la misma conexión entre recargas.
 *
 * En producción este problema no existe, ya que el servidor solo arranca una vez.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

/**
 * Cliente Prisma singleton para toda la aplicación.
 *
 * - En producción: crea una nueva instancia al arrancar.
 * - En desarrollo: reutiliza la instancia guardada en `globalThis` si existe,
 *   o crea una nueva y la guarda para las siguientes recargas.
 *
 * Usar siempre este cliente importado desde `@/lib/prisma` en lugar de
 * instanciar `new PrismaClient()` directamente en otros módulos.
 *
 * @example
 * import { prisma } from '@/lib/prisma';
 * const profile = await prisma.profile.findUnique({ where: { userId } });
 */
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
