"use client";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import sidePic from "../../../public/images/rectangle-4.png";
import logo from "../../../public/logo.svg";
import account from "../../../public/account-24-outline.svg";
import padLock from "../../../public/padlock-24-outline.svg";
import { InputWithLogo } from "@/shared/components/inputWithLogo";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/shared/components/spinner";
import { AppDispatch, RootState } from "@/redux/store";
import { connect } from "react-redux";
import { loginAsyncAction, setState } from "@/redux/slices/login";
import { setState as setStateRouter } from "@/redux/slices/router";
import { message } from "antd";
import Link from "next/link";

interface Props {
  accessToken: string;
  error: string;
  loading: boolean;
  from: string | null;
  dispatch: AppDispatch;
}

const Page = ({ accessToken, error, loading, from, dispatch }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [timeOut, setTimeOut] = useState<NodeJS.Timeout>();

  useEffect(() => {
    if (error) cleanErrorMessage();
  }, [error]);

  useEffect(() => {
    if (accessToken) {
      if (from !== null) {
        router.push(from);
        dispatch(setStateRouter({ from: null }));
      } else router.push("/");
    }
  }, [accessToken]);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "successful") messageApi.success("Confirm email successfully");
    else if (status === "info") messageApi.info("Check email for your account confirmation");
  }, [searchParams]);

  const onCreateAccountClick = () => router.push("/signup");

  const cleanErrorMessage = () => {
    clearTimeout(timeOut);
    setTimeOut(
      setTimeout(
        () => dispatch(setState({ error: "" })),
        Number(process.env.NEXT_PUBLIC_ERROR_MESSAGE_DURATION)
      )
    );
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
    const email = target.email.value;
    const password = target.password.value;
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
      dispatch(setState({ error: "First field must be an email" }));
      return;
    }
    dispatch(loginAsyncAction({ email, password }));
  };

  return (
    <div className="h-screen flex justify-center items-center px-[10vw] py-[7vh]">
      {contextHolder}
      <div className="bg-light-gray h-full flex-1 rounded-2xl flex">
        <Image src={sidePic} alt="side picture" className="h-full rounded-l-2xl flex-1" />
        <div className="flex flex-col justify-center items-center flex-1 gap-y-2">
          <Image src={logo} alt="logo" />
          <h1 className="text-5xl font-bold">Login</h1>
          <div className="h-1 w-24 bg-main"></div>
          <form className="w-2/3" onSubmit={handleLogin}>
            <InputWithLogo id="email" src={account} alt="email" type="text" placeHolder="Email" />
            <InputWithLogo
              id="password"
              src={padLock}
              alt="password"
              type="password"
              placeHolder="Password"
            />
            {error ? (
              <div className="rounded-md bg-red-200 text-red-500 text-xl text-center p-2">
                {error}
              </div>
            ) : (
              <></>
            )}
            <div className="text-right">
              <Link
                href="/forgotpassword"
                className="text-transparent italic font-bold text-lg relative after:content-[''] after:absolute after:h-[3px] after:bg-transparent after:w-0 after:left-0 after:bottom-0 after:duration-300 hover:after:w-full"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="flex justify-center my-6 h-12">
              <button
                disabled={loading}
                type="submit"
                className="flex justify-center bg-main rounded-full w-96 py-2 text-white font-bold text-2xl duration-500 hover:bg-transparent hover:text-main active:w-9/12 active:text-xl active:h-9/10 disabled:bg-transparent"
              >
                {loading ? <Spinner /> : "Login"}
              </button>
            </div>
            <div className="relative flex h-2 items-center">
              <h1 className="absolute bg-light-gray text-transparent font-bold right-1/2 translate-x-1/2 px-2">
                Don't have an account?
              </h1>
              <div className="h-0.5 w-full bg-main"></div>
            </div>
          </form>
          <div className="flex justify-center h-12 my-4 w-2/3">
            <button
              className="bg-white rounded-full w-96 py-2 text-main font-bold text-2xl duration-300 hover:bg-transparent hover:text-white active:w-9/12 active:text-xl active:h-9/10"
              onClick={onCreateAccountClick}
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapState = ({ login, router }: RootState) => ({
  accessToken: login.accessToken,
  error: login.error,
  loading: login.loading,
  from: router.from,
});

export default connect(mapState)(Page);
