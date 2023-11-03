"use client";
import { useRouter } from "next/navigation";
import { Empty } from "@/shared/components/empty";
import React, { useEffect } from "react";
import { RootState } from "@/redux/store";
import { connect } from "react-redux";

type Props = {
  currentId: number | null;
};

const page = ({ currentId }: Props) => {
  const router = useRouter();

  useEffect(() => {
    if (currentId !== null) router.push(`/chat/${currentId}`);
  }, [currentId]);

  return <Empty text="No information shown" />;
};

const mapState = ({ chat }: RootState) => ({
  currentId: chat.currentId,
});

export default connect(mapState)(page);
