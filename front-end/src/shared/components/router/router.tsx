"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import NonProtectedRouter from "./nonProtectedRouter";
import ProtectedRouter from "./protectedRouter";
import { AppDispatch, RootState } from "@/redux/store";
import { connect } from "react-redux";
import { resetState } from "@/redux/slices/notification";
import { Message } from "@/redux/slices/chat";

type Props = {
  messages: (Message & { conversation: { name: string; isGroup: boolean } })[];
  children: React.ReactNode;
  dispatch: AppDispatch;
};

const Router = ({ messages, children, dispatch }: Props) => {
  const pathname = usePathname();
  const [type, setType] = useState<"f" | "np" | "p">(
    pathname === "/landing"
      ? "f"
      : pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgotpassword" ||
        pathname === "/resetpassword"
      ? "np"
      : "p"
  );
  const [title, setTitle] = useState<string | undefined>();

  useEffect(() => {
    if (pathname) {
      if (pathname === "/login") setTitle("Flicker - Login");
      if (pathname === "/signup") setTitle("Flicker - Sign Up");
      if (pathname === "/resetpassword") setTitle("Flicker - Reset Password");
      if (pathname === "/forgotpassword") setTitle("Flicker - Forgot Password");
      if (pathname.startsWith("/chat")) setTitle("Flicker - Chat");
      if (pathname.startsWith("/contact")) setTitle("Flicker - Contact");
      if (pathname === "/setting") setTitle("Flicker - Setting");
      if (pathname === "/profile") setTitle("Flicker - Profile");
    }

    let newValue: "f" | "np" | "p" = "f";
    if (pathname === "/landing") newValue = "f";
    else if (
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/forgotpassword" ||
      pathname === "/resetpassword"
    )
      newValue = "np";
    else newValue = "p";
    if (newValue !== type) setType(newValue);
  }, [pathname]);

  useEffect(() => {
    document.title = title ? title : "Flicker";
  }, [title]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    window.onfocus = () => {
      dispatch(resetState());
      clearInterval(interval);
      document.title = title ? title : "Flicker";
    };

    if (!document.hasFocus()) {
      let tick = false;
      if (messages.length > 0) {
        interval = setInterval(() => {
          document.title = tick
            ? messages[0].messageType !== "MESSAGE_TYPE_SYSTEM_TEXT"
              ? messages[0].conversation.isGroup
                ? `(${messages.length}) ${messages[0].sender.displayName} sent a message in ${messages[0].conversation.name}`
                : `(${messages.length}) ${messages[0].sender.displayName} sent you a message`
              : `(${messages.length}) ${messages[0].content}`
            : title
            ? title
            : "Flicker";
          tick = !tick;
        }, 1000);
      }
    }

    return () => {
      window.onfocus = null;
      clearInterval(interval);
    };
  }, [messages, title]);

  return type === "f" ? (
    children
  ) : type === "np" ? (
    <NonProtectedRouter>{children}</NonProtectedRouter>
  ) : (
    <ProtectedRouter>{children}</ProtectedRouter>
  );
};

const mapState = ({ notification }: RootState) => ({
  messages: notification.messages,
});

export default connect(mapState)(Router);
