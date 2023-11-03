"use client";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import sidePic from "../../../public/images/rectangle-4.png";
import logo from "../../../public/logo.svg";
import account from "../../../public/account-24-outline.svg";
import padLock from "../../../public/padlock-24-outline.svg";
import phone from "../../../public/mobile-24-outline.svg";
import pencil from "../../../public/pencil-24-outline.svg";
import { InputWithLogo } from "@/shared/components/inputWithLogo";
import Link from "next/link";
import { Spinner } from "@/shared/components/spinner";
import { AppDispatch, RootState } from "@/redux/store";
import { connect } from "react-redux";
import { resetState, setState, signupAsyncAction } from "@/redux/slices/signup";
import { resetState as resetStateLogin } from "@/redux/slices/login";
import { useRouter } from "next/navigation";

interface Props {
  error: string;
  loading: boolean;
  complete: boolean;
  dispatch: AppDispatch;
}

const Page = ({ error, loading, complete, dispatch }: Props) => {
  const router = useRouter();
  const [timeOut, setTimeOut] = useState<NodeJS.Timeout>();

  useEffect(() => {
    if (error) cleanErrorMessage();
  }, [error]);

  useEffect(() => {
    if (complete) {
      dispatch(resetStateLogin());
      setTimeOut(
        setTimeout(() => {
          dispatch(resetState());
          router.push("/login?status=info");
        }, 2000)
      );
    }
  }, [complete]);

  const cleanErrorMessage = () => {
    clearTimeout(timeOut);
    setTimeOut(
      setTimeout(
        () => dispatch(setState({ error: "" })),
        Number(process.env.NEXT_PUBLIC_ERROR_MESSAGE_DURATION)
      )
    );
  };

  const handleSignUp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      email: { value: string };
      username: { value: string };
      phoneNumber: { value: string };
      password: { value: string };
      retypePassword: { value: string };
    };
    const email = target.email.value;
    const username = target.username.value;
    const phoneNumber = target.phoneNumber.value;
    const password = target.password.value;
    const retypePassword = target.retypePassword.value;
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
      dispatch(setState({ error: "Email is invalid" }));
      return;
    }
    if (username.includes(" ")) {
      dispatch(setState({ error: "Username must not contain space" }));
      return;
    }
    if (!phoneNumber.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/g)) {
      dispatch(setState({ error: "Phone number is invalid" }));
      return;
    }
    if (password !== retypePassword) {
      dispatch(setState({ error: "Retype password does not match" }));
      return;
    }
    dispatch(signupAsyncAction({ email, username, phoneNumber, password }));
  };

  return (
    <div className="h-screen flex justify-center items-center px-[10vw] py-[7vh]">
      <div className="bg-light-gray h-full flex-1 rounded-2xl flex">
        <Image src={sidePic} alt="side picture" className="h-full rounded-l-2xl flex-1" />
        <div className="flex flex-col justify-center items-center flex-1 gap-y-2">
          <Image src={logo} alt="logo" />
          <h1 className="text-5xl font-bold">Sign up</h1>
          <div className="h-1 w-24 bg-main"></div>
          <form className="w-2/3" onSubmit={handleSignUp}>
            <InputWithLogo id="email" src={account} alt="email" type="text" placeHolder="Email" />
            <InputWithLogo
              id="username"
              src={pencil}
              alt="user name"
              type="text"
              placeHolder="Username"
              minLength={3}
              maxLength={20}
            />
            <InputWithLogo
              id="phoneNumber"
              src={phone}
              alt="phone number"
              type="text"
              placeHolder="Phone Number"
              minLength={9}
              maxLength={13}
            />
            <InputWithLogo
              id="password"
              src={padLock}
              alt="password"
              type="password"
              placeHolder="Password"
              minLength={3}
              maxLength={20}
            />
            <InputWithLogo
              id="retypePassword"
              src={padLock}
              alt="retype password"
              type="password"
              placeHolder="Retype Password"
              minLength={3}
              maxLength={20}
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
                Account Created. Please check your email for verification.
              </div>
            ) : (
              <></>
            )}
            <div className="flex justify-center items-center my-10 h-12">
              <button
                type="submit"
                className="flex justify-center bg-main rounded-full w-96 h-full py-2 text-white font-bold text-2xl duration-500 hover:bg-transparent hover:text-main active:w-9/12 active:text-xl active:h-9/10"
              >
                {loading ? <Spinner /> : "Create"}
              </button>
            </div>
            <h1 className="text-center text-transparent italic font-bold text-lg">
              Already have account?{" "}
              <Link
                href="/login"
                className="relative text-main after:content-[''] after:absolute after:h-[3px] after:bg-main after:w-0 after:left-0 after:bottom-0 after:duration-300 hover:after:w-full"
              >
                Login
              </Link>
            </h1>
          </form>
        </div>
      </div>
    </div>
  );
};

const mapState = ({ signup }: RootState) => ({
  error: signup.error,
  loading: signup.loading,
  complete: signup.complete,
});

export default connect(mapState)(Page);
