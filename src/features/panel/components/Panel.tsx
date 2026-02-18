"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { openPanel, closePanel } from "../slice/panelSlice";
import { useAppDispatch, useAppSelector } from "@/features/shared/redux/hooks";
import SettingsPanel from "@/features/settings/components/SettingsPanel";

function getContentForPath(pathname: string) {
  if (pathname === "/") return { title: "Home", body: "Welcome back." };
  if (pathname.startsWith("/dashboard"))
    return { title: "Dashboard", body: "Here are your stats." };
  if (pathname.startsWith("/settings"))
    return { title: "Settings", body: "Update your preferences." };
  return { title: "Page", body: `You are on ${pathname}` };
}

export default function RoutePanel() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.panel.isOpen);

  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        dispatch(closePanel());
        console.log("closing");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, dispatch]);

  return (
    <div
      className={[
        "fixed flex flex-col justify-end left-0 bottom-0 z-50 bg-muted-2/40 h-screen w-full z-99999999",
        "transition-transform duration-300 ease-out",
        isOpen ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
    >
      <div
        onClick={() => dispatch(closePanel())}
        className={`w-screen h-screen bg-muted-2/20 absolute top-0 left-0 z-20`}
      />
      <div className="pw-sheet | z-50 h-9/12 rounded-4xl">
        <div
          className="pw-sheet-handle"
          onClick={() => dispatch(closePanel())}
        ></div>
        {pathname === "/settings" && <SettingsPanel />}
      </div>
    </div>
  );
}
