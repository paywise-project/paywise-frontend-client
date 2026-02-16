"use client";

import { apiRouterTypeAuthenticationTelegramLogin } from "@/lib/api";
import { useEffect } from "react";
import Header from "./_components/Header";
import Wallet from "./_components/Wallet";

export default function Home() {
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
    <div className="bg-gradient-to-b from-0% from-brand via-30% via-zinc-300 to-100% to-white w-screen h-screen ds-container">
      <Header />
      <Wallet />
    </div>
  );
}
