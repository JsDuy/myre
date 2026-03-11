"use client";

import { useEffect } from "react";

export function HydrationFix() {
  useEffect(() => {
    // Xóa attribute gây lỗi từ extension
    if (document.body.hasAttribute("cz-shortcut-listen")) {
      document.body.removeAttribute("cz-shortcut-listen");
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "cz-shortcut-listen"
        ) {
          document.body.removeAttribute("cz-shortcut-listen");
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["cz-shortcut-listen"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
