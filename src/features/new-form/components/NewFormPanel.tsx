"use client";

import { useAppDispatch, useAppSelector } from "@/features/shared/redux/hooks";
import { formatNumberFa } from "@/features/utils/numbers";
import { PaymentCategoryType } from "@/lib/api";
import { HiCalendar, HiCheck } from "react-icons/hi2";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiRouterTypePaymentCreatePaymentMutation,
  apiRouterTypePaymentGetCalendarQueryKey,
  apiRouterTypePaymentGetPaymentsWithOccurrencesQueryKey,
  apiRouterTypePaymentUpdatePaymentMutation,
} from "@/lib/api/@tanstack/react-query.gen";
import { usePopover } from "@/features/shared/hook/usePopover";
import { Popover } from "@/features/shared/ui/Popover";
import ShamsiDatePicker from "@/features/date/component/ShamsiDatePicker";
import { closePanel, togglePanel } from "@/features/panel/slice/panelSlice";
import { formatJalaliWithRelative } from "@/features/utils/date";
import { getNextShamsiMonths } from "@/features/utils/monthFinder";
import { setTransAction } from "@/features/trans/slice/transSlice";
import {
  validateCreatePayment,
  validateUpdatePayment,
  PaymentFieldErrors,
} from "@/features/panel/validation/validation";
import { useRouter } from "next/navigation";

const PaymentCategoryTypeFa: Record<PaymentCategoryType, string> = {
  RENT: "اجاره",
  UTILITIES: "قبوض",
  LOAN: "وام",
  FOOD: "خوراک",
  TRANSPORT: "حمل‌ونقل",
  INSURANCE: "بیمه",
  SUBSCRIPTION: "اشتراک",
  SALARY: "حقوق",
  FREELANCE: "فریلنسری",
  OTHER: "سایر",
};

type ReminderKey = "notify_week_before" | "notify_day_before" | "notify_on_day";

const reminderOptions: { title: string; key: ReminderKey }[] = [
  { title: "یک هفته قبل", key: "notify_week_before" },
  { title: "یک روز قبل", key: "notify_day_before" },
  { title: "همان روز", key: "notify_on_day" },
];

type RecurrenceKey = "ONE_TIME" | "WEEKLY" | "MONTHLY" | "CUSTOM";

const recurrenceType: { title: string; key: RecurrenceKey }[] = [
  { title: "یک پرداخت", key: "ONE_TIME" },
  { title: "هفتگی", key: "WEEKLY" },
  { title: "ماهانه", key: "MONTHLY" },
  { title: "دلخواه", key: "CUSTOM" },
];

const paymentCategoryOptions = Object.keys(
  PaymentCategoryTypeFa,
) as PaymentCategoryType[];

const toEnDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

