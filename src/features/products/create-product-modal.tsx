"use client";

import { PackagePlus } from "lucide-react";
import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CreateProductForm } from "@/src/features/products/create-product-form";

export function CreateProductModal() {
  const [open, setOpen] = React.useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button>
          <PackagePlus className="size-4" />
          Добавить продукт
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Новый продукт</AlertDialogTitle>
        </AlertDialogHeader>
        <CreateProductForm onSuccess={() => setOpen(false)} />
      </AlertDialogContent>
    </AlertDialog>
  );
}
