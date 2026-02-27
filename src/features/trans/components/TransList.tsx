"use client";

import { formatNumberFa } from "@/features/utils/numbers";
import type { PaymentWithOccurrencesDtov1 } from "@/lib/api";
import TypeIcon from "@/features/shared/ui/TypeIcon";
import { HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { formatCompactJalaliDue } from "@/features/utils/date";
import { useAppDispatch, useAppSelector } from "@/features/shared/redux/hooks";
import { setPanelState, togglePanel } from "@/features/panel/slice/panelSlice";
import { setTransAction } from "../slice/transSlice";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/features/shared/ui/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/features/shared/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  apiRouterTypePaymentDeletePaymentMutation,
  apiRouterTypePaymentGetPaymentsWithOccurrencesQueryKey,
} from "@/lib/api/@tanstack/react-query.gen";
import { useRouter } from "next/navigation";

type Props =
  | { tab: "expense"; data: PaymentWithOccurrencesDtov1[] }
  | { tab: "income"; data: PaymentWithOccurrencesDtov1[] };

const TransList = (props: Props) => {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const dispatch = useAppDispatch();
  const uuid = useAppSelector((s) => s.auth.customerUuid);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    ...apiRouterTypePaymentDeletePaymentMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: apiRouterTypePaymentGetPaymentsWithOccurrencesQueryKey({
          path: { user_uuid: uuid ?? "" },
          query: {
            page: 1,
            page_size: 10,
          },
        }),
      });
      router.replace("/");
      setOpen(false);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate({
      path: {
        user_uuid: uuid ?? "",
        payment_uuid: id,
      },
    });
  };

  return (
    <>
      {props.data?.map((p) => {
        const date = formatCompactJalaliDue(p.start_datetime);

        return (
          <Accordion
            key={p.payment_uuid}
            type="single"
            collapsible
            className={`pw-card pw-press | flex items-center justify-between gap-2 w-full p-0 px-4 ${!p.is_active && "opacity-60"}`}
          >
            <AccordionItem value={p.payment_uuid} className="w-full">
              <AccordionTrigger>
                <TypeIcon
                  type={p.category_type}
                  size={28}
                  className="w-12 h-12"
                />

                <span className="flex-1 flex flex-col items-start justify-between h-12">
                  <h3>{p.title}</h3>
                  <span className="flex items-center gap-2">
                    <p className="text-muted-2 text-xs">{date.dueText}</p>
                    <p className="text-muted-2"> • </p>
                    <p className="text-muted-2">
                      {" "}
                      {formatNumberFa(p.occurrences.length)} پرداخت دیگر{" "}
                    </p>

                    {!p.is_active && (
                      <p className="text-xs text-primary">پرداخت شده</p>
                    )}
                  </span>
                </span>

                <span>
                  <h3 className="text-lg">{formatNumberFa(p.amount)} تومان</h3>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {p.occurrences.length > 0 && (
                  <div className="py-4 px-14 space-y-2">
                    {p.occurrences.map((o) => {
                      const date = formatCompactJalaliDue(o.due_datetime ?? "");

                      return (
                        <div key={o.payment_occurrence_uuid}>
                          <span className="text-muted">
                            • پرداخت {formatNumberFa(o.index)}:
                          </span>
                          <span className="text-text font-semibold">
                            {" "}
                            {date.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger className="w-full">
                      <span className="pw-press | flex items-center justify-center py-2 w-full gap-2 bg-danger/20 rounded-lg">
                        <p>حذف</p>
                        <HiOutlineTrash className="text-2xl text-danger" />
                      </span>
                    </DialogTrigger>
                    <DialogContent>
                      <h1 className="text-center text-2xl text-text">
                        آیا مطمعنید برای حذف {p.title}؟
                      </h1>
                      <DialogFooter>
                        <span
                          onClick={() => handleDelete(p.payment_uuid)}
                          className="pw-press | flex items-center justify-center py-2 w-full gap-2 bg-danger/20 rounded-lg"
                        >
                          <p>حذف</p>
                        </span>
                        <DialogClose>
                          <span className="pw-press | flex items-center justify-center w-full py-2 gap-2 bg-muted-2/20 rounded-lg">
                            <p>لغو</p>
                          </span>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <span
                    onClick={() => {
                      dispatch(togglePanel());
                      dispatch(setPanelState(props.tab));
                      dispatch(setTransAction(p));
                    }}
                    className="pw-press | flex items-center justify-center w-full py-2 gap-2 bg-muted-2/20 rounded-lg"
                  >
                    <p>ویرایش</p>
                    <HiOutlinePencilSquare className="text-2xl text-primary" />
                  </span>
                </div>{" "}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </>
  );
};

export default TransList;
