"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

type Props = {};

const page = (props: Props) => {
  useEffect(() => {
    redirect("/chat");
  }, []);
};

export default page;
