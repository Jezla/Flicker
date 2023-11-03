import Image from "next/image";
import React, { MouseEventHandler } from "react";
import deleteFriend from "../../../public/delete-friend.svg";
import chat from "../../../public/chat.svg";
import { User } from "@/redux/slices/user";
import { useRouter } from "next/navigation";
import { Modal, Tooltip, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { unFriendAsyncAction } from "@/redux/slices/contact";
import { createPrivateChat } from "@/shared/APIs/conversationAPI";

type Props = {
  active: boolean;
  data: User;
  handleClick: MouseEventHandler<HTMLDivElement>;
  dispatch: AppDispatch;
};

const friendItem = ({ active, data, handleClick, dispatch }: Props) => {
  const router = useRouter();
  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();

  const confirm = () => {
    modal.confirm({
      title: "Confirm",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure to remove ${data.displayName}?`,
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        dispatch(unFriendAsyncAction({ messageApi, userId: data.id }));
      },
    });
  };

  const onClickChat = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    try {
      const response = await createPrivateChat(data.id);
      router.push(`/chat/${response.id}`);
    } catch (e: any) {
      messageApi.error(e.message);
    }
  };

  const onClickDeleteFriend = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    confirm();
  };

  const status = data.online ? "after:bg-green-500" : "after:bg-gray-400";

  return (
    <div
      role="button"
      onClick={handleClick}
      className={`flex items-center p-4 gap-4 ${active ? "bg-light-gray" : "bg-white"}`}
    >
      {modalContextHolder}
      {messageContextHolder}
      <div
        className={`relative after:content-[''] after:border-white after:border-2 after:absolute after:-bottom-1 after:right-0 after:w-4 after:h-4 after:rounded-full ${status}`}
      >
        <Image
          src={
            data.avatar
              ? data.avatar
              : `https://ui-avatars.com/api/?name=${data.displayName.replace(" ", "+")}&size=128`
          }
          alt="avatar"
          width={90}
          height={90}
          className="rounded-3xl h-[90px] w-[90px] object-cover"
          priority
        />
      </div>
      <h1 className={`flex-1 text-start text-2xl ${active ? "font-semibold" : "font-normal"}`}>
        {data.displayName}
      </h1>
      <div className="basis-1/3 flex justify-around">
        <Tooltip title="Message">
          <button
            onClick={onClickChat}
            className={`p-3 ${
              active ? "bg-light-mid" : "bg-light-gray"
            } rounded-xl duration-500 hover:bg-transparent active:scale-90`}
          >
            <Image src={chat} alt="to chat" />
          </button>
        </Tooltip>
        <Tooltip title="Remove friend">
          <button
            onClick={onClickDeleteFriend}
            className={`p-3 ${
              active ? "bg-light-mid" : "bg-light-gray"
            } rounded-xl duration-500 hover:bg-red-200 active:scale-90`}
          >
            <Image src={deleteFriend} alt="delete" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default connect()(friendItem);
