import Image from "next/image";
import React from "react";

type Props = {
  id: string;
  src: string;
  alt: string;
  type: string;
  placeHolder: string;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
};

export const InputWithLogo = (props: Props) => {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg p-2 my-4 ${
        props.disabled ? "bg-[#F4F4F4]" : "bg-white"
      }`}
    >
      <Image src={props.src} alt={props.alt} />
      <input
        id={props.id}
        type={props.type}
        placeholder={props.placeHolder}
        className="grow focus:outline-none"
        minLength={props.minLength}
        maxLength={props.maxLength}
        disabled={props.disabled}
        required
      />
    </div>
  );
};
