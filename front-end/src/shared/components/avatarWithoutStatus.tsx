import Image from "next/image";
import React from "react";

type Props = { image: string | null; userName: string; className: string };

const AvatarWithoutStatus = ({ image, userName, className }: Props) => {
  if (!image) {
    const tempUserName = userName.replace(" ", "+");
    image = `https://ui-avatars.com/api/?name=${tempUserName}&size=200`;
  }
  return (
    <Image
      src={image}
      alt="avatar with status"
      width={200}
      height={200}
      priority
      className={className}
    />
  );
};

export { AvatarWithoutStatus };
