"use client";

import { usePathname } from "next/navigation";
import MainHead from "./MainHead";
import NotifHead from "@/features/notif/components/NotifHead";
import TransHead from "@/features/trans/components/TransHead";
import SettingsHead from "@/features/settings/components/SettingsHead";

const Header = () => {
  const pathname = usePathname();

  return (
    <div className="pw-container pw-header | flex">
      {pathname === "/" && <MainHead />}
      {pathname === "/transactions" && <TransHead />}
      {pathname === "/notification" && <NotifHead />}
      {pathname === "/settings" && <SettingsHead />}
    </div>
  );
};

export default Header;
