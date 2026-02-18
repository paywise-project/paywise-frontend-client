"use client";

import { useAppSelector } from "@/features/shared/redux/hooks";
import {
  apiRouterTypeExpenseSearchExpensesOptions,
  apiRouterTypeIncomeSearchIncomesOptions,
} from "@/lib/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import TransList from "./TransList";

const Transactions = () => {
  const customerUuid = useAppSelector((s) => s.auth.customerUuid);
  const tab = useAppSelector((s) => s.transactions.activeTab); // "expenses" | "income"

  const queryOptions =
    tab === "expenses"
      ? apiRouterTypeExpenseSearchExpensesOptions({
          path: { user_uuid: customerUuid as string },
        })
      : apiRouterTypeIncomeSearchIncomesOptions({
          path: { user_uuid: customerUuid as string },
        });
  // @ts-ignore
  const { data, isLoading, isError } = useQuery({
    ...queryOptions,
    enabled: Boolean(customerUuid),
  });

  if (!customerUuid) return null;
  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Error</div>;

  return (
    <div className="flex flex-col gap-2 mt-5 w-full">
      {/* @ts-ignore */}
      <TransList tab={tab} data={data} />
    </div>
  );
};

export default Transactions;
