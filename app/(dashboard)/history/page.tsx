import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { HistoryClient } from "./HistoryClient";

export default async function HistoryPage() {
  const session = await auth();
  const t = await getTranslations("history");

  const cvList = await prisma.cV.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          {t("description")}
        </p>
      </div>

      <HistoryClient initialCvs={cvList} />
    </div>
  );
}
