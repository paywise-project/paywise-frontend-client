"use client";

import * as React from "react";
import { closePanel } from "../slice/panelSlice";
import { useAppDispatch, useAppSelector } from "@/features/shared/redux/hooks";
import SettingsPanel from "@/features/settings/components/SettingsPanel";
import NewFormPanel from "@/features/new-form/components/NewFormPanel";

export default function RoutePanel() {
  const dispatch = useAppDispatch();
  const { isOpen, panelState } = useAppSelector((s) => s.panel);

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
        "fixed flex flex-col justify-end left-0 bottom-0 h-screen w-full z-99999999",
        "transition duration-300 ease-out",
        isOpen
          ? "translate-y-0 bg-muted-2/40"
          : "translate-y-full bg-transparent",
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
        {panelState === "settings" && <SettingsPanel />}
        {(panelState === "income" || panelState === "expense") && (
          <NewFormPanel />
        )}
      </div>
    </div>
  );
}
