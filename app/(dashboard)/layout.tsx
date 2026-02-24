import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/dashboard/Navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        userName={session.user.name || "Usuario"} 
        userImage={session.user.image} 
      />
      
      <div className="flex">
        <Sidebar className="hidden lg:block shrink-0" />
        
        <main className="flex-1 overflow-x-hidden pb-20">
          <div className="mx-auto max-w-7xl pt-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation - Simple version for now */}
      <Sidebar className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 w-full flex-row border-t border-gray-100 bg-white" isMobile />
    </div>
  );
}
