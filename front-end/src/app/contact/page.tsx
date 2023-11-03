"use client";
import React, { useEffect } from "react";
import { Empty } from "@/shared/components/empty";
import { RootState } from "@/redux/store";
import { connect } from "react-redux";
import { useRouter } from "next/navigation";

type Props = {
  currentId: number | null;
};

const page = ({ currentId }: Props) => {
  const router = useRouter();

  useEffect(() => {
    if (currentId !== null) router.push(`/contact/${currentId}`);
  }, [currentId]);

  return <Empty text="No conversation shown" />;
};

const mapState = ({ contact }: RootState) => ({
  currentId: contact.currentId,
});

export default connect(mapState)(page);
