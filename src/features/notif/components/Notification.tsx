"use client";

import { useAppSelector } from "@/features/shared/redux/hooks";
import { formatJalaliWithRelative } from "@/features/utils/date";
import { apiRouterTypeNotificationSearchNotificationsOptions } from "@/lib/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";

const Notification = () => {
  const { isAuthenticated, customerUuid } = useAppSelector((s) => s.auth);

  const { data, isLoading, isError } = useQuery({
    ...apiRouterTypeNotificationSearchNotificationsOptions({
      path: { user_uuid: customerUuid as string },
    }),
    enabled: isAuthenticated,
  });

  return (
    <div className="mt-5">
      {data?.notifications.map((n) => {
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
    </div>
  );
};

export default Notification;
