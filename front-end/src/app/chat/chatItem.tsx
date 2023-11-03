import { Conversation, markMessageAsSeenAsyncAction } from "@/redux/slices/chat";
import { User } from "@/redux/slices/user";
import { AppDispatch } from "@/redux/store";
import { formatDate } from "@/shared/utils/dateFormat";
import { MessageInstance } from "antd/es/message/interface";
import Image from "next/image";
import React, { MouseEventHandler, useEffect } from "react";
import { connect } from "react-redux";

type Props = {
  messageApi: MessageInstance;
  active?: boolean;
  data: Conversation;
  user: User;
  handleClick: MouseEventHandler<HTMLDivElement>;
  dispatch: AppDispatch;
};

const chatItem = ({ messageApi, active, data, user, handleClick, dispatch }: Props) => {
  useEffect(() => {
    if (active) dispatch(markMessageAsSeenAsyncAction({ conversationId: data.id, messageApi }));
  }, [active, data]);

  const friend = data.users.find((u) => u.id !== user.id);

  if (data.isGroup) {
    return (
      <div
        role="button"
        onClick={handleClick}
        className={`flex items-center p-2 gap-2 ${active ? "bg-light-gray" : "bg-white"}`}
      >
        <div
          className={`min-w-[80px] relative after:content-[''] after:border-white after:border-2 after:absolute after:bottom-1 after:right-1 after:w-4 after:h-4 after:rounded-full after:bg-green-500`}
        >
          <Image
            src={
              data.avatar
                ? data.avatar
                : `https://ui-avatars.com/api/?name=${data.conversationName.replace(
                    " ",
                    "+"
                  )}&size=128`
            }
            alt="avatar"
            width={80}
            height={80}
            className="rounded-full w-[80px] h-[80px] object-cover"
            priority
          />
        </div>
        <div className="flex flex-1 flex-col h-full justify-center">
          <div className="flex justify-between items-center gap-2">
            <h1 className={`flex-1 text-start text-xl ${active ? "font-bold" : "font-semibold"}`}>
              {data.conversationName}
            </h1>
            <p className={`text-start text-xl ${active ? "font-bold" : "font-semibold"}`}>
              {data.message.messages.length > 0
                ? new Date().getDate() !==
                  new Date(data.message.messages[0].createdAt * 1000).getDate()
                  ? formatDate(new Date(data.message.messages[0].createdAt * 1000), "HH:mm, dd MMM")
                  : formatDate(new Date(data.message.messages[0].createdAt * 1000), "HH:mm")
                : ""}
            </p>
          </div>
          <div className="flex justify-between items-center gap-2">
            <div
              className={`flex-1 text-start text-base truncate max-w-[15vw] leading-7 ${
                active ? "font-normal" : "font-light"
              }`}
            >
              {data.message.messages.length > 0 ? (
                data.message.messages[0].deleted ? (
                  data.message.messages[0].sender.id === user.id ? (
                    "You unsent a message"
                  ) : (
                    data.message.messages[0].sender.displayName + " unsent a message"
                  )
                ) : data.message.messages[0].sender.id === user.id &&
                  data.message.messages[0].messageType !== "MESSAGE_TYPE_SYSTEM_TEXT" ? (
                  "You: " + data.message.messages[0].content
                ) : data.message.messages[0].messageType !== "MESSAGE_TYPE_SYSTEM_TEXT" ? (
                  `${data.message.messages[0].sender.displayName}: ${data.message.messages[0].content}`
                ) : (
                  data.message.messages[0].content
                )
              ) : (
                <h1 className="italic">{`Say hi to group ${data.conversationName} 🎉`}</h1>
              )}
            </div>
            {data.unseenMessage > 0 && (
              <div className="bg-main text-white w-7 h-7 rounded-full flex justify-center items-center">
                {data.unseenMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    if (friend)
      return (
        <div
          role="button"
          onClick={handleClick}
          className={`flex items-center p-2 gap-2 ${active ? "bg-light-gray" : "bg-white"}`}
        >
          <div
            className={`min-w-[80px] relative after:content-[''] after:border-white after:border-2 after:absolute after:bottom-1 after:right-1 after:w-4 after:h-4 after:rounded-full ${
              friend.online ? "after:bg-green-500" : "after:bg-gray-400"
            }`}
          >
            {data.isGroup ? (
              <Image
                src={
                  data.avatar
                    ? data.avatar
                    : `https://ui-avatars.com/api/?name=${data.conversationName.replace(
                        " ",
                        "+"
                      )}&size=128`
                }
                alt="avatar"
                width={80}
                height={80}
                className="rounded-full w-[80px] h-[80px] object-cover"
                priority
              />
            ) : (
              <Image
                src={
                  friend.avatar
                    ? friend.avatar
                    : `https://ui-avatars.com/api/?name=${friend.displayName.replace(
                        " ",
                        "+"
                      )}&size=128`
                }
                alt="avatar"
                width={80}
                height={80}
                className="rounded-full w-[80px] h-[80px] object-cover"
                priority
              />
            )}
          </div>
          <div className="flex flex-1 flex-col h-full justify-center">
            <div className="flex justify-between items-center gap-2">
              <h1 className={`flex-1 text-start text-xl ${active ? "font-bold" : "font-semibold"}`}>
                {data.isGroup ? data.conversationName : friend.displayName}
              </h1>
              <p className={`text-start text-xl ${active ? "font-bold" : "font-semibold"}`}>
                {data.message.messages.length > 0
                  ? new Date().getDate() !==
                    new Date(data.message.messages[0].createdAt * 1000).getDate()
                    ? formatDate(
                        new Date(data.message.messages[0].createdAt * 1000),
                        "HH:mm, dd MMM"
                      )
                    : formatDate(new Date(data.message.messages[0].createdAt * 1000), "HH:mm")
                  : ""}
              </p>
            </div>
            <div className="flex justify-between items-center gap-2">
              <div
                className={`flex-1 text-start text-base truncate max-w-[15vw] leading-7 ${
                  active ? "font-normal" : "font-light"
                }`}
              >
                {data.message.messages.length > 0 ? (
                  data.message.messages[0].deleted ? (
                    data.message.messages[0].sender.id === user.id ? (
                      "You unsent a message"
                    ) : (
                      data.message.messages[0].sender.displayName + " unsent a message"
                    )
                  ) : data.message.messages[0].sender.id === user.id ? (
                    "You: " + data.message.messages[0].content
                  ) : data.isGroup ? (
                    `${data.message.messages[0].sender.displayName}: ${data.message.messages[0].content}`
                  ) : (
                    data.message.messages[0].content
                  )
                ) : (
                  <h1 className="italic">{`Say hi to ${
                    data.isGroup ? data.conversationName : friend.displayName
                  } 🖐️`}</h1>
                )}
              </div>
              {data.unseenMessage > 0 && (
                <div className="bg-main text-white w-7 h-7 rounded-full flex justify-center items-center">
                  {data.unseenMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      );
  }
};

export default connect()(chatItem);
