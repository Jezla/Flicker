import { Conversation } from "@/redux/slices/chat";
import { User } from "@/redux/slices/user";
import { Collapse, CollapseProps } from "antd";
import React, { useState } from "react";
import GroupMemberItem from "./groupMemberItem";
import { connect } from "react-redux";
import { RootState } from "@/redux/store";
import { MessageInstance } from "antd/es/message/interface";
import AddNewMembersModal from "./addNewMembersModal";

type Props = {
  user: User;
  data: Conversation;
  messageApi: MessageInstance;
  conversation: Conversation;
};

const groupMemberCollapse = ({ user, data, messageApi, conversation }: Props) => {
  const [openAddNewMembers, setOpenAddNewMembers] = useState(false);

  const sortedUsers = [...data.users];
  sortedUsers.sort((a, b) => a.displayName.localeCompare(b.displayName));
  const self = data.users.find((u) => u.id === user.id);

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: <div className="font-semibold">Group members</div>,
      children: (
        <div className="max-h-[30vh] overflow-auto flex flex-col">
          <AddNewMembersModal
            open={openAddNewMembers}
            onCancel={() => setOpenAddNewMembers(false)}
            messageApi={messageApi}
            conversation={conversation}
          />
          {(self?.role === "ROLE_ADMIN" || self?.role === "ROLE_SUB_ADMIN") && (
            <button
              onClick={() => setOpenAddNewMembers(true)}
              className="flex items-center gap-2 duration-500 hover:bg-gray-50 active:scale-90 p-2 rounded-lg"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full">
                <svg viewBox="0 0 36 36" fill="currentColor" height="24" width="24">
                  <path
                    clipRule="evenodd"
                    d="M18 9c-.69 0-1.25.56-1.25 1.25v6.25a.25.25 0 01-.25.25h-6.25a1.25 1.25 0 100 2.5h6.25a.25.25 0 01.25.25v6.25a1.25 1.25 0 102.5 0V19.5a.25.25 0 01.25-.25h6.25a1.25 1.25 0 100-2.5H19.5a.25.25 0 01-.25-.25v-6.25C19.25 9.56 18.69 9 18 9z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
              Add new members
            </button>
          )}
          {sortedUsers.map((u) => (
            <GroupMemberItem
              self={self}
              key={u.id}
              data={u}
              isSelf={u.id === user.id}
              messageApi={messageApi}
              conversation={conversation}
            />
          ))}
        </div>
      ),
    },
  ];
  return <Collapse defaultActiveKey={["1"]} ghost items={items} className="w-full" />;
};

export default connect(({ user }: RootState) => ({ user }))(groupMemberCollapse);
