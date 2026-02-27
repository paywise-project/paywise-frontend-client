"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/features/shared/redux/hooks";
import { formatJalaliWithRelative } from "@/features/utils/date";
import { apiRouterTypeNotificationSearchNotifications } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiRouterTypeNotificationSearchNotificationsInfiniteQueryKey } from "@/lib/api/@tanstack/react-query.gen";

const PAGE_SIZE = 10;

const Notification = () => {
  const { isAuthenticated, customerUuid } = useAppSelector((s) => s.auth);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: apiRouterTypeNotificationSearchNotificationsInfiniteQueryKey({
      path: { user_uuid: customerUuid ?? "" },
    }),
    initialPageParam: 1,

    enabled: isAuthenticated && !!customerUuid,

    queryFn: async ({ pageParam, signal }) => {
      const { data } = await apiRouterTypeNotificationSearchNotifications({
        path: { user_uuid: customerUuid as string },
        query: { page: pageParam, page_size: PAGE_SIZE },

        throwOnError: true,
        signal,
      });

      return data; // SearchNotificationOutputDtov1
    },

    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (sum, p) => sum + (p.notifications?.length ?? 0),
        0,
      );

      if (loaded >= (lastPage.total ?? 0)) return undefined;

      return allPages.length + 1; // pages start at 1
    },
  });

  const notifications = data?.pages.flatMap((p) => p.notifications ?? []) ?? [];

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

  // keep your existing behavior; you can render error UI if you want
  if (isLoading) return <div className="mt-5" />;
  if (isError) return <div className="mt-5" />;

  return (
    <div className="mt-5">
      {notifications.map((n) => {
        const date = formatJalaliWithRelative(n.sent_at!);
        return (
          <div
            key={n.notification_uuid}
            className="pw-card | flex items-start gap-2"
          >
            <span className="pw-icon-btn pw-btn--danger h-11 w-11 text-xl">
              ⏰
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="pw-title | text-xl">{n.title}</h2>
              <p className="text-base text-muted">{n.message}</p>
              <span className="flex items-center gap-1 text-xs text-muted-2">
                <p>{date.dateText}</p>
                <p>{date.timeText}</p>
                <p>{date.relative.text}</p>
              </span>
            </div>
          </div>
        );
      })}

      {/* sentinel (bottom reach) */}
      <div ref={loadMoreRef} />

      {/* optional: loading state for next page */}
      {isFetchingNextPage && (
        <div className="mt-3 text-center text-xs text-muted-2">Loading...</div>
      )}
    </div>
  );
};

export default Notification;
