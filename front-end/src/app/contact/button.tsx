import Image from "next/image";
import React, { MouseEventHandler, useEffect } from "react";

type Props = {
  children: React.ReactNode;
  image: string;
  badge?: number;
  isActive: boolean;
  handleClick: MouseEventHandler<HTMLButtonElement>;
};

const friendRequestButton = ({ children, image, badge, isActive, handleClick }: Props) => {
  const style =
    "relative flex items-center gap-2 rounded-xl bg-light px-4 py-2 shadow-[0_0.5rem_0_0_rgba(0,0,0,0.15)]";
  const hover = "hover:bg-transparent";
  const active =
    "active:bg-transparent active:translate-y-1 active:shadow-[0_0.25rem_0_0_rgba(0,0,0,0.3)]";
  const after = `after:duration-300 after:flex after:items-center after:justify-center after:content-[attr(after-dynamic-value)] after:absolute after:text-white after:font-semibold after:bg-main after:w-8 after:h-8 after:rounded-full after:-right-4 after:-bottom-4 after:duration-300`;
  const animate = "after:animate-bounce";
  const styleActive =
    "relative flex items-center gap-2 rounded-xl translate-y-1 bg-transparent px-4 py-2 shadow-[0_0.25rem_0_0_rgba(0,0,0,0.3)]";

  return (
    <button
      onClick={handleClick}
      disabled={isActive}
      after-dynamic-value={badge}
      className={
        isActive
          ? `${styleActive} ${badge !== undefined ? after : ""}`
          : `${style} ${hover} ${active} ${badge !== undefined ? after : ""} ${
              badge !== undefined && badge > 0 ? animate : ""
            }`
      }
    >
      <Image src={image} alt="store" />
      {children}
    </button>
  );
};

export default friendRequestButton;
