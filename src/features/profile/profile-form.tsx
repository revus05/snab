"use client";

import { Loader2, Save, Upload } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  readApiErrorMessage,
  resolveClientErrorMessage,
} from "@/src/shared/lib/client-errors";

type ProfileFormProps = {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string;
};

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export function ProfileForm(initial: ProfileFormProps) {
  const [firstName, setFirstName] = React.useState(initial.firstName);
  const [lastName, setLastName] = React.useState(initial.lastName);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    initial.avatarUrl,
  );
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const previewAvatarUrl = React.useMemo(() => {
    if (!avatarFile) {
      return avatarUrl;
    }
    return URL.createObjectURL(avatarFile);
  }, [avatarFile, avatarUrl]);

  React.useEffect(() => {
    return () => {
      if (previewAvatarUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewAvatarUrl);
      }
    };
  }, [previewAvatarUrl]);

  const onAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    if (!nextFile) {
      setAvatarFile(null);
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      toast.error("Можно загрузить только изображение.");
      event.target.value = "";
      return;
    }

    if (nextFile.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("Размер аватара не должен превышать 5 МБ.");
      event.target.value = "";
      return;
    }

    setAvatarFile(nextFile);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("currentAvatarUrl", avatarUrl ?? "");
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          await readApiErrorMessage(response, "Не удалось обновить профиль."),
        );
      }

      const data = await response.json().catch(() => null);
      setAvatarUrl(data?.user?.avatarUrl ?? avatarUrl);
      setAvatarFile(null);
      window.dispatchEvent(new Event("profile-updated"));
      toast.success("Профиль обновлен.");
    } catch (error) {
      toast.error(
        resolveClientErrorMessage(error, "Не удалось обновить профиль."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-16 overflow-hidden rounded-full border bg-muted">
            {previewAvatarUrl ? (
              <Image
                src={previewAvatarUrl}
                alt="Avatar"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="space-y-1">
            <Label htmlFor="avatar" className="flex items-center gap-2">
              <Upload className="size-4" />
              Фото профиля
            </Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
            />
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={initial.email} disabled />
          </div>
          <div className="space-y-1">
            <Label htmlFor="firstName">Имя</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Фамилия</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSubmitting ? "Сохраняем..." : "Сохранить"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
