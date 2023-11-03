import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

const nonProtectedRouter = ({ children }: Props) => {
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (accessToken && refreshToken) router.push("/");
    else setShouldRender(true);
  }, []);

  return shouldRender && children;
};

export default nonProtectedRouter;
