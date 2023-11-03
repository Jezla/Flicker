import Image from "next/image";
import React from "react";

type Props = { image?: string | null; userName: string; active: boolean };

const avatarWithStatus = ({ image, userName, active }: Props) => {
  if (!image) {
    const tempUserName = userName.replace(" ", "+");
    image = `https://ui-avatars.com/api/?name=${tempUserName}&size=128`;
  }
  const status = active ? "after:bg-green-500" : "after:bg-gray-400";
  return (
    <div
      className={`relative after:absolute after:w-4 after:h-4 after:rounded-full ${status} after:border-2 after:border-white after:right-4 after:bottom-2`}
    >
      <Image
        src={image}
        alt="avatar with status"
        width={128}
        height={128}
        priority
        className="rounded-full border-2 border-white shadow-2xl h-32 w-32 object-cover"
      />
    </div>
  );
};

export default avatarWithStatus;
