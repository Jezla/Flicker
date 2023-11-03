"use client";
import { select } from "@/redux/slices/contact";
import { AppDispatch, RootState } from "@/redux/store";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import Avatar from "@/shared/components/avatarWithStatus";
import { User } from "@/redux/slices/user";
import { Empty } from "@/shared/components/empty";

type Props = {
  params: { id: string };
  friends: User[];
  dispatch: AppDispatch;
};

const page = ({ params, friends, dispatch }: Props) => {
  useEffect(() => {
    dispatch(select({ currentId: Number(params.id) }));
  }, [params.id]);

  const data = friends.find((f) => f.id.toString() === params.id);

  if (data) {
    return (
      <div className="flex flex-col p-10 gap-10">
        <div className="flex gap-6 justify-center items-center py-4">
          <Avatar image={data.avatar} userName={data.displayName} active={data.online} />
          <h1 className="font-normal text-3xl">{data.displayName}</h1>
        </div>
        <div className="flex">
          <div className="basis-1/5"></div>
          <h1 className="font-normal text-2xl text-text basis-1/5">Name</h1>
          <p className="font-semibold text-2xl text-main basis-3/5">{data.displayName}</p>
        </div>
        <div className="flex">
          <div className="basis-1/5"></div>
          <h1 className="font-normal text-2xl text-text basis-1/5">Email</h1>
          <p className="font-semibold text-2xl text-main basis-3/5">{data.email}</p>
        </div>
        <div className="flex">
          <div className="basis-1/5"></div>
          <h1 className="font-normal text-2xl text-text basis-1/5">Phone</h1>
          <p className="font-semibold text-2xl text-main basis-3/5">{data.phoneNumber}</p>
        </div>
        <div className="flex">
          <div className="basis-1/5"></div>
          <h1 className="font-normal text-2xl text-text basis-1/5">About</h1>
          {data.about ? (
            <p className="font-semibold text-2xl text-main basis-3/5">{data.about}</p>
          ) : (
            <p className="italic text-2xl text-main basis-3/5">No description</p>
          )}
        </div>
      </div>
    );
  } else {
    return <Empty text="Flicker does not exist in your friend list" />;
  }
};

const mapState = ({ contact }: RootState) => ({
  friends: contact.friends,
});

export default connect(mapState)(page);
