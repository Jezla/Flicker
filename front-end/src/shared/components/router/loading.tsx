import Image from "next/image";
import React from "react";
import logo from "../../../../public/logo.svg";

type Props = {};

const loading = (props: Props) => {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="border-4 border-transparent border-dashed rounded-full p-8 h-32 w-32 flex items-center justify-center animate-bounce">
        <Image src={logo} alt="logo" className="w-full animate-spin" priority />
      </div>
    </div>
  );
};

export default loading;
