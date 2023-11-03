import Image from "next/image";
import React from "react";
import emptyImage from "../../../public/empty.svg";

type Props = { text: string };

const Empty = ({ text }: Props) => {
  return (
    <div className="flex flex-col justify-center items-center h-full p-2">
      <Image src={emptyImage} alt="empty" priority />
      {text}
    </div>
  );
};

export { Empty };
