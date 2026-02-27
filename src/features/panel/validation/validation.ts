import { z } from "zod";
import { createPaymentSchema, updatePaymentSchema } from "./schema";

export type PaymentFieldErrors = Partial<
  Record<
    | "title"
    | "amount"
    | "notes"
    | "category_type"
    | "interval_days"
    | "total_occurrences",
    string
  >
>;

const mapZodErrors = (issues: z.core.$ZodIssue[]): PaymentFieldErrors => {
  const out: PaymentFieldErrors = {};

  for (const issue of issues) {
    const key = issue.path?.[0] as keyof PaymentFieldErrors | undefined;
    if (!key) continue;
    if (!out[key]) out[key] = issue.message;
  }

  return out;
};

export const validateCreatePayment = (data: unknown) => {
  const result = createPaymentSchema.safeParse(data);

  if (result.success) {
    return { ok: true, errors: {} };
  }

  return {
    ok: false,
    errors: mapZodErrors(result.error.issues),
  };
};

export const validateUpdatePayment = (data: unknown) => {
  const result = updatePaymentSchema.safeParse(data);

  if (result.success) {
    return { ok: true, errors: {} };
  }

  return {
    ok: false,
    errors: mapZodErrors(result.error.issues),
  };
};
