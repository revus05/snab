"use client";

import { Loader2, Save, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  readApiErrorMessage,
  resolveClientErrorMessage,
} from "@/src/shared/lib/client-errors";

type CreateProductFormProps = {
  onSuccess?: () => void;
};

export function CreateProductForm({ onSuccess }: CreateProductFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [stock, setStock] = React.useState("0");
  const [files, setFiles] = React.useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("stock", stock);

    for (const file of files) {
      formData.append("images", file);
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          await readApiErrorMessage(response, "Не удалось создать продукт"),
        );
      }

      setName("");
      setDescription("");
      setStock("0");
      setFiles([]);
      toast.success("Продукт создан.");
      router.refresh();
      onSuccess?.();
    } catch (error) {
      toast.error(
        resolveClientErrorMessage(error, "Не удалось создать продукт"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="name">Название</Label>
        <Input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
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
          onChange={(event) => setStock(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <Label htmlFor="images" className="flex items-center gap-2">
          <Upload className="size-4" />
          Изображения
        </Label>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
        />
        {files.length > 0 ? (
          <ul className="space-y-1 text-xs text-muted-foreground">
            {files.map((file) => (
              <li key={`${file.name}-${file.size}`}>{file.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Файлы не выбраны.</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {isSubmitting ? "Сохраняем..." : "Создать продукт"}
      </Button>
    </form>
  );
}
