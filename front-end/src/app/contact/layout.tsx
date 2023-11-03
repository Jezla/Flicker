"use client";
import React, { useEffect, useState } from "react";
import magnifier from "../../../public/magnifier-24-outline.svg";
import storeImage from "../../../public/store.svg";
import addFriend from "../../../public/add-friend.svg";
import TopButton from "./button";
import Image from "next/image";
import FriendItem from "./friendItem";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/redux/store";
import { connect } from "react-redux";
import {
  getFriendsAsyncAction,
  getNumberOfReceivedRequestsAsyncAction,
  resetState,
  searchFriendsAsyncAction,
  toggle,
} from "@/redux/slices/contact";
import { message } from "antd";
import { User } from "@/redux/slices/user";
import { Empty } from "@/shared/components/empty";
import { Loader } from "@/shared/components/loader";
import GroupImage from "../../../public/group.svg";
import CreateGroupModal from "./createGroupModal";

type Props = {
  children: React.ReactNode;
  friends: User[];
  loading: boolean;
  numberOfReceivedRequests: number;
  currentId: number | null;
  frActive: boolean;
  fafActive: boolean;
  dispatch: AppDispatch;
};

const layout = ({
  children,
  friends,
  loading,
  numberOfReceivedRequests,
  currentId,
  frActive,
  fafActive,
  dispatch,
}: Props) => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchTerm, setSearchTerm] = useState("");
  const [openGroup, setOpenGroup] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm === "") dispatch(getFriendsAsyncAction({ messageApi }));
      else dispatch(searchFriendsAsyncAction({ messageApi, searchTerm }));
    }, 0);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(getNumberOfReceivedRequestsAsyncAction({ messageApi }));

    return () => {
      dispatch(resetState());
    };
  }, []);

  const handleClickFriendRequest = () => {
    dispatch(toggle({ frActive: true, fafActive: false }));
    router.push("/contact/friend-request");
  };

  const handleClickFindAFriend = () => {
    dispatch(toggle({ frActive: false, fafActive: true }));
    router.push("/contact/find-friend");
  };

  const handleClickFriendItem = (id: number) => {
    dispatch(toggle({ frActive: false, fafActive: false }));
    router.push(`/contact/${id}`);
  };

  return (
    <div className="flex-1 flex flex-col">
      {contextHolder}
      <CreateGroupModal
        open={openGroup}
        onCancel={() => setOpenGroup(false)}
        messageApi={messageApi}
      />
      <div className="flex">
        <div className="flex flex-col basis-1/3 p-4 pb-8">
          <h1 className="font-normal text-2xl mb-2">Search for a contact</h1>
          <div className="flex gap-2 p-2 shadow-[4px_4px_20px_0_rgba(0,0,0,0.25)] rounded-xl self-stretch">
            <Image src={magnifier} alt="magnifier" priority />
            <input
              className="flex-1 focus:outline-none"
              placeholder="Name, email, or phone number"
              onChange={(e) => setSearchTerm(e.target.value)}
            ></input>
          </div>
        </div>
        <div className="flex flex-1 justify-around items-center">
          <TopButton image={GroupImage} isActive={false} handleClick={() => setOpenGroup(true)}>
            Create group
          </TopButton>
          <TopButton
            image={storeImage}
            badge={numberOfReceivedRequests}
            isActive={frActive}
            handleClick={handleClickFriendRequest}
          >
            Friend request
          </TopButton>
          <TopButton image={addFriend} isActive={fafActive} handleClick={handleClickFindAFriend}>
            Find a friend
          </TopButton>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex flex-col basis-1/3 overflow-auto">
          {loading ? (
            <Loader />
          ) : friends.length > 0 ? (
            friends.map((f) => (
              <FriendItem
                key={f.id}
                active={currentId === f.id}
                handleClick={() => handleClickFriendItem(f.id)}
                data={f}
              />
            ))
          ) : (
            <Empty text="You have no friends" />
          )}
        </div>
        <div className="bg-light-gray flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

const mapState = ({ contact }: RootState) => ({
  friends: contact.friends,
  loading: contact.loadingFriend,
  numberOfReceivedRequests: contact.numberOfReceivedRequests,
  currentId: contact.currentId,
  frActive: contact.frActive,
  fafActive: contact.fafActive,
});

export default connect(mapState)(layout);
