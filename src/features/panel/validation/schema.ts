import { z } from "zod";
import { PaymentCategoryType } from "@/lib/api";

export type RecurrenceKey = "ONE_TIME" | "WEEKLY" | "MONTHLY" | "CUSTOM";

export const titleSchema = z
  .string()
  .trim()
  .min(1, "عنوان الزامی است")
  .max(60, "عنوان خیلی طولانی است");

export const updatePaymentSchema = z.object({
  title: titleSchema,
  notes: z.string().max(500, "یادداشت خیلی طولانی است"),
  category_type: z.custom<PaymentCategoryType>(),
});

export const createPaymentSchema = z
  .object({
    title: titleSchema,
    amount: z.number().int().positive("مبلغ باید بیشتر از ۰ باشد"),
    notes: z.string().max(500).optional(),
    category_type: z.custom<PaymentCategoryType>(),
    recurrence_type: z.custom<RecurrenceKey>().optional(),
    interval_days: z.number().int().nullable().optional(),
    total_occurrences: z.number().int().nullable().optional(),
    notify_week_before: z.boolean().optional(),
    notify_day_before: z.boolean().optional(),
    notify_on_day: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const recurrence = data.recurrence_type ?? "ONE_TIME";

    if (recurrence === "CUSTOM") {
      if (data.interval_days == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["interval_days"],
          message: "برای حالت دلخواه، فاصله روزها الزامی است",
        });
      } else if (data.interval_days < 7 || data.interval_days > 28) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["interval_days"],
          message: "فاصله باید بین ۷ تا ۲۸ روز باشد",
        });
      }
    }

    if (recurrence !== "ONE_TIME") {
      if (data.total_occurrences != null && data.total_occurrences < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["total_occurrences"],
          message: "تعداد باید حداقل ۱ باشد یا خالی بماند",
        });
      }
    }
  });
