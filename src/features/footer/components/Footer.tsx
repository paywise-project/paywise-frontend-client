"use client";

import { setPanelState, togglePanel } from "@/features/panel/slice/panelSlice";
import { useAppDispatch, useAppSelector } from "@/features/shared/redux/hooks";
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
  const dispatch = useAppDispatch();
  const tab = useAppSelector((s) => s.transactions.activeTab);

  const handleClick = () => {
    dispatch(setPanelState(tab));
    dispatch(togglePanel());
  };

  return (
    <div className="pw-bottom-bar pw-container">
      {pathname === "/transactions" && (
        <div
          className="absolute bg-surface rounded-t-lg flex items-center justify-center transition pw-appear"
          style={{
            height: 60,
            top: -55,
            width: "95%",
            left: "50%",
            transform: "translateX(-50%)",
            border: "5px var(--color-surface)",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <button
            className="bg-primary text-surface"
            style={{ width: "98%", borderRadius: "16px 16px 0 0", height: 50 }}
            onClick={handleClick}
          >
            {tab === "expense" ? "افزودن هزینه" : "افزودن درآمد"}
          </button>
        </div>
      )}
      <div className="flex items-center justify-between">
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
    </div>
  );
};

export default Footer;
