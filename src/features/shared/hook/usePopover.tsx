"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function usePopover() {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const pathname = usePathname();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return {
    open,
    anchorEl,
    openAt: (el: HTMLElement) => {
      setAnchorEl(el);
      setOpen(true);
    },
    toggleAt: (el: HTMLElement) => {
      setAnchorEl(el);
      setOpen((v) => !v);
    },
    close: () => setOpen(false),
    setOpen,
  };
}
