"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAppSelector } from "@/features/shared/redux/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiRouterTypePaymentGetPaymentsWithOccurrences } from "@/lib/api";
import TransList from "./TransList";
import Spinner from "@/features/shared/ui/Spinner";
import { apiRouterTypePaymentGetPaymentsWithOccurrencesQueryKey } from "@/lib/api/@tanstack/react-query.gen";

const PAGE_SIZE = 10;

const Transactions = () => {
  const { isAuthenticated, customerUuid } = useAppSelector((s) => s.auth);

  const tab = useAppSelector((s) => s.transactions.activeTab);
  // "expense" | "income"

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: apiRouterTypePaymentGetPaymentsWithOccurrencesQueryKey({
      path: { user_uuid: customerUuid ?? "" },
    }),

    initialPageParam: 1,

    enabled: isAuthenticated && !!customerUuid,

    queryFn: async ({ pageParam, signal }) => {
      const { data } = await apiRouterTypePaymentGetPaymentsWithOccurrences({
        path: { user_uuid: customerUuid as string },
        query: {
          page: pageParam,
          page_size: PAGE_SIZE,
        },

        throwOnError: true,
        signal,
      });

      return data; // SearchPaymentOutputDtov1
    },

    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (sum, p) => sum + (p.payments?.length ?? 0),
        0,
      );

      if (loaded >= (lastPage.total ?? 0)) return undefined;

      return allPages?.length + 1;
    },
  });

  const allPayments = useMemo(
    () => data?.pages.flatMap((p) => p.payments ?? []) ?? [],
    [data],
  );

  const filteredPayments = useMemo(() => {
    if (tab === "income")
      return allPayments.filter((p) => p.payment_type === "INCOME");
    if (tab === "expense")
      return allPayments.filter((p) => p.payment_type === "EXPENSE");
    return allPayments;
  }, [allPayments, tab]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading || isError) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-screen w-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-2 mt-5 w-full">
      <TransList tab={tab} data={filteredPayments} />
      {/* bottom reach sentinel */}
      <div ref={loadMoreRef} />
      {isFetchingNextPage && (
        <div className="mt-2 text-center text-xs text-muted-2">Loading...</div>
      )}
    </div>
  );
};

export default Transactions;
