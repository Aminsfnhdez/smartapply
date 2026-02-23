import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  summary: z.string().max(2000).nullable(),
  experience: z.array(z.object({
    company: z.string().min(1),
    position: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    description: z.string().min(1),
  })),
  education: z.array(z.object({
    institution: z.string().min(1),
    degree: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
  })),
  skills: z.array(z.string()),
  languages: z.array(z.object({
    name: z.string().min(1),
    level: z.string().min(1),
  })),
  certifications: z.array(z.string()),
});

export const GET = async (req: NextRequest) => {
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
        experience: parsed.data.experience as any, // Json fields
        education: parsed.data.education as any,
        languages: parsed.data.languages as any,
      },
      create: {
        userId: session.user.id,
        ...parsed.data,
        experience: parsed.data.experience as any,
        education: parsed.data.education as any,
        languages: parsed.data.languages as any,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PUT /api/profile]", error);
    return NextResponse.json({ error: "Error al guardar el perfil" }, { status: 500 });
  }
};
