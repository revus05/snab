import { getSessionFromCookies } from "@/src/shared/lib/auth";
import { prisma } from "@/src/shared/lib/prisma";
import { BottomNav } from "@/src/widgets/bottom-nav/bottom-nav";
import { Header } from "@/src/widgets/header/header";
import { Sidebar } from "@/src/widgets/sidebar/sidebar";

export default async function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSessionFromCookies();
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { avatarUrl: true },
      })
    : null;

  console.log(user);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.15),transparent_55%)]">
      <Header />
      <div className="mx-auto grid min-h-[calc(100vh-56px)] max-w-7xl md:grid-cols-[230px_1fr]">
        <Sidebar initialAvatarUrl={user?.avatarUrl ?? null} />
        <main className="w-full p-4 pb-20 md:pb-6">{children}</main>
      </div>
      <BottomNav initialAvatarUrl={user?.avatarUrl ?? null} />
    </div>
  );
}
