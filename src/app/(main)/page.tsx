"use client";

import { apiRouterTypeAuthenticationTelegramLogin } from "@/lib/api";
import { useEffect } from "react";
import Header from "./_components/Header";
import Wallet from "./_components/Wallet";
import WebApp from "@twa-dev/sdk";

export default function Home() {
  const { user } = WebApp.initDataUnsafe;

  useEffect(() => {
    async function login() {
      try {
        const res = await apiRouterTypeAuthenticationTelegramLogin<true>({
          body: {
            telegram_id: user?.id,
            first_name: user?.first_name,
            last_name: user?.last_name,
            telegram_username: user?.username,
          },
          throwOnError: true,
        });

        if (!res?.data) return;

        const { access_token, refresh_token, customer_uuid } = res.data;

        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("customer_uuid", customer_uuid);

        console.log("Tokens stored successfully");
      } catch (error) {
        console.error("Login failed:", error);
      }
    }
    if (!!WebApp) {
      login();
    }
  }, []);

  return (
    <div className="bg-gradient-to-b from-0% from-brand via-30% via-zinc-300 to-100% to-white w-screen h-screen ds-container">
      <Header />
      <Wallet />
    </div>
  );
}
