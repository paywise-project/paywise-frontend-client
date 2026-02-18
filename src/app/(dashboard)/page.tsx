"use client";

import PaymentDue from "@/features/dashboard/component/PaymentDue";
import ThisMonth from "@/features/dashboard/component/ThisMonth";
import Wallet from "@/features/dashboard/component/Wallet";
import { useDate } from "@/features/date/hook/useDate";
import { setCredentials } from "@/features/shared/auth/slice/authSlice";
import { useAppDispatch, useAppSelector } from "@/features/shared/redux/hooks";
import { formatNumberFa } from "@/features/utils/numbers";
import { apiRouterTypeAuthenticationTelegramLoginMutation } from "@/lib/api/@tanstack/react-query.gen";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

export default function Home() {
  const { today } = useDate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const loginMutation = useMutation({
    ...apiRouterTypeAuthenticationTelegramLoginMutation(),
    onSuccess: (data) => {
      const { access_token, refresh_token, customer_uuid } = data;

      dispatch(
        setCredentials({
          accessToken: access_token,
          refreshToken: refresh_token,
          customerUuid: customer_uuid,
        }),
      );
    },
    onError: (err) => {
      console.error(err);
    },
    retry: false,
  });

  useEffect(() => {
    if (isAuthenticated) return;

    loginMutation.mutate({
      body: {
        telegram_id: 506909651,
        first_name: "!",
        last_name: "",
        telegram_username: "idkwtfimdoing",
      },
    });
  }, [isAuthenticated]);

  return (
    <div className="pw-container | py-5">
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
