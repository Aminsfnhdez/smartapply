import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/forms/ProfileForm";
import type { UserProfile } from "@/types/profile";

export default async function ProfilePage() {
  const session = await auth();
  const t = await getTranslations("profile");

  if (!session?.user?.id) {
    return null; // El middleware ya protege esta ruta
  }

  const profileData = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  // Convertimos los campos Json de Prisma a los tipos correctos para el componente
  const initialData = profileData
    ? {
        ...profileData,
        experience: profileData.experience as any,
        education: profileData.education as any,
        languages: profileData.languages as any,
      }
    : {};

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          {t("description")}
        </p>
      </div>

      <ProfileForm initialData={initialData} />
    </div>
  );
}
