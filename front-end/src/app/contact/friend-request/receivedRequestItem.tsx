import Image from "next/image";
import React from "react";
import cancel from "../../../../public/cancel.svg";
import approve from "../../../../public/approve.svg";
import { User } from "@/redux/slices/user";
import { AppDispatch } from "@/redux/store";
import { MessageInstance } from "antd/es/message/interface";
import { connect } from "react-redux";
import {
  acceptReceivedRequestAsyncAction,
  declineReceivedRequestAsyncAction,
} from "@/redux/slices/contact";

type Props = {
  data: User;
  messageApi: MessageInstance;
  dispatch: AppDispatch;
};

const receivedRequestItem = ({ data, messageApi, dispatch }: Props) => {
  const onClickApprove = () => {
    dispatch(acceptReceivedRequestAsyncAction({ messageApi, userId: data.id }));
  };

  const onClickDecline = () => {
    dispatch(declineReceivedRequestAsyncAction({ messageApi, userId: data.id }));
  };

  return (
    <div className="rounded-full bg-white p-4 flex justify-between shadow-[0_4px_10px_0_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-4">
        <Image
          src={
            data.avatar
              ? data.avatar
              : `https://ui-avatars.com/api/?name=${data.displayName.replace(" ", "+")}&size=128`
          }
          alt="avatar"
          width={70}
          height={70}
          className="rounded-full w-[70px] h-[70px] object-cover"
        />
        <h1 className="font-normal text-2xl">{data.displayName}</h1>
      </div>
      <div className="flex items-center gap-4 mr-4">
        {/* <h1 className="font-normal text-2xl text-text">{time.toUTCString()}</h1> */}
        <button
          onClick={onClickApprove}
          className="bg-green-400 rounded-full p-4 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] duration-300 hover:bg-green-500 active:scale-90"
        >
          <Image src={approve} alt="approve" />
        </button>
        <button
          onClick={onClickDecline}
          className="bg-red-400 rounded-full p-4 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] duration-300 hover:bg-red-500 active:scale-90"
        >
          <Image src={cancel} alt="cancel" />
        </button>
      </div>
    </div>
  );
};

export default connect()(receivedRequestItem);
