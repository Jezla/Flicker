"use client";
import { message } from "antd";
import Image from "next/image";
import React, { FormEvent, useState } from "react";
import sidePic from "../../../public/images/rectangle-4.png";
import logo from "../../../public/logo.svg";
import { InputWithLogo } from "@/shared/components/inputWithLogo";
import { Spinner } from "@/shared/components/spinner";
import account from "../../../public/account-24-outline.svg";
import Link from "next/link";
import { sendResetLink } from "@/shared/APIs/loginAPI";

type Props = {};

const page = (props: Props) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const [timeOut, setTimeOut] = useState<NodeJS.Timeout>();

  const cleanErrorMessage = () => {
    clearTimeout(timeOut);
    setTimeOut(
      setTimeout(() => setError(""), Number(process.env.NEXT_PUBLIC_ERROR_MESSAGE_DURATION))
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      email: { value: string };
    };
    const email = target.email.value;
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
      setError("First field must be an email");
      cleanErrorMessage();
      return;
    }
    try {
      setLoading(true);
      await sendResetLink(email);
      setComplete(true);
    } catch (e: any) {
      messageApi.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center px-[10vw] py-[7vh]">
      {contextHolder}
      <div className="bg-light-gray h-full flex-1 rounded-2xl flex">
        <Image src={sidePic} alt="side picture" className="h-full rounded-l-2xl flex-1" />
        <div className="flex flex-col justify-center items-center flex-1 gap-2">
          <Image src={logo} alt="logo" />
          <h1 className="text-5xl font-bold ">Forgot password</h1>
          <div className="h-1 w-24 bg-main mb-10"></div>
          <form className="w-2/3" onSubmit={handleSubmit}>
            <InputWithLogo
              id="email"
              src={account}
              alt="email"
              type="text"
              placeHolder="Email"
              disabled={complete}
            />
            {error ? (
              <div className="rounded-md bg-red-200 text-red-500 text-xl text-center p-2">
                {error}
              </div>
            ) : (
              <></>
            )}
            {complete ? (
              <div className="rounded-md bg-green-200 text-green-500 text-xl text-center p-2">
                A reset link has been sent to your email. Please check your email for more instructions.
              </div>
            ) : (
              <div className="flex justify-center my-6 h-12 mt-10">
                <button
                  disabled={loading}
                  type="submit"
                  className="flex justify-center bg-main rounded-full w-96 py-2 text-white font-bold text-2xl duration-500 hover:bg-transparent hover:text-main active:w-9/12 active:text-xl active:h-9/10 disabled:bg-transparent"
                >
                  {loading ? <Spinner /> : "Submit"}
                </button>
              </div>
            )}
          </form>
          <h1 className="text-center text-transparent italic font-bold text-lg">
            Go to{" "}
            <Link
              href="/login"
              className="relative text-main after:content-[''] after:absolute after:h-[3px] after:bg-main after:w-0 after:left-0 after:bottom-0 after:duration-300 hover:after:w-full"
            >
              Login
            </Link>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default page;
