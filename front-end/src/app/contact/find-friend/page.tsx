"use client";
import { searchFriendsWithStatusAsyncAction, setState, toggle } from "@/redux/slices/contact";
import { AppDispatch, RootState } from "@/redux/store";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import magnifier from "../../../../public/magnifier-24-outline.svg";
import Image from "next/image";
import FlickerItem from "./flickerItem";
import { message } from "antd";
import { User } from "@/redux/slices/user";
import { Empty } from "@/shared/components/empty";

type Props = {
  searchUsers: User[];
  dispatch: AppDispatch;
};

const page = ({ searchUsers, dispatch }: Props) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(searchFriendsWithStatusAsyncAction({ messageApi, query }));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    dispatch(toggle({ frActive: false, fafActive: true }));

    return () => {
      dispatch(setState({ searchedUsers: [] }));
    };
  }, []);

  return (
    <div className="p-4 flex flex-col gap-4">
      {contextHolder}
      <div className="rounded-full flex items-center gap-4 px-4 py-2 bg-search-box">
        <Image src={magnifier} alt="search" priority className="h-6 w-6" />
        <input
          className="bg-search-box text-2xl flex-1 focus:outline-none"
          placeholder="Search Flicker"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-4">
        {searchUsers?.length > 0 ? (
          searchUsers.map((u) => <FlickerItem key={u.id} data={u} messageApi={messageApi} />)
        ) : (
          <Empty text="No Flicker found" />
        )}
      </div>
    </div>
  );
};

const mapState = ({ contact }: RootState) => ({
  searchUsers: contact.searchedUsers,
});

export default connect(mapState)(page);
