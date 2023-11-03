"use client";
import {
  Conversation,
  changeConversationNotification,
  changePreferConversationLanguage,
  getMessagesAsyncAction,
  select,
} from "@/redux/slices/chat";
import { AppDispatch, RootState } from "@/redux/store";
import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { Dropdown } from "../../../shared/components/dropDown";
import TextInput from "./textInput";
import { Empty } from "@/shared/components/empty";
import { User } from "@/redux/slices/user";
import { Skeleton, message } from "antd";
import { Loader } from "@/shared/components/loader";
import InfiniteScroll from "react-infinite-scroll-component";
import MessageItem from "./messageItem";
import InfoSideBar from "./infoSideBar";
import { groupMessage } from "@/shared/utils/groupMessage";
import { formatDate } from "@/shared/utils/dateFormat";
import { Language } from "@/redux/slices/language";
import {
  setConversationNotification,
  setConversationPreferLanguage,
} from "@/shared/APIs/conversationAPI";

type Props = {
  params: { id: string };
  conversations: Conversation[];
  user: User;
  languages: Language[];
  dispatch: AppDispatch;
};

const page = ({ params, conversations, user, languages, dispatch }: Props) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [languageIndex, setLanguageIndex] = useState<number>(-1);
  const [showInfo, setShowInfo] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const data = conversations.find((c) => c.id.toString() === params.id);

  useEffect(() => {
    dispatch(select({ currentId: Number(params.id) }));
  }, [params.id]);

  useEffect(() => {
    if (!data?.preferLanguage) setLanguageIndex(0);
    else setLanguageIndex(languages.findIndex((l) => l.code === data?.preferLanguage));
  }, [languages, data]);

  if (data) {
    const friend = data.users.find((u) => u.id !== user.id);
    const { hasMore } = data.message;
    const messages = groupMessage(data.message.messages, hasMore);

    const loadFunc = () => {
      const page = Math.floor(messages.length / 20);
      dispatch(getMessagesAsyncAction({ messageApi, conversationId: data.id, page, size: 20 }));
    };

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView();
    };

    return (
      <div className="flex h-full">
        {contextHolder}
        {friend || data.isGroup ? (
          <>
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between items-center p-2 bg-white">
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold">
                    {data.isGroup ? data.conversationName : friend?.displayName}
                  </h1>
                  <h1 className="text-base font-light">{friend?.online ? "Active" : "Offline"}</h1>
                </div>
                <div className="flex gap-4 items-center">
                  {languages.length > 0 && languageIndex > -1 ? (
                    <Dropdown
                      value={languageIndex}
                      values={languages}
                      onChange={async (value: number) => {
                        setLanguageIndex(value);
                        try {
                          await setConversationPreferLanguage(
                            data.id,
                            value > 0 ? languages[value].code : ""
                          );
                          dispatch(
                            changePreferConversationLanguage({
                              conversationId: data.id,
                              language: value > 0 ? languages[value].code : "",
                            })
                          );
                          messageApi.success("Set language successfully");
                        } catch (e: any) {
                          messageApi.error(e.message);
                        }
                      }}
                    />
                  ) : (
                    <Skeleton.Button active />
                  )}
                  <button
                    onClick={async () => {
                      try {
                        const response = await setConversationNotification(
                          data.id,
                          !data.notification
                        );
                        dispatch(
                          changeConversationNotification({
                            conversationId: data.id,
                            notification: response.notification ? true : false,
                          })
                        );
                        messageApi.success(
                          response.notification ? "Turn on notification" : "Turn off notification"
                        );
                      } catch (e: any) {
                        messageApi.error(e.message);
                      }
                    }}
                    className="bg-button rounded-lg w-9 h-9 flex justify-center items-center hover:bg-gray-200"
                  >
                    {!data.notification ? (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.0699 6.12019C11.3731 6.03841 11.6859 5.99805 11.9999 6.00019C13.0608 6.00019 14.0782 6.42161 14.8284 7.17176C15.5785 7.9219 15.9999 8.93932 15.9999 10.0002V11.3402C15.9999 11.6054 16.1053 11.8598 16.2928 12.0473C16.4804 12.2348 16.7347 12.3402 16.9999 12.3402C17.2652 12.3402 17.5195 12.2348 17.707 12.0473C17.8946 11.8598 17.9999 11.6054 17.9999 11.3402V10.0002C17.9985 8.58331 17.4957 7.21265 16.5806 6.13096C15.6654 5.04927 14.397 4.32633 12.9999 4.09019V3.00019C12.9999 2.73497 12.8946 2.48061 12.707 2.29308C12.5195 2.10554 12.2652 2.00019 11.9999 2.00019C11.7347 2.00019 11.4804 2.10554 11.2928 2.29308C11.1053 2.48061 10.9999 2.73497 10.9999 3.00019V4.10019L10.5499 4.18019C10.2927 4.24914 10.0734 4.41747 9.9402 4.64814C9.80705 4.87881 9.77099 5.15293 9.83994 5.41019C9.9089 5.66745 10.0772 5.88678 10.3079 6.01993C10.5386 6.15308 10.8127 6.18914 11.0699 6.12019V6.12019ZM21.7099 20.2902L3.70994 2.29019C3.52164 2.10188 3.26624 1.99609 2.99994 1.99609C2.73364 1.99609 2.47824 2.10188 2.28994 2.29019C2.10164 2.47849 1.99585 2.73388 1.99585 3.00019C1.99585 3.26649 2.10164 3.52188 2.28994 3.71019L6.40994 7.82019C6.13897 8.51505 5.99993 9.25435 5.99994 10.0002V13.1802C5.41639 13.3865 4.91094 13.7683 4.55288 14.2731C4.19482 14.778 4.00168 15.3812 3.99994 16.0002V18.0002C3.99994 18.2654 4.1053 18.5198 4.29283 18.7073C4.48037 18.8948 4.73472 19.0002 4.99994 19.0002H8.13994C8.37022 19.8476 8.87294 20.5956 9.57054 21.1289C10.2681 21.6622 11.1218 21.9512 11.9999 21.9512C12.878 21.9512 13.7317 21.6622 14.4293 21.1289C15.1269 20.5956 15.6297 19.8476 15.8599 19.0002H17.5899L20.2899 21.7102C20.3829 21.8039 20.4935 21.8783 20.6154 21.9291C20.7372 21.9798 20.8679 22.006 20.9999 22.006C21.132 22.006 21.2627 21.9798 21.3845 21.9291C21.5064 21.8783 21.617 21.8039 21.7099 21.7102C21.8037 21.6172 21.8781 21.5066 21.9288 21.3848C21.9796 21.2629 22.0057 21.1322 22.0057 21.0002C22.0057 20.8682 21.9796 20.7375 21.9288 20.6156C21.8781 20.4937 21.8037 20.3831 21.7099 20.2902V20.2902ZM7.99994 10.0002C7.98468 9.81717 7.98468 9.6332 7.99994 9.45019L11.5899 13.0002H7.99994V10.0002ZM11.9999 20.0002C11.6509 19.9981 11.3085 19.9047 11.0068 19.7292C10.705 19.5538 10.4545 19.3025 10.2799 19.0002H13.7199C13.5454 19.3025 13.2949 19.5538 12.9931 19.7292C12.6914 19.9047 12.349 19.9981 11.9999 20.0002ZM5.99994 17.0002V16.0002C5.99994 15.735 6.1053 15.4806 6.29283 15.2931C6.48037 15.1055 6.73472 15.0002 6.99994 15.0002H13.5899L15.5899 17.0002H5.99994Z"
                          fill="red"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M18 13.18V10C17.9986 8.58312 17.4958 7.21247 16.5806 6.13077C15.6655 5.04908 14.3971 4.32615 13 4.09V3C13 2.73478 12.8946 2.48043 12.7071 2.29289C12.5196 2.10536 12.2652 2 12 2C11.7348 2 11.4804 2.10536 11.2929 2.29289C11.1054 2.48043 11 2.73478 11 3V4.09C9.60294 4.32615 8.33452 5.04908 7.41939 6.13077C6.50425 7.21247 6.00144 8.58312 6 10V13.18C5.41645 13.3863 4.911 13.7681 4.55294 14.2729C4.19488 14.7778 4.00174 15.3811 4 16V18C4 18.2652 4.10536 18.5196 4.29289 18.7071C4.48043 18.8946 4.73478 19 5 19H8.14C8.37028 19.8474 8.873 20.5954 9.5706 21.1287C10.2682 21.6621 11.1219 21.951 12 21.951C12.8781 21.951 13.7318 21.6621 14.4294 21.1287C15.127 20.5954 15.6297 19.8474 15.86 19H19C19.2652 19 19.5196 18.8946 19.7071 18.7071C19.8946 18.5196 20 18.2652 20 18V16C19.9983 15.3811 19.8051 14.7778 19.4471 14.2729C19.089 13.7681 18.5835 13.3863 18 13.18ZM8 10C8 8.93913 8.42143 7.92172 9.17157 7.17157C9.92172 6.42143 10.9391 6 12 6C13.0609 6 14.0783 6.42143 14.8284 7.17157C15.5786 7.92172 16 8.93913 16 10V13H8V10ZM12 20C11.651 19.9979 11.3086 19.9045 11.0068 19.7291C10.7051 19.5536 10.4545 19.3023 10.28 19H13.72C13.5455 19.3023 13.2949 19.5536 12.9932 19.7291C12.6914 19.9045 12.349 19.9979 12 20ZM18 17H6V16C6 15.7348 6.10536 15.4804 6.29289 15.2929C6.48043 15.1054 6.73478 15 7 15H17C17.2652 15 17.5196 15.1054 17.7071 15.2929C17.8946 15.4804 18 15.7348 18 16V17Z"
                          fill="black"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="bg-button rounded-lg w-9 h-9 flex justify-center items-center hover:bg-gray-200"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 9C9.73479 9 9.48043 9.10536 9.2929 9.29289C9.10536 9.48043 9 9.73478 9 10V14C9 14.2652 9.10536 14.5196 9.2929 14.7071C9.48043 14.8946 9.73479 15 10 15C10.2652 15 10.5196 14.8946 10.7071 14.7071C10.8946 14.5196 11 14.2652 11 14V10C11 9.73478 10.8946 9.48043 10.7071 9.29289C10.5196 9.10536 10.2652 9 10 9ZM10.38 5.08C10.1365 4.97998 9.86347 4.97998 9.62 5.08C9.49725 5.12759 9.38511 5.19896 9.29 5.29C9.20167 5.3872 9.13065 5.49882 9.08 5.62C9.02402 5.73868 8.99662 5.86882 9 6C8.99924 6.13161 9.02447 6.26207 9.07423 6.38391C9.124 6.50574 9.19732 6.61656 9.29 6.71C9.38721 6.79833 9.49882 6.86936 9.62 6.92C9.7715 6.98224 9.93597 7.00632 10.099 6.99011C10.2619 6.97391 10.4184 6.91792 10.5547 6.82707C10.691 6.73622 10.8029 6.61328 10.8805 6.46907C10.9582 6.32486 10.9992 6.16378 11 6C10.9963 5.73523 10.8927 5.48163 10.71 5.29C10.6149 5.19896 10.5028 5.12759 10.38 5.08ZM10 0C8.02219 0 6.08879 0.58649 4.4443 1.6853C2.79981 2.78412 1.51809 4.3459 0.761209 6.17317C0.00433284 8.00043 -0.193701 10.0111 0.192152 11.9509C0.578004 13.8907 1.53041 15.6725 2.92894 17.0711C4.32746 18.4696 6.10929 19.422 8.0491 19.8079C9.98891 20.1937 11.9996 19.9957 13.8268 19.2388C15.6541 18.4819 17.2159 17.2002 18.3147 15.5557C19.4135 13.9112 20 11.9778 20 10C20 8.68678 19.7413 7.38642 19.2388 6.17317C18.7363 4.95991 17.9997 3.85752 17.0711 2.92893C16.1425 2.00035 15.0401 1.26375 13.8268 0.761205C12.6136 0.258658 11.3132 0 10 0ZM10 18C8.41775 18 6.87104 17.5308 5.55544 16.6518C4.23985 15.7727 3.21447 14.5233 2.60897 13.0615C2.00347 11.5997 1.84504 9.99113 2.15372 8.43928C2.4624 6.88743 3.22433 5.46197 4.34315 4.34315C5.46197 3.22433 6.88743 2.4624 8.43928 2.15372C9.99113 1.84504 11.5997 2.00346 13.0615 2.60896C14.5233 3.21447 15.7727 4.23984 16.6518 5.55544C17.5308 6.87103 18 8.41775 18 10C18 12.1217 17.1572 14.1566 15.6569 15.6569C14.1566 17.1571 12.1217 18 10 18Z"
                        fill="black"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 flex flex-col-reverse overflow-auto" id="scrollableDiv">
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
                  scrollableTarget="scrollableDiv"
                  className="flex flex-col-reverse"
                >
                  <div ref={messagesEndRef} />
                  {messages.map((m, i) => {
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
                    if (data.isGroup) {
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
                        key={m.id}
                        userId={user.id}
                        conversation={data}
                        message={m}
                        shouldShowAvatar={shouldShowAvatar}
                        shouldShowName={shouldShowName}
                        messageApi={messageApi}
                        readOnly={false}
                      />
                    );
                  })}
                </InfiniteScroll>
              </div>
              <TextInput
                conversationId={data.id}
                user={user}
                messageApi={messageApi}
                scrollToBottom={scrollToBottom}
              />
            </div>
            <InfoSideBar showInfo={showInfo} friend={friend} data={data} messageApi={messageApi} />
          </>
        ) : (
          <></>
        )}
      </div>
    );
  } else {
    return <Empty text="Conversation does not exist" />;
  }
};

const mapState = ({ chat, user, language }: RootState) => ({
  conversations: chat.conversations,
  user: user,
  languages: language,
});

export default connect(mapState)(page);
