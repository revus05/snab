import { redirect } from "next/navigation";
import { ProfileForm } from "@/src/features/profile/profile-form";
import { getSessionFromCookies } from "@/src/shared/lib/auth";
import { prisma } from "@/src/shared/lib/prisma";

export default async function ProfilePage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-xl">
      <ProfileForm
        email={user.email}
        firstName={user.firstName}
        lastName={user.lastName}
        avatarUrl={user.avatarUrl}
      />
    </div>
  );
}
