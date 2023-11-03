import React from "react";
import add from "../../../../public/add-chat-24-outline.svg";
import Image from "next/image";
import { User } from "@/redux/slices/user";
import { AppDispatch, RootState } from "@/redux/store";
import { connect } from "react-redux";
import { useRouter } from "next/navigation";
import { sendRequestAsyncAction, setState } from "@/redux/slices/contact";
import { MessageInstance } from "antd/es/message/interface";

type Props = {
  userId: number;
  data: User & {
    status?: "PENDING_R" | "PENDING_S" | "DECLINED" | "FRIEND" | "NOT_FRIEND";
  };
  messageApi: MessageInstance;
  dispatch: AppDispatch;
};

const flickerItem = ({ userId, data, messageApi, dispatch }: Props) => {
  const router = useRouter();

  const onClick = () => {
    router.push(`/profile/${data.id}`);
    dispatch(setState({ searchedUsers: [] }));
  };

  const onConnectClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    dispatch(sendRequestAsyncAction({ messageApi, receivedId: data.id }));
  };

  const onCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
  };

  const onApprove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
  };

  const HandleStatus = () => {
    if (data.status === "NOT_FRIEND" || data.status === "DECLINED") {
      return (
        <button
          onClick={onConnectClick}
          className="flex items-center text-main bg-light py-2 px-4 gap-4 text-xl rounded-xl shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] duration-300 hover:bg-transparent active:scale-90"
        >
          <Image src={add} alt="add" />
          Connect
        </button>
      );
    }
    if (data.status === "FRIEND") {
      return (
        <button
          disabled
          className="flex items-center text-main bg-light py-2 px-4 gap-4 text-xl rounded-xl shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] duration-300 hover:bg-transparent active:scale-90"
        >
          <svg
            width="16"
            height="12"
            viewBox="0 0 16 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.7099 1.20986C14.617 1.11613 14.5064 1.04174 14.3845 0.990969C14.2627 0.940201 14.132 0.914062 13.9999 0.914062C13.8679 0.914062 13.7372 0.940201 13.6154 0.990969C13.4935 1.04174 13.3829 1.11613 13.29 1.20986L5.83995 8.66986L2.70995 5.52986C2.61343 5.43662 2.49949 5.36331 2.37463 5.3141C2.24978 5.2649 2.11645 5.24077 1.98227 5.24309C1.84809 5.24541 1.71568 5.27414 1.5926 5.32763C1.46953 5.38113 1.35819 5.45834 1.26495 5.55486C1.17171 5.65138 1.0984 5.76532 1.04919 5.89018C0.999989 6.01503 0.975859 6.14836 0.97818 6.28254C0.980502 6.41672 1.00923 6.54913 1.06272 6.67221C1.11622 6.79529 1.19343 6.90662 1.28995 6.99986L5.12995 10.8399C5.22291 10.9336 5.33351 11.008 5.45537 11.0588C5.57723 11.1095 5.70794 11.1357 5.83995 11.1357C5.97196 11.1357 6.10267 11.1095 6.22453 11.0588C6.34639 11.008 6.45699 10.9336 6.54995 10.8399L14.7099 2.67986C14.8115 2.58622 14.8925 2.47257 14.9479 2.34607C15.0033 2.21957 15.0319 2.08296 15.0319 1.94486C15.0319 1.80676 15.0033 1.67015 14.9479 1.54365C14.8925 1.41715 14.8115 1.3035 14.7099 1.20986Z"
              fill="black"
            />
          </svg>
          Friend
        </button>
      );
    }
    if (data.status === "PENDING_S") {
      return (
        <button
          disabled
          className="flex items-center text-main bg-transparent py-2 px-4 gap-4 text-xl rounded-xl"
        >
          <svg
            width="16"
            height="20"
            viewBox="0 0 16 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 10C0 10.2652 0.105357 10.5196 0.292893 10.7071C0.48043 10.8946 0.734784 11 1 11H8.59L6.29 13.29C6.19627 13.383 6.12188 13.4936 6.07111 13.6154C6.02034 13.7373 5.9942 13.868 5.9942 14C5.9942 14.132 6.02034 14.2627 6.07111 14.3846C6.12188 14.5064 6.19627 14.617 6.29 14.71C6.38296 14.8037 6.49356 14.8781 6.61542 14.9289C6.73728 14.9797 6.86799 15.0058 7 15.0058C7.13201 15.0058 7.26272 14.9797 7.38458 14.9289C7.50644 14.8781 7.61704 14.8037 7.71 14.71L11.71 10.71C11.801 10.6149 11.8724 10.5028 11.92 10.38C12.02 10.1365 12.02 9.86346 11.92 9.62C11.8724 9.49725 11.801 9.3851 11.71 9.29L7.71 5.29C7.61676 5.19676 7.50607 5.1228 7.38425 5.07234C7.26243 5.02188 7.13186 4.99591 7 4.99591C6.86814 4.99591 6.73757 5.02188 6.61575 5.07234C6.49393 5.1228 6.38324 5.19676 6.29 5.29C6.19676 5.38324 6.1228 5.49393 6.07234 5.61575C6.02188 5.73757 5.99591 5.86814 5.99591 6C5.99591 6.13186 6.02188 6.26243 6.07234 6.38425C6.1228 6.50607 6.19676 6.61676 6.29 6.71L8.59 9H1C0.734784 9 0.48043 9.10536 0.292893 9.29289C0.105357 9.48043 0 9.73478 0 10ZM13 0H3C2.20435 0 1.44129 0.316071 0.87868 0.87868C0.316071 1.44129 0 2.20435 0 3V6C0 6.26522 0.105357 6.51957 0.292893 6.70711C0.48043 6.89464 0.734784 7 1 7C1.26522 7 1.51957 6.89464 1.70711 6.70711C1.89464 6.51957 2 6.26522 2 6V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H13C13.2652 2 13.5196 2.10536 13.7071 2.29289C13.8946 2.48043 14 2.73478 14 3V17C14 17.2652 13.8946 17.5196 13.7071 17.7071C13.5196 17.8946 13.2652 18 13 18H3C2.73478 18 2.48043 17.8946 2.29289 17.7071C2.10536 17.5196 2 17.2652 2 17V14C2 13.7348 1.89464 13.4804 1.70711 13.2929C1.51957 13.1054 1.26522 13 1 13C0.734784 13 0.48043 13.1054 0.292893 13.2929C0.105357 13.4804 0 13.7348 0 14V17C0 17.7956 0.316071 18.5587 0.87868 19.1213C1.44129 19.6839 2.20435 20 3 20H13C13.7956 20 14.5587 19.6839 15.1213 19.1213C15.6839 18.5587 16 17.7956 16 17V3C16 2.20435 15.6839 1.44129 15.1213 0.87868C14.5587 0.316071 13.7956 0 13 0Z"
              fill="black"
            />
          </svg>
          Request sent
        </button>
      );
    }
    if (data.status === "PENDING_R") {
      return (
        <button
          disabled
          className="flex items-center text-main bg-light py-2 px-4 gap-4 text-xl rounded-xl"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 12C20 11.7348 19.8946 11.4804 19.7071 11.2929C19.5196 11.1054 19.2652 11 19 11H11.41L13.71 8.71C13.8032 8.61676 13.8772 8.50607 13.9277 8.38425C13.9781 8.26243 14.0041 8.13186 14.0041 8C14.0041 7.86814 13.9781 7.73757 13.9277 7.61575C13.8772 7.49393 13.8032 7.38324 13.71 7.29C13.6168 7.19676 13.5061 7.1228 13.3842 7.07234C13.2624 7.02188 13.1319 6.99591 13 6.99591C12.8681 6.99591 12.7376 7.02188 12.6158 7.07234C12.4939 7.1228 12.3832 7.19676 12.29 7.29L8.29 11.29C8.19896 11.3851 8.12759 11.4972 8.08 11.62C7.97998 11.8635 7.97998 12.1365 8.08 12.38C8.12759 12.5028 8.19896 12.6149 8.29 12.71L12.29 16.71C12.383 16.8037 12.4936 16.8781 12.6154 16.9289C12.7373 16.9797 12.868 17.0058 13 17.0058C13.132 17.0058 13.2627 16.9797 13.3846 16.9289C13.5064 16.8781 13.617 16.8037 13.71 16.71C13.8037 16.617 13.8781 16.5064 13.9289 16.3846C13.9797 16.2627 14.0058 16.132 14.0058 16C14.0058 15.868 13.9797 15.7373 13.9289 15.6154C13.8781 15.4936 13.8037 15.383 13.71 15.29L11.41 13H19C19.2652 13 19.5196 12.8946 19.7071 12.7071C19.8946 12.5196 20 12.2652 20 12ZM17 2H7C6.20435 2 5.44129 2.31607 4.87868 2.87868C4.31607 3.44129 4 4.20435 4 5V19C4 19.7956 4.31607 20.5587 4.87868 21.1213C5.44129 21.6839 6.20435 22 7 22H17C17.7956 22 18.5587 21.6839 19.1213 21.1213C19.6839 20.5587 20 19.7956 20 19V16C20 15.7348 19.8946 15.4804 19.7071 15.2929C19.5196 15.1054 19.2652 15 19 15C18.7348 15 18.4804 15.1054 18.2929 15.2929C18.1054 15.4804 18 15.7348 18 16V19C18 19.2652 17.8946 19.5196 17.7071 19.7071C17.5196 19.8946 17.2652 20 17 20H7C6.73478 20 6.48043 19.8946 6.29289 19.7071C6.10536 19.5196 6 19.2652 6 19V5C6 4.73478 6.10536 4.48043 6.29289 4.29289C6.48043 4.10536 6.73478 4 7 4H17C17.2652 4 17.5196 4.10536 17.7071 4.29289C17.8946 4.48043 18 4.73478 18 5V8C18 8.26522 18.1054 8.51957 18.2929 8.70711C18.4804 8.89464 18.7348 9 19 9C19.2652 9 19.5196 8.89464 19.7071 8.70711C19.8946 8.51957 20 8.26522 20 8V5C20 4.20435 19.6839 3.44129 19.1213 2.87868C18.5587 2.31607 17.7956 2 17 2Z"
              fill="black"
            />
          </svg>
          Request received
        </button>
      );
    } else return <></>;
  };

  return (
    <div
      role="button"
      onClick={onClick}
      className="flex justify-between items-center bg-white shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] p-2 pr-4 rounded-2xl duration-300 hover:bg-search-box"
    >
      <div className="flex gap-4 items-center">
        <Image
          src={
            data.avatar
              ? data.avatar
              : `https://ui-avatars.com/api/?name=${data.displayName.replace(" ", "+")}&size=128`
          }
          alt="avatar"
          width={80}
          height={80}
          className="rounded-xl w-[80px] h-[80px] object-cover"
        />
        <h1 className="font-normal text-2xl">{data.displayName}</h1>
        <p className="font-bold text-2xl text-main">{data.id === userId ? "(You)" : ""}</p>
      </div>
      <HandleStatus />
    </div>
  );
};

const mapState = ({ user }: RootState) => ({
  userId: user.id,
});

export default connect(mapState)(flickerItem);
