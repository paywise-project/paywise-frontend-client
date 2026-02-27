"use client";

// 'RENT', 'UTILITIES', 'LOAN', 'FOOD', 'TRANSPORT', 'INSURANCE', 'SUBSCRIPTION', 'SALARY', 'FREELANCE' or 'OTHER'
import {
  HiOutlineBuildingOffice,
  HiOutlinePuzzlePiece,
  HiOutlineShieldCheck,
  HiOutlineWrenchScrewdriver,
  HiOutlineDocumentCurrencyDollar,
  HiOutlineShoppingCart,
  HiOutlineRocketLaunch,
  HiOutlineTicket,
  HiOutlineCurrencyDollar,
  HiOutlineUser,
} from "react-icons/hi2";

import { IconType } from "react-icons";

export const TRANSACTION_TYPES = [
  "RENT",
  "UTILITIES",
  "LOAN",
  "FOOD",
  "TRANSPORT",
  "INSURANCE",
  "SUBSCRIPTION",
  "SALARY",
  "FREELANCE",
  "OTHER",
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

const typeIconMap: Record<TransactionType, IconType> = {
  RENT: HiOutlineBuildingOffice,
  UTILITIES: HiOutlineWrenchScrewdriver,
  LOAN: HiOutlineDocumentCurrencyDollar,
  FOOD: HiOutlineShoppingCart,
  TRANSPORT: HiOutlineRocketLaunch,
  INSURANCE: HiOutlineShieldCheck,
  SUBSCRIPTION: HiOutlineTicket,
  SALARY: HiOutlineCurrencyDollar,
  FREELANCE: HiOutlineUser,
  OTHER: HiOutlinePuzzlePiece,
};

const typeBgClass: Record<TransactionType, string> = {
  RENT: "bg-[var(--color-rent)]",
  UTILITIES: "bg-[var(--color-utilities)]",
  LOAN: "bg-[var(--color-loan)]",
  FOOD: "bg-[var(--color-food)]",
  TRANSPORT: "bg-[var(--color-transport)]",
  INSURANCE: "bg-[var(--color-insurance)]",
  SUBSCRIPTION: "bg-[var(--color-subscription)]",
  SALARY: "bg-[var(--color-salary)]",
  FREELANCE: "bg-[var(--color-freelance)]",
  OTHER: "bg-[var(--color-other)]",
};

type Props = {
  type: TransactionType;
  size?: number;
  className?: string;
};

export default function TypeIcon({ type, size = 20, className }: Props) {
  const Icon = typeIconMap[type];

  const bgClass = typeBgClass[type];

  return (
    <span
      className={`pw-icon-btn | text-surface ${bgClass} ${className ?? ""}`}
    >
      <Icon size={size} />
    </span>
  );
}
