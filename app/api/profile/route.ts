import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Esquema de validación Zod para el cuerpo del PUT /api/profile.
 *
 * Valida y tipifica todos los campos del perfil profesional del usuario:
 * - Datos personales: fullName, jobTitle, phone, email, city, linkedin, portfolio.
 * - Resumen profesional: summary (máx. 2000 caracteres).
 * - Experiencia laboral: array de objetos con company, position, fechas, isCurrent y description.
 * - Educación: array con institution, degree, fechas, isOngoing, city y status.
 * - Habilidades: technicalSkills y softSkills como arrays de strings.
 * - Idiomas: array de objetos { name, level }.
 * - Certificaciones: array de strings.
 * - Formación complementaria: array de objetos { institution, program, year } (opcional).
 *
 * Los campos de datos personales son opcionales y aceptan null para permitir
 * guardado parcial del perfil.
 */
const profileSchema = z.object({
  fullName: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  portfolio: z.string().nullable().optional(),
  summary: z.string().max(2000).nullable(),
  experience: z.array(z.object({
    company: z.string().min(1),
    position: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().optional(),
    isCurrent: z.boolean().optional(),
    city: z.string().optional(),
    description: z.string().min(1),
  })),
  education: z.array(z.object({
    institution: z.string().min(1),
    degree: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().optional(),
    isOngoing: z.boolean().optional(),
    city: z.string().optional(),
    status: z.enum(['finished', 'ongoing', 'incomplete']).optional(),
  })),
  technicalSkills: z.array(z.string()),
  softSkills: z.array(z.string()),
  languages: z.array(z.object({
    name: z.string().min(1),
    level: z.string().min(1),
  })),
  certifications: z.array(z.string()),
  complementaryEducation: z.array(z.object({
    institution: z.string(),
    program: z.string(),
    year: z.string(),
  })).optional().default([]),
});

/**
 * GET /api/profile
 *
 * Retorna el perfil profesional completo del usuario autenticado.
 * Si el usuario aún no ha creado su perfil, retorna `null`.
 *
 * Requiere sesión activa (JWT). Si no hay sesión, retorna 401.
 *
 * @returns 200 con el objeto Profile de Prisma, o null si no existe.
 * @returns 401 si el usuario no está autenticado.
 * @returns 500 en caso de error inesperado de base de datos.
 *
 * @example
 * const res = await fetch('/api/profile');
 * const profile = await res.json(); // Profile | null
 */
export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[GET /api/profile]", error);
    return NextResponse.json({ error: "Error al obtener el perfil" }, { status: 500 });
  }
};

/**
 * PUT /api/profile
 *
 * Crea o actualiza (upsert) el perfil profesional del usuario autenticado.
 *
 * Usa `prisma.profile.upsert` para manejar tanto la creación inicial
 * como actualizaciones posteriores con una sola operación.
 *
 * Los campos JSON de Prisma (experience, education, languages,
 * complementaryEducation) requieren un cast explícito a
 * `Prisma.InputJsonValue` para satisfacer el tipado estricto del ORM.
 *
 * Requiere sesión activa (JWT). Si no hay sesión, retorna 401.
 * Valida el body con Zod antes de cualquier operación en la DB.
 *
 * @returns 200 con el objeto Profile actualizado.
 * @returns 400 si el body no pasa la validación de Zod.
 * @returns 401 si el usuario no está autenticado.
 * @returns 500 en caso de error inesperado de base de datos.
 *
 * @example
 * await fetch('/api/profile', {
 *   method: 'PUT',
 *   body: JSON.stringify({ fullName: 'Juan Pérez', experience: [...], ... }),
 * });
 */
export const PUT = async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        ...parsed.data,
        experience: parsed.data.experience as unknown as Prisma.InputJsonValue,
        education: parsed.data.education as unknown as Prisma.InputJsonValue,
        languages: parsed.data.languages as unknown as Prisma.InputJsonValue,
        complementaryEducation: parsed.data.complementaryEducation as unknown as Prisma.InputJsonValue,
      },
      create: {
        userId: session.user.id,
        ...parsed.data,
        experience: parsed.data.experience as unknown as Prisma.InputJsonValue,
        education: parsed.data.education as unknown as Prisma.InputJsonValue,
        languages: parsed.data.languages as unknown as Prisma.InputJsonValue,
        complementaryEducation: parsed.data.complementaryEducation as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PUT /api/profile]", error);
    return NextResponse.json({ error: "Error al guardar el perfil" }, { status: 500 });
  }
};
