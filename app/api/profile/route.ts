import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
        experience: parsed.data.experience as unknown as Prisma.InputJsonValue, // Json fields
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
