"use client";

import PaymentDue from "@/features/dashboard/component/PaymentDue";
import ThisMonth from "@/features/dashboard/component/ThisMonth";
import Wallet from "@/features/dashboard/component/Wallet";
import { useDate } from "@/features/date/hook/useDate";
import { formatNumberFa } from "@/features/utils/numbers";
import { apiRouterTypeAuthenticationTelegramLogin } from "@/lib/api";
import { useEffect } from "react";

export default function Home() {
  const { today } = useDate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (typeof window === "undefined") return;

      const WebAppModule = await import("@twa-dev/sdk");
      const WebApp = WebAppModule.default;

      const user = WebApp?.initDataUnsafe?.user;
      const telegramId = user?.id;

      if (typeof telegramId !== "number") {
        console.warn(
          "No Telegram user id found. Are you running inside Telegram WebApp?",
        );
        return;
      }

      try {
        const res = await apiRouterTypeAuthenticationTelegramLogin<true>({
          body: {
            telegram_id: telegramId,
            first_name: user?.first_name ?? "",
            last_name: user?.last_name ?? "",
            telegram_username: user?.username ?? "",
          },
          throwOnError: true,
        });

        if (!res?.data || cancelled) return;

        const { access_token, refresh_token, customer_uuid } = res.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("customer_uuid", customer_uuid);
      } catch (error) {
        console.error("Login failed:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pw-container py-5">
      <div className="pw-card | text-center mb-5">
        <p>📅</p>
        <h2 className="text-base text-text font-medium">{today}</h2>
      </div>
      <Wallet type="expense" />
      <Wallet type="income" />
      <div className="pw-card | bg-primary text-center py-6">
        <h1 className="pw-title | mb-1">💰</h1>
        <h3 className="pw-label | text-surface mb-2">مانده حساب</h3>
        <h1 className={`pw-title | text-surface text-[32px]`}>
          {formatNumberFa(15000000)} تومان
        </h1>
      </div>
      <PaymentDue />
      <ThisMonth />
    </div>
  );
}
