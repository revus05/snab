"use client";

import { User } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";

type ProfileNavIconProps = {
  className?: string;
  initialAvatarUrl?: string | null;
};

export function ProfileNavIcon({
  className,
  initialAvatarUrl = null,
}: ProfileNavIconProps) {
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    initialAvatarUrl,
  );

  React.useEffect(() => {
    const loadUser = async () => {
      const response = await fetch("/api/auth");
      if (!response.ok) {
        return;
      }
      const data = await response.json().catch(() => null);
      setAvatarUrl(data?.user?.avatarUrl ?? null);
    };
    const onProfileUpdated = () => {
      loadUser().catch(() => undefined);
    };

    loadUser().catch(() => undefined);
    window.addEventListener("profile-updated", onProfileUpdated);
    return () => {
      window.removeEventListener("profile-updated", onProfileUpdated);
    };
  }, []);

  React.useEffect(() => {
    setAvatarUrl(initialAvatarUrl);
  }, [initialAvatarUrl]);

  if (!avatarUrl) {
    return <User className={cn("size-4", className)} />;
  }

  return (
    <span
      className={cn(
        "relative block size-4 overflow-hidden rounded-full border",
        className,
      )}
    >
      <Image
        src={avatarUrl}
        alt="Аватар профиля"
        fill
        className="object-cover"
      />
    </span>
  );
}