const NewFormPanel = () => {
  const [errors, setErrors] = useState<PaymentFieldErrors>({});

  const { start, end } = getNextShamsiMonths(0, 12);

  const { customerUuid } = useAppSelector((s) => s.auth);

  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.panel.panelState);
  const transaction = useAppSelector((s) => s.transactions.transaction);

  const [form, setForm] = useState<{
    title: string;
    amount: number;
    notes: string;
    category_type: PaymentCategoryType;
    recurrence_type: RecurrenceKey;
    interval_days: number | null;
    total_occurrences: number | null;
    notify_week_before: boolean;
    notify_day_before: boolean;
    notify_on_day: boolean;
  }>({
    title: transaction?.title ?? "",
    amount: transaction?.amount ?? 0,
    notes: transaction?.notes ?? "",
    category_type: transaction?.category_type ?? "OTHER",
    recurrence_type: transaction?.recurrence_type ?? "ONE_TIME",
    interval_days: transaction?.interval_days ?? null,
    total_occurrences: transaction?.total_occurrences ?? null,
    notify_week_before: transaction?.notify_week_before ?? false,
    notify_day_before: transaction?.notify_day_before ?? false,
    notify_on_day: transaction?.notify_on_day ?? false,
  });

  useEffect(() => {
    if (!transaction) return;

    setForm({
      title: transaction.title ?? "",
      amount: transaction.amount ?? 0,
      notes: transaction.notes ?? "",
      category_type: transaction.category_type ?? "OTHER",
      recurrence_type: transaction.recurrence_type ?? "ONE_TIME",
      interval_days: transaction.interval_days ?? null,
      total_occurrences: transaction.total_occurrences ?? null,
      notify_week_before: transaction.notify_week_before ?? false,
      notify_day_before: transaction.notify_day_before ?? false,
      notify_on_day: transaction.notify_on_day ?? false,
    });
  }, [transaction]);

  const parseDateOrNull = (value?: string | null): Date | null => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const [date, setDate] = useState<Date | null>(() =>
    parseDateOrNull(transaction?.start_datetime),
  );

  const router = useRouter();

  const pop = usePopover();

  const isIncome = state === "income";

  const queryClient = useQueryClient();
  const createMutate = useMutation({
    ...apiRouterTypePaymentCreatePaymentMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: apiRouterTypePaymentGetPaymentsWithOccurrencesQueryKey({
          path: { user_uuid: customerUuid ?? "" },
        }),
      });
      queryClient.refetchQueries({
        queryKey: apiRouterTypePaymentGetCalendarQueryKey({
          path: { user_uuid: customerUuid ?? "" },
          query: {
            start_datetime: start,
            end_datetime: end,
          },
        }),
      });

      setForm({
        title: "",
        amount: 0,
        notes: "",
        category_type: "OTHER",
        recurrence_type: "ONE_TIME",
        interval_days: null,
        total_occurrences: null,
        notify_week_before: false,
        notify_day_before: false,
        notify_on_day: false,
      });
      dispatch(closePanel());
      router.replace("/");
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const updatePaymentMutation = useMutation({
    ...apiRouterTypePaymentUpdatePaymentMutation(),
    onSuccess: () => {
      dispatch(togglePanel());
      queryClient.refetchQueries({
        queryKey: apiRouterTypePaymentGetPaymentsWithOccurrencesQueryKey({
          path: { user_uuid: customerUuid ?? "" },
        }),
      });

      setForm({
        title: "",
        amount: 0,
        notes: "",
        category_type: "OTHER",
        recurrence_type: "ONE_TIME",
        interval_days: null,
        total_occurrences: null,
        notify_week_before: false,
        notify_day_before: false,
        notify_on_day: false,
      });
      dispatch(closePanel());
      dispatch(setTransAction(null));
      router.replace("/");
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const validation = transaction
    ? validateUpdatePayment({
        title: form.title,
        notes: form.notes,
        category_type: form.category_type,
      })
    : validateCreatePayment(form);

  const handleAddPayment = () => {
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    if (transaction === null) {
      createMutate.mutate({
        body: {
          ...form,
          payment_type: isIncome ? "INCOME" : "EXPENSE",
          start_datetime: date?.toISOString() ?? new Date().toISOString(),
        },
        path: {
          user_uuid: customerUuid ?? "",
        },
      });
    }

    if (transaction?.payment_uuid) {
      updatePaymentMutation.mutate({
        path: {
          user_uuid: customerUuid ?? "",
          payment_uuid: transaction.payment_uuid,
        },
        body: {
          title: form.title,
          category_type: form.category_type,
          notes: form.notes,
        },
      });
    }
  };

  const isSubmitDisabled =
    !validation.ok || createMutate.isPending || updatePaymentMutation.isPending;

  return (
    <div className="h-full">
      <div className="pw-sheet-head pw-title">
        {isIncome ? "افزودن درآمد" : "افزودن هزینه"}
      </div>
      <div className="pw-sheet-body | flex flex-col items-center justify-between w-full pb-10">
        <div className="w-full space-y-4">
          {/* title */}
          <p
            className={`font-semibold mb-2 ${errors.title ? "text-danger" : "text-text"}`}
          >
            عنوان
          </p>
          <input
            type="text"
            value={form.title}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, title: e.target.value }));
              if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
            }}
            placeholder={isIncome ? "حقوق" : "اجاره منزل"}
            className={`w-full p-2 rounded-lg border ${
              errors.title ? "border-loan" : "border-primary-2"
            }`}
          />
          {/* amount */}

          <p
            className={`font-semibold mb-2 ${errors.amount ? "text-danger" : "text-text"}`}
          >
            مبلغ (تومان)
          </p>

          <input
            type="text"
            inputMode="numeric"
            value={form.amount ? formatNumberFa(form.amount) : ""}
            onChange={(e) => {
              const raw = toEnDigits(e.target.value).replace(/[^\d]/g, "");
              setForm((prev) => ({
                ...prev,
                amount: raw === "" ? 0 : Number(raw),
              }));
              if (errors.amount)
                setErrors((p) => ({ ...p, amount: undefined }));
            }}
            placeholder={formatNumberFa(5000000)}
            disabled={!!transaction?.amount}
            className={`w-full p-2 rounded-lg border ${
              transaction?.amount
                ? "bg-muted-2/20 text-muted border-muted"
                : errors.amount
                  ? "border-loan"
                  : "border-primary-2"
            }`}
          />
          {/* category_type */}

          <p
            className={`font-semibold mb-2 ${errors.category_type ? "text-danger" : "text-text"}`}
          >
            دسته بندی
          </p>

          <div className="grid grid-cols-3 gap-2">
            {paymentCategoryOptions.map((c) => (
              <button
                key={PaymentCategoryTypeFa[c]}
                type="button"
                className={`pw-press | w-full text-sm py-2 rounded-lg ${
                  form.category_type === c
                    ? "bg-primary/20 text-primary font-semibold border border-primary"
                    : "bg-muted-2/20 text-text"
                }`}
                onClick={() =>
                  setForm((prev) => ({ ...prev, category_type: c }))
                }
              >
                {PaymentCategoryTypeFa[c]}
              </button>
            ))}
          </div>

          {/* start_datetime */}
          <p className="text-text font-semibold mb-2">تاریخ شروع</p>
          <button
            type="button"
            className={`pw-press | flex items-center gap-2 h-14 px-3 rounded-lg ${transaction?.start_datetime ? "text-muted bg-muted-2/20" : "text-surface bg-primary hover:bg-primary-2"}`}
            disabled={!!transaction?.start_datetime}
            onClick={(e) => pop.toggleAt(e.currentTarget)}
          >
            {date ? (
              <p>{formatJalaliWithRelative(date?.toISOString()).dateText}</p>
            ) : (
              <>
                <p>انتخاب تاریخ</p>
                <HiCalendar className="text-2xl" />
              </>
            )}
          </button>

          {/* occurances */}

          <>
            <p className="text-text font-semibold mb-2">
              {isIncome ? "نحوه دریافت" : "نحوه بازپرداخت"}
            </p>
            <div className="flex items-center gap-2">
              {recurrenceType.map((o) => {
                return (
                  <button
                    key={o.key}
                    className={`pw-press | text-center p-2 w-full rounded-lg ${form.recurrence_type === o.key ? "bg-primary text-surface" : "bg-muted-2/20 text-text"}`}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, recurrence_type: o.key }))
                    }
                  >
                    {o.title}
                  </button>
                );
              })}
            </div>
          </>

          {form.recurrence_type === "CUSTOM" && (
            <div>
              <p
                className={`font-semibold mb-2 ${errors.interval_days ? "text-danger" : "text-text"}`}
              >
                {isIncome ? "تاریخ دریافت" : "تاریخ بازپرداخت"}
              </p>

              <input
                type="text"
                inputMode="numeric"
                value={
                  form.interval_days ? formatNumberFa(form.interval_days) : ""
                }
                onChange={(e) => {
                  const raw = toEnDigits(e.target.value).replace(/[^\d]/g, "");
                  setForm((prev) => ({
                    ...prev,
                    interval_days: raw === "" ? null : Number(raw),
                  }));
                  if (errors.interval_days)
                    setErrors((p) => ({ ...p, interval_days: undefined }));
                }}
                placeholder={formatNumberFa(7)}
                disabled={!!transaction?.amount}
                className={`w-full p-2 rounded-lg border mb-1 ${
                  transaction?.amount
                    ? "bg-muted-2/20 text-muted border-muted"
                    : errors.interval_days
                      ? "border-loan"
                      : "border-primary-2"
                }`}
              />
              <p className="text-muted-2 text-xs">
                تاریخ باید بین ۷ تا ۲۸ باشد.
              </p>
            </div>
          )}

          {form.recurrence_type !== "ONE_TIME" && (
            <div>
              <p
                className={`font-semibold mb-2 ${errors.total_occurrences ? "text-danger" : "text-text"}`}
              >
                {isIncome ? "تعداد دریافت" : "تعداد بازپرداخت"}
              </p>

              <input
                type="text"
                inputMode="numeric"
                value={
                  form.total_occurrences
                    ? formatNumberFa(form.total_occurrences)
                    : ""
                }
                onChange={(e) => {
                  const raw = toEnDigits(e.target.value).replace(/[^\d]/g, "");
                  setForm((prev) => ({
                    ...prev,
                    total_occurrences: raw === "" ? null : Number(raw),
                  }));
                  if (errors.total_occurrences)
                    setErrors((p) => ({ ...p, total_occurrences: undefined }));
                }}
                placeholder={formatNumberFa(0)}
                disabled={!!transaction?.amount}
                className={`w-full p-2 rounded-lg border mb-1 ${
                  transaction?.amount
                    ? "bg-muted-2/20 text-muted border-muted"
                    : errors.total_occurrences
                      ? "border-loan"
                      : "border-primary-2"
                }`}
              />
              <p className="text-muted-2 text-xs">
                فیلد خالی: ∞ {isIncome ? "دریافت" : "بازپرداخت"}
              </p>
            </div>
          )}

          {/* notify */}
          {!isIncome && <p className="text-text font-semibold mb-2">یادآوری</p>}
          {!isIncome &&
            reminderOptions.map((r) => {
              const active = form[r.key];

              return (
                <button
                  key={r.key}
                  type="button"
                  className={`pw-press | h-12 w-full flex items-center gap-2 p-2 rounded-lg ${
                    active ? "bg-primary/20" : "bg-muted-2/20"
                  }`}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      [r.key]: !prev[r.key as keyof typeof prev],
                    }))
                  }
                >
                  <span
                    className={`w-5 h-5 rounded-[5px] border-2 ${
                      active ? "border-primary bg-primary" : "border-muted"
                    }`}
                  >
                    {active && <HiCheck className="text-surface" />}
                  </span>
                  <p className="text-text text-sm">{r.title}</p>
                </button>
              );
            })}

          {/* notes */}
          <p className="text-text font-semibold mb-2">یادداشت (اختیاری)</p>
          <textarea
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="border border-muted-2/20 w-full p-2 h-20 text-sm rounded-lg"
            placeholder="توضیخات اضافه..."
          />
        </div>
      </div>
      <div className="pw-sheet-actions | flex items-center justify-between w-full gap-4">
        <button
          type="button"
          className="pw-press | w-full bg-muted-2/40 text-muted py-4 rounded-lg"
          onClick={() => dispatch(togglePanel())}
        >
          لغو
        </button>
        <button
          type="button"
          className={`pw-press | w-full py-4 rounded-lg ${
            isSubmitDisabled
              ? "bg-muted-2/40 text-muted cursor-not-allowed"
              : "bg-primary text-surface"
          }`}
          onClick={handleAddPayment}
        >
          ذخیره
        </button>
      </div>
      <Popover
        open={pop.open}
        onOpenChange={pop.setOpen}
        anchorEl={pop.anchorEl}
        placement="top"
      >
        <ShamsiDatePicker
          popover={false}
          onChangeAction={(payload) => {
            setDate(payload.gregorianDate);
            pop.close();
          }}
        />
      </Popover>
    </div>
  );
};

export default NewFormPanel;
