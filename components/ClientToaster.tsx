"use client";

import { Toaster } from "@/components/ui/sonner";

export function ClientToaster() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      duration={5000} // hoặc Infinity nếu muốn persistent
    />
  );
}
