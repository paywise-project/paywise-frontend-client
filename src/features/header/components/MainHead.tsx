"use client";

import Image from "next/image";
import Link from "next/link";
import { HiOutlineBell } from "react-icons/hi2";

const MainHead = () => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-1">
        <Image
          src={"/pw-logo.avif"}
          alt="Pay wise logo"
          width={30}
          height={30}
          className="rounded-full"
        />
      </div>
      <Link href="/notification">
        <span className="pw-icon-btn pw-press">
          <HiOutlineBell className="text-2xl text-primary" />
        </span>
      </Link>
    </div>
  );
};

export default MainHead;
