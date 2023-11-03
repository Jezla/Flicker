import { AppDispatch, RootState } from "@/redux/store";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Navbar from "../navbar";
import Loading from "./loading";
import { getUserProfileAsyncAction } from "@/redux/slices/user";
import { setState } from "@/redux/slices/router";
import { getSystemLanguagesAsyncAction } from "@/redux/slices/language";
import { message } from "antd";

type Props = {
  children: React.ReactNode;
  status: string;
  dispatch: AppDispatch;
};

const ProtectedRouter = ({ children, status, dispatch }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [messageApi, contextHolder] = message.useMessage();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (!accessToken || !refreshToken) {
      dispatch(setState({ from: pathname }));
      router.push("/login");
    } else {
      dispatch(getUserProfileAsyncAction());
    }
  }, []);

  useEffect(() => {
    if (status === "F") router.push("/login");
    else if (status === "S") {
      setShouldRender(true);
      dispatch(getSystemLanguagesAsyncAction({ messageApi }));
    }
  }, [status]);

  return shouldRender ? (
    <div className="h-screen flex">
      {contextHolder}
      <Navbar />
      {children}
    </div>
  ) : (
    <Loading />
  );
};

const mapState = ({ user }: RootState) => ({
  status: user.getUserProfileStatus,
});

export default connect(mapState)(ProtectedRouter);
