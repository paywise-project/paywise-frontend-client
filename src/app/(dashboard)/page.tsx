"use client";

import PaymentDue from "@/features/dashboard/component/PaymentDue";
import ThisMonth from "@/features/dashboard/component/ThisMonth";
import Wallet from "@/features/dashboard/component/Wallet";
import WeeklyCalendar from "@/features/dashboard/component/WeeklyCalendar";
import { setCredentials } from "@/features/shared/auth/slice/authSlice";
import { useAppDispatch, useAppSelector } from "@/features/shared/redux/hooks";
import Spinner from "@/features/shared/ui/Spinner";
import { getNextShamsiMonths } from "@/features/utils/monthFinder";
import {
  apiRouterTypeAuthenticationTelegramLoginMutation,
  apiRouterTypeBalanceGetBalanceOptions,
  apiRouterTypePaymentGetCalendarOptions,
  apiRouterTypePaymentGetUpcomingPaymentOptions,
} from "@/lib/api/@tanstack/react-query.gen";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import Cookies from "js-cookie";

export default function Home() {
  const didLoginRef = useRef(false);

  const dispatch = useAppDispatch();
  const { isAuthenticated, customerUuid } = useAppSelector((s) => s.auth);
  const { start, end } = getNextShamsiMonths(0, 12);

  const loginMutation = useMutation({
    ...apiRouterTypeAuthenticationTelegramLoginMutation(),
    onSuccess: (data) => {
      const { access_token, refresh_token, customer_uuid } = data;

      Cookies.set("access_token", access_token, {
        expires: 1 / 24, // 1 hour (in days)
        secure: process.env.NODE_ENV === "production" ? true : false, // only over HTTPS
        sameSite: "none",
        path: "/",
      });

      Cookies.set("refresh_token", refresh_token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === "production" ? true : false, // only over HTTPS
        sameSite: "none",
        path: "/",
      });

      dispatch(
        setCredentials({
          customerUuid: customer_uuid,
        }),
      );
    },
    onError: (err) => {
      console.log(err);

      console.error(err);
    },
    retry: false,
  });

  useEffect(() => {
    const token = Cookies.get("access_token");

    if (isAuthenticated) return;
    if (didLoginRef.current) return;
    didLoginRef.current = true;

    loginMutation.mutate({
      body: {
        telegram_id: 506909651,
        first_name: "!",
        last_name: "",
        telegram_username: "idkwtfimdoing",
      },
    });
  }, [isAuthenticated, loginMutation]);

  const {
    data: calendarData,
    isLoading: calendarLoading,
    isError: calendarError,
  } = useQuery({
    ...apiRouterTypePaymentGetCalendarOptions({
      path: { user_uuid: customerUuid as string },
      query: {
        start_datetime: start,
        end_datetime: end,
      },
    }),

    enabled: isAuthenticated && !!customerUuid,
  });

  const {
    data: balanceData,
    isLoading: balanceLoading,
    error: balanceError,
  } = useQuery({
    ...apiRouterTypeBalanceGetBalanceOptions({
      path: { user_uuid: customerUuid as string },
    }),
    enabled: isAuthenticated && !!customerUuid,
  });

  const {
    data: dueData,
    isLoading: dueLoading,
    error: dueError,
  } = useQuery({
    ...apiRouterTypePaymentGetUpcomingPaymentOptions({
      path: { user_uuid: customerUuid ?? "" },
      query: { payment_type: "EXPENSE" },
    }),
    enabled: isAuthenticated && !!customerUuid,
  });

  const pageLoading =
    (!isAuthenticated && loginMutation.isPending) ||
    (isAuthenticated && calendarLoading && balanceLoading && dueLoading);

  if (pageLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center -mt-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="pw-container | py-5">
      <WeeklyCalendar date={calendarData?.items} />
      <Wallet balance={balanceData} />

      <PaymentDue payment={dueData} />
      <ThisMonth />
    </div>
  );
}
