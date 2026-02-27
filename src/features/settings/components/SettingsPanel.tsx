"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/features/shared/redux/hooks";
import {
  apiRouterTypeUserGetUserOptions,
  apiRouterTypeUserGetUserQueryKey,
  apiRouterTypeUserUpdateUserMutation,
} from "@/lib/api/@tanstack/react-query.gen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { togglePanel } from "@/features/panel/slice/panelSlice";
import { useRouter } from "next/navigation";

type GenderType = "MALE" | "FEMALE";

type FormState = {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  gender_type: GenderType | null;
};

const genderMap: { title: string; key: GenderType }[] = [
  {
    title: "مرد",
    key: "MALE",
  },
  {
    title: "زن",
    key: "FEMALE",
  },
];

const SettingsPanel = () => {
  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    gender_type: null,
  });

  const router = useRouter();

  const dispatch = useAppDispatch();
  const { customerUuid } = useAppSelector((s) => s.auth);
  const { data, isLoading, error } = useQuery({
    ...apiRouterTypeUserGetUserOptions({
      path: { user_uuid: customerUuid ?? "" },
    }),
  });

  useEffect(() => {
    if (!data) return;

    setForm({
      first_name: data.first_name ?? "",
      last_name: data.last_name ?? "",
      phone_number: data.phone_number ?? "",
      email: data.email ?? "",
      gender_type: data.gender_type ?? null,
    });
  }, [data]);

  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    ...apiRouterTypeUserUpdateUserMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: apiRouterTypeUserGetUserQueryKey({
          path: { user_uuid: customerUuid ?? "" },
        }),
      });
      dispatch(togglePanel());
      router.replace("/");
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const onSave = () => {
    if (!customerUuid) return;

    updateUserMutation.mutate({
      path: { user_uuid: customerUuid },
      body: {
        first_name: form.first_name,
        last_name: form.last_name,
        phone_number: form.phone_number,
        email: form.email,
        gender_type: form.gender_type,
      },
    });
  };

  return (
    <div className="h-full">
      <div className="pw-sheet-head pw-title">ویرایش پروفایل</div>
      <div className="pw-sheet-body | flex flex-col items-center justify-between w-full">
        <div className="w-full space-y-3">
          <p className="text-text font-semibold mb-1">نام</p>
          <input
            type="text"
            value={form.first_name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, first_name: e.target.value }))
            }
            className="w-full border border-primary-2 p-2 rounded-lg"
          />
          <p className="text-text font-semibold mb-1">نام خانوادگی</p>
          <input
            type="text"
            value={form.last_name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, last_name: e.target.value }))
            }
            className="w-full border border-primary-2 p-2 rounded-lg"
          />
          <p className="text-text font-semibold mb-1">شماره موبایل</p>
          <input
            type="number"
            value={form.phone_number}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone_number: e.target.value }))
            }
            className="w-full border border-primary-2 p-2 rounded-lg"
          />
          <p className="text-text font-semibold mb-1">نام کاربری تلگرام</p>
          <input
            type="text"
            placeholder=""
            value={`@${data?.telegram_username ?? ""}`}
            className="w-full border border-primary-2 p-2 rounded-lg disabled:bg-muted-2/40 text-muted disabled:border-muted"
            dir="ltr"
            disabled
          />
          <p className="text-text font-semibold mb-1">ایمیل</p>
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full border border-primary-2 p-2 rounded-lg"
          />
          <p className="text-text font-semibold mb-1">جنسیت</p>
          <div className="flex gap-2">
            {genderMap.map((g) => {
              const isActive = form.gender_type === g.key;

              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, gender_type: g.key }))
                  }
                  className={`w-full py-2 rounded-lg transition ${isActive ? "bg-primary-2/20 border border-primary-2 text-primary" : "bg-muted-2/20 text-text"}`}
                >
                  {g.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="pw-sheet-actions | flex items-center justify-between w-full gap-3">
        <button
          type="button"
          className="pw-press | w-full bg-muted-2/20 text-muted py-4 rounded-lg"
          onClick={() => dispatch(togglePanel())}
        >
          لغو
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={updateUserMutation.isPending}
          className="pw-press | w-full bg-primary text-surface py-3 rounded-lg disabled:opacity-60"
        >
          {updateUserMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
        </button>{" "}
      </div>
    </div>
  );
};

export default SettingsPanel;
