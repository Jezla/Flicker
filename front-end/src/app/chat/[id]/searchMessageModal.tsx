import { User } from "@/redux/slices/user";
import { ConfigProvider, Modal } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Loader } from "@/shared/components/loader";
import { searchMessages } from "@/shared/APIs/messageAPI";
import { Conversation, Message } from "@/redux/slices/chat";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatDate } from "@/shared/utils/dateFormat";
import MessageItem from "./messageItem";
import { RootState } from "@/redux/store";
import magnifier from "../../../../public/magnifier-24-outline.svg";
import Image from "next/image";
import { Empty } from "@/shared/components/empty";
import { groupMessage } from "@/shared/utils/groupMessage";

type Props = {
  conversation: Conversation;
  user: User;
  open: boolean;
  onCancel: () => void;
  messageApi: MessageInstance;
};

const searchMessageModal = ({ conversation, user, open, onCancel, messageApi }: Props) => {
  const [termMessages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query === "") {
        setMessages([]);
        setHasMore(false);
      } else {
        try {
          const response = await searchMessages(conversation.id, query);
          response.content.forEach((m: any) => (m.id = m.id + "draft"));
          setMessages(response.content);
          setHasMore(!response.last);
        } catch (e: any) {
          messageApi.error(e.message);
        }
      }
    }, 0);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHasMore(false);
    }
  }, [open]);

  const loadFunc = async () => {
    const page = Math.floor(termMessages.length / 10);
    const response = await searchMessages(conversation.id, query, page);
    response.content.forEach((m: any) => (m.id = m.id + "draft"));
    const startPoint = termMessages.length % 10;
    const newMessages = response.content.slice(startPoint);
    setMessages([...termMessages, ...newMessages]);
    setHasMore(!response.last);
  };

  const messages = groupMessage(termMessages, hasMore);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#435334",
        },
      }}
    >
      <Modal
        open={open}
        onCancel={() => {
          onCancel();
        }}
        closable={false}
        footer={null}
        width={600}
      >
        <div className="text-2xl pb-4 text-center text-main">Search message</div>
        <div className="bg-light-gray rounded-md p-2 pt-4">
          <div className="flex gap-2 p-2 shadow-[4px_4px_20px_0_rgba(0,0,0,0.25)] rounded-xl mb-4">
            <Image src={magnifier} alt="magnifier" />
            <input
              className="flex-1 focus:outline-none bg-light-gray"
              placeholder="Searching"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            ></input>
          </div>
          <div className="flex-1 flex flex-col-reverse overflow-auto max-h-[50vh]">
            <InfiniteScroll
              dataLength={messages.length}
              next={loadFunc}
              hasMore={hasMore}
              inverse={true}
              loader={
                <div className="py-6">
                  <Loader />
                </div>
              }
              height="40vh"
              className={`flex flex-col-reverse ${messages.length === 0 ? "justify-center" : ""}`}
            >
              {loading ? (
                <div className="min-h-[30vh] flex items-center justify-center">
                  <Loader />
                </div>
              ) : messages.length > 0 ? (
                messages.map((m, i) => {
                  const date = new Date(m.createdAt * 1000);
                  const today = new Date();
                  const yesterday = new Date(today.getTime() - 60 * 60 * 24 * 1000);
                  let shouldShowAvatar = false;
                  let shouldShowName = false;
                  if (i === 0) shouldShowAvatar = true;
                  else {
                    if (messages[i - 1].sender.id !== m.sender.id) shouldShowAvatar = true;
                    if (
                      messages[i - 1].messageType === "MESSAGE_TYPE_TIMELINE" ||
                      messages[i - 1].messageType === "MESSAGE_TYPE_SYSTEM_TEXT"
                    )
                      shouldShowAvatar = true;
                  }
                  if (conversation.isGroup) {
                    if (i === messages.length - 1) shouldShowName = true;
                    else {
                      if (messages[i + 1].sender.id !== m.sender.id) shouldShowName = true;
                      if (messages[i + 1].messageType === "MESSAGE_TYPE_TIMELINE")
                        shouldShowName = true;
                    }
                  }
                  return m.messageType === "MESSAGE_TYPE_TIMELINE" ? (
                    <div key={m.id} className="flex items-center justify-center">
                      <div className="text-center my-4 bg-light-mid rounded-full p-2 px-4">
                        {" "}
                        {today.getDate() === date.getDate() &&
                        today.getMonth() === date.getMonth() &&
                        today.getFullYear() === date.getFullYear()
                          ? "Today"
                          : yesterday.getDate() === date.getDate() &&
                            yesterday.getMonth() === date.getMonth() &&
                            yesterday.getFullYear() === date.getFullYear()
                          ? "Yesterday"
                          : formatDate(date, "ddd, dd MMM yyyy")}
                      </div>
                    </div>
                  ) : (
                    <MessageItem
                      readOnly={true}
                      key={m.id}
                      userId={user.id}
                      conversation={conversation}
                      message={m}
                      shouldShowAvatar={shouldShowAvatar}
                      shouldShowName={shouldShowName}
                      messageApi={messageApi}
                    />
                  );
                })
              ) : (
                <div className="mt-10">
                  <Empty text="No messages found" />
                </div>
              )}
            </InfiniteScroll>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default connect(({ user }: RootState) => ({ user }))(searchMessageModal);
