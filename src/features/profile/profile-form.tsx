"use client";

import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileFormProps = {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string;
};

export function ProfileForm(initial: ProfileFormProps) {
  const [firstName, setFirstName] = React.useState(initial.firstName);
  const [lastName, setLastName] = React.useState(initial.lastName);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    initial.avatarUrl,
  );
  const [status, setStatus] = React.useState<string | null>(null);
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const response = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ firstName, lastName, avatarUrl }),
    });

    if (!response.ok) {
      setStatus("Не удалось обновить профиль.");
      return;
    }

    setStatus("Профиль обновлен.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-16 overflow-hidden rounded-full border bg-muted">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div>
            {uploadPreset ? (
              <CldUploadWidget
                uploadPreset={uploadPreset}
                onSuccess={(result) => {
                  const secureUrl =
                    (result?.info as { secure_url?: string })?.secure_url ??
                    null;
                  if (secureUrl) {
                    setAvatarUrl(secureUrl);
                  }
                }}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => open()}
                  >
                    Загрузить аватар
                  </Button>
                )}
              </CldUploadWidget>
            ) : (
              <p className="text-xs text-muted-foreground">
                Укажите NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET для загрузки
                аватара.
              </p>
            )}
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
          <Button type="submit">Сохранить</Button>
        </form>

        {status ? (
          <p className="text-sm text-muted-foreground">{status}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
