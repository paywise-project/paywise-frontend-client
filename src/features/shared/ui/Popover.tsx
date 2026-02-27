"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

type Placement = "bottom" | "top" | "left" | "right";

type PopoverProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  anchorEl: HTMLElement | null;
  placement?: Placement;
  offset?: number;
  className?: string;
  children: React.ReactNode;
};

export function Popover({
  open,
  onOpenChange,
  anchorEl,
  placement = "bottom",
  offset = 8,
  className = "",
  children,
}: PopoverProps) {
  const popRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if (anchorEl?.contains(t)) return;
      onOpenChange(false);
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onOpenChange, anchorEl]);

  const computePos = () => {
    if (!open || !anchorEl || !popRef.current) return;

    const a = anchorEl.getBoundingClientRect();
    const p = popRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = a.top - p.height - offset;
        left = a.left + (a.width - p.width) / 2;
        break;
      case "bottom":
        top = a.bottom + offset;
        left = a.left + (a.width - p.width) / 2;
        break;
      case "left":
        top = a.top + (a.height - p.height) / 2;
        left = a.left - p.width - offset;
        break;
      case "right":
        top = a.top + (a.height - p.height) / 2;
        left = a.right + offset;
        break;
    }

    // clamp to viewport with small padding
    const pad = 8;
    left = Math.max(pad, Math.min(left, window.innerWidth - p.width - pad));
    top = Math.max(pad, Math.min(top, window.innerHeight - p.height - pad));

    setPos({ top: top + window.scrollY, left: left + window.scrollX });
  };

  useLayoutEffect(() => {
    computePos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, anchorEl, placement, offset, children]);

  useEffect(() => {
    if (!open) return;
    const onReflow = () => computePos();
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, anchorEl, placement, offset]);

  if (!open) return null;

  return (
    <div
      ref={popRef}
      role="dialog"
      aria-modal="false"
      style={{
        position: "absolute",
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        zIndex: 50,
        opacity: pos ? 1 : 0,
        pointerEvents: pos ? "auto" : "none",
      }}
      className={[
        "pw-card rounded-2xl border border-slate-200 bg-surface shadow-xl",
        "p-3 text-text",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
