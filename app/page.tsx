import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sparkles, CheckCircle, Zap, ShieldCheck, ArrowRight } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  const t = await getTranslations("landing");

  const features = [
    {
      title: t("features.ai.title"),
      desc: t("features.ai.desc"),
      icon: Zap,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: t("features.ats.title"),
      desc: t("features.ats.desc"),
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: t("features.templates.title"),
      desc: t("features.templates.desc"),
      icon: Sparkles,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold tracking-tight text-gray-900">SmartApply</span>
          </div>
          
          <Link href={session ? "/dashboard" : "/login"}>
            <Button variant="ghost" className="font-bold">
              {session ? t("goToDashboard") : t("login")}
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600">
                <Sparkles className="h-4 w-4" />
                <span>{t("hero.badge")}</span>
              </div>
              <h1 className="mt-8 text-5xl font-black tracking-tight text-gray-900 sm:text-7xl">
                {t("hero.title")}<span className="text-blue-600">.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl font-medium text-gray-500 leading-relaxed">
                {t("hero.subtitle")}
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href={session ? "/dashboard" : "/login"}>
                  <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-2xl shadow-blue-200 transition-all hover:scale-105 active:scale-95">
                    {t("hero.cta")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-sm font-bold text-gray-400">
                   {t("hero.noCredit")}
                </p>
              </div>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-0 -z-10 h-full w-full opacity-30">
            <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-blue-100 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-100 blur-3xl" />
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div key={i} className="relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} ${feature.color} mb-6`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-4 font-medium text-gray-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-blue-600 p-8 py-16 text-center text-white shadow-2xl sm:p-16 lg:p-24">
              <h2 className="text-4xl font-black sm:text-5xl">{t("cta.title")}</h2>
              <p className="mx-auto mt-6 max-w-xl text-lg font-medium text-blue-100">
                {t("cta.desc")}
              </p>
              <div className="mt-10">
                <Link href={session ? "/dashboard" : "/login"}>
                  <Button variant="secondary" size="lg" className="h-14 px-10 text-lg font-bold text-blue-600 border-none hover:bg-white transition-colors">
                    {t("cta.button")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-bold text-gray-400">
            © {new Date().getFullYear()} SmartApply. {t("footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}
