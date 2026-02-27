"use client";

import { usePathname } from "next/navigation";
import MainHead from "./MainHead";
import NotifHead from "@/features/notif/components/NotifHead";
import TransHead from "@/features/trans/components/TransHead";
import SettingsHead from "@/features/settings/components/SettingsHead";
import NewFormHead from "@/features/new-form/components/NewFormHead";

const Header = () => {
  const pathname = usePathname();

  return (
    <div className="pw-container pw-header | flex">
      {pathname === "/" && <MainHead />}
      {pathname === "/transactions" && <TransHead />}
      {pathname === "/notification" && <NotifHead />}
      {pathname === "/settings" && <SettingsHead />}
      {pathname === "/new-form" && <NewFormHead />}
    </div>
  );
};

export default Header;
