"use client";

import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateProductForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [stock, setStock] = React.useState("0");
  const [imageUrl, setImageUrl] = React.useState("");
  const [images, setImages] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const addManualImage = () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) {
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setImageUrl("");
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        stock: Number(stock),
        images,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Не удалось создать продукт");
      return;
    }

    setName("");
    setDescription("");
    setStock("0");
    setImages([]);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новый продукт (админ)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="stock">Остаток</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 rounded-lg border p-3">
            <Label>Изображения</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={addManualImage}>
                Добавить URL
              </Button>
            </div>
            {uploadPreset ? (
              <CldUploadWidget
                uploadPreset={uploadPreset}
                onSuccess={(result) => {
                  const secureUrl =
                    (result?.info as { secure_url?: string })?.secure_url ??
                    null;
                  if (secureUrl) {
                    setImages((prev) => [...prev, secureUrl]);
                  }
                }}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => open()}
                  >
                    Загрузить в Cloudinary
                  </Button>
                )}
              </CldUploadWidget>
            ) : (
              <p className="text-xs text-muted-foreground">
                Укажите NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET для загрузки.
              </p>
            )}
            <ul className="space-y-1 text-xs text-muted-foreground">
              {images.map((image) => (
                <li key={image} className="truncate">
                  {image}
                </li>
              ))}
            </ul>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit">Создать продукт</Button>
        </form>
      </CardContent>
    </Card>
  );
}
