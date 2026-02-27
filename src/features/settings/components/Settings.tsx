"use client";

import { setPanelState, togglePanel } from "@/features/panel/slice/panelSlice";
import { useAppDispatch } from "@/features/shared/redux/hooks";
import {
  HiOutlineBell,
  HiOutlineChatBubbleOvalLeftEllipsis,
  HiOutlineUser,
} from "react-icons/hi2";

import packageJson from "../../../../package.json";

const version = packageJson.version;

const Settings = () => {
  const dispatch = useAppDispatch();
  const panelToggle = () => {
    dispatch(togglePanel());
    dispatch(setPanelState("settings"));
  };

  return (
    <div className="mt-5">
      <div className="pw-card pw-press">
        <div
          className="flex items-center justify-between gap-2"
          onClick={panelToggle}
        >
          <span className="pw-icon-btn | h-11 w-11 text-xl">
            <HiOutlineUser className="text-primary text-3xl" />
          </span>
          <span className="flex flex-col gap-1 w-full text-start">
            <h2 className="pw-title | text-base">پروفایل</h2>
            <p className="text-muted text-sm">مشاهده و ویرایش اطلاعات شخصی</p>
          </span>
          <span className="text-muted-2">←</span>
        </div>
        <div className="my-5 w-full h-px bg-soft" />
        <div className="flex items-center justify-between gap-2 opacity-40">
          <span className="pw-icon-btn | h-11 w-11 text-xl">
            <HiOutlineBell className="text-primary text-3xl" />
          </span>
          <span className="flex flex-col gap-1 w-full text-start">
            <h2 className="pw-title | text-base">اعلان‌ها</h2>
            <p className="text-muted text-sm">تنظیمات کانال‌های اعلان</p>
          </span>
          <span className="pw-badge | bg-warning-soft text-warning text-xs py-1 px-3">
            بزودی
          </span>
        </div>
        <div className="my-5 w-full h-px bg-soft" />
        <div className="flex items-center justify-between gap-2">
          <span className="pw-icon-btn | h-11 w-11 text-xl">
            <HiOutlineChatBubbleOvalLeftEllipsis className="text-primary text-3xl" />
          </span>
          <span className="flex flex-col gap-1 w-full text-start">
            <h2 className="pw-title | text-base">پشتیبانی</h2>
            <p className="text-muted text-sm">ارتباط با تیم پشتیبانی</p>
          </span>
          <span className="text-muted-2">←</span>
        </div>
      </div>
      <p className="text-muted-2 text-xs mt-2 mr-2">version: {version}</p>
    </div>
  );
};

export default Settings;
