import React from "react";

type Props = {};

const Loader = (props: Props) => {
  return (
    <div className="flex items-center justify-center space-x-2 h-full animate-pulse">
      <div
        className="w-3 h-8 bg-transparent rounded-full animate-bounce "
        style={{ animationDelay: "-0.32s" }}
      ></div>
      <div
        className="w-3 h-8 bg-transparent rounded-full animate-bounce "
        style={{ animationDelay: "-0.16s" }}
      ></div>
      <div className="w-3 h-8 bg-transparent rounded-full animate-bounce "></div>
    </div>
  );
};

export { Loader };
