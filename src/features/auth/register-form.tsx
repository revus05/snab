"use client";

import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(
          await readApiErrorMessage(response, "Ошибка регистрации"),
        );
      }

      toast.success("Аккаунт создан.");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(resolveClientErrorMessage(error, "Ошибка регистрации"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto mt-12 w-full max-w-md">
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="firstName">Имя</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, firstName: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Фамилия</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, lastName: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            <UserPlus className="size-4" />
            {isLoading ? "Создаем..." : "Создать аккаунт"}
          </Button>
        </form>
        <p className="mt-3 text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-primary underline">
            Войти
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
