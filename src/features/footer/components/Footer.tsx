"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  HiOutlineCog,
  HiCog,
  HiDocumentCurrencyDollar,
  HiHome,
  HiOutlineDocumentCurrencyDollar,
  HiOutlineHome,
} from "react-icons/hi2";

const pages = [
  {
    path: "/settings",
    title: "تنظیمات",
    icon: HiOutlineCog,
    activeIcon: HiCog,
  },
  {
    path: "/transactions",
    title: "تراکنش ها",
    icon: HiOutlineDocumentCurrencyDollar,
    activeIcon: HiDocumentCurrencyDollar,
  },
  {
    path: "/",
    title: "خانه",
    icon: HiOutlineHome,
    activeIcon: HiHome,
  },
];

const Footer = () => {
  const pathname = usePathname();

  return (
    <div className="pw-bottom-bar pw-container flex items-center justify-between">
      {[...pages].reverse().map((page) => {
        const isActive = pathname === page.path;
        const Icon = isActive ? page.activeIcon : page.icon;

        return (
          <Link key={page.path} href={page.path}>
            <div className="pw-press | flex flex-col items-center justify-center">
              <Icon size={24} />
              <p>{page.title}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Footer;
