"use client";
import React, { useEffect, useState } from "react";
import logo from "../../../public/logo.svg";
import chat from "../../../public/group-2.svg";
import contact from "../../../public/contact.svg";
import gear from "../../../public/gear.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {};

const Navbar = (props: Props) => {
  const pathName = usePathname();
  const [active, setActive] = useState(1);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (pathName.startsWith("/chat")) setActive(1);
    else if (pathName.startsWith("/contact")) setActive(2);
    else if (pathName.startsWith("/setting")) setActive(3);
    else setActive(4);
    setShouldRender(true);
  }, [pathName]);

  return (
    shouldRender && (
      <div className="flex flex-col bg-light-gray w-20 p-4">
        <Image src={logo} alt="logo" className="w-full" priority />
        <div className="h-1 bg-main my-4" />
        <Link href="/chat" className="my-4">
          <button
            className={`${
              active === 1 ? "bg-transparent" : "hover:bg-gray-200"
            } flex justify-center items-center w-full h-12 rounded-xl duration-500`}
            disabled={active === 1}
            onClick={() => setActive(1)}
          >
            <Image src={chat} alt="chat" />
          </button>
        </Link>
        <Link href="/contact" className="my-4">
          <button
            className={`${
              active === 2 ? "bg-transparent" : "hover:bg-gray-200"
            } flex justify-center items-center w-full h-12 rounded-xl duration-500`}
            disabled={active === 2}
            onClick={() => setActive(2)}
          >
            <Image src={contact} alt="chat" />
          </button>
        </Link>
        <Link href="/setting" className="my-4">
          <button
            className={`${
              active === 3 ? "bg-transparent" : "hover:bg-gray-200"
            } flex justify-center items-center w-full h-12 rounded-xl duration-500`}
            disabled={active === 3}
            onClick={() => setActive(3)}
          >
            <Image src={gear} alt="chat" />
          </button>
        </Link>
      </div>
    )
  );
};

export default Navbar;
