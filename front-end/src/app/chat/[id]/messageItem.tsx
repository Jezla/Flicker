import { Conversation, File, Message, translateAsyncAction } from "@/redux/slices/chat";
import { AvatarWithoutStatus } from "@/shared/components/avatarWithoutStatus";
import { formatDate } from "@/shared/utils/dateFormat";
import { Image, Space, Tooltip } from "antd";
import {
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import React, { useCallback, useEffect } from "react";
import styles from "./styles.module.css";
import MessageContextMenu from "./messageContextMenu";
import { Spinner } from "@/shared/components/spinner";
import { MessageInstance } from "antd/es/message/interface";
import { connect } from "react-redux";
import { AppDispatch } from "@/redux/store";
import AudioContextMenu from "./audioContextMenu";

type Props = {
  userId: number;
  conversation: Conversation;
  message: Message;
  shouldShowAvatar: boolean;
  shouldShowName: boolean;
  messageApi: MessageInstance;
  readOnly: boolean;
  dispatch: AppDispatch;
};

const messageItem = ({
  userId,
  message,
  conversation,
  shouldShowAvatar,
  shouldShowName,
  messageApi,
  readOnly,
  dispatch,
}: Props) => {
  const { sender, content, files, translate, deleted } = message;
  const isSelfMessage = sender.id === userId;

  const onDownload = (file: File) => {
    fetch(file.url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.download = file.originalFileName;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
      });
  };

  useEffect(() => {
    if (
      (message.messageType === "MESSAGE_TYPE_USER_TEXT" ||
        message.messageType === "MESSAGE_TYPE_FILE_TEXT") &&
      conversation.shouldTranslate &&
      conversation.preferLanguage !== null &&
      conversation.preferLanguage !== "" &&
      message.sender.id !== userId
    ) {
      dispatch(
        translateAsyncAction({
          messageApi,
          conversationId: conversation.id,
          message,
          code: conversation.preferLanguage,
          name: "",
        })
      );
    }
  }, []);

  const DeletedMessageDisplay = useCallback(
    () => (
      <Tooltip
        placement={isSelfMessage ? "left" : "right"}
        title={formatDate(new Date(message.createdAt * 1000), "HH:mm")}
        overlayStyle={isSelfMessage ? { marginRight: 40 } : {}}
      >
        <div
          className={`${
            isSelfMessage ? "rounded-bl-2xl" : "rounded-br-2xl"
          } py-3 px-4 rounded-tl-2xl text-gray-400 text-left border rounded-tr-2xl min-w-[40px] max-w-[200px] lg:max-w-[400px] break-words whitespace-pre-wrap`}
        >
          {isSelfMessage ? "You unsent a message" : `${sender.displayName} unsent a message`}
        </div>
      </Tooltip>
    ),
    [message]
  );

  const MessageDisplay = useCallback(() => {
    if (message.messageType === "MESSAGE_TYPE_USER_TEXT") {
      return (
        <div className="flex flex-col gap-1">
          <MessageContextMenu
            isSelfMessage={isSelfMessage}
            message={message}
            conversation={conversation}
            messageApi={messageApi}
            disabled={readOnly}
          >
            <Tooltip
              placement={isSelfMessage ? "left" : "right"}
              title={formatDate(new Date(message.createdAt * 1000), "HH:mm")}
              overlayStyle={isSelfMessage ? { marginRight: 40 } : {}}
            >
              <div
                className={`${
                  isSelfMessage ? "bg-transparent rounded-bl-2xl" : "bg-white  rounded-br-2xl"
                } py-3 px-4 rounded-tl-2xl text-left rounded-tr-2xl min-w-[40px] max-w-[200px] lg:max-w-[400px] break-words whitespace-pre-wrap`}
              >
                {content}
              </div>
            </Tooltip>
          </MessageContextMenu>
          {!isSelfMessage && translate && translate.code && (
            <div
              className={`flex flex-col bg-white rounded-br-2xl py-3 px-4 text-left rounded-tr-2xl min-w-[40px] max-w-[200px] lg:max-w-[400px] break-words whitespace-pre-wrap`}
            >
              <div className="italic text-xs text-text flex gap-2 justify-between mb-2">
                <div className="">Translate</div>
                <ArrowRightOutlined />
                <div className="">{translate.name}</div>
              </div>
              {translate.text ? (
                translate.text
              ) : (
                <Spinner className="w-8 h-8 m-auto text-gray-200 animate-spin fill-main" />
              )}
            </div>
          )}
        </div>
      );
    } else if (
      message.messageType === "MESSAGE_TYPE_USER_FILE" ||
      message.messageType === "MESSAGE_TYPE_FILE_TEXT"
    ) {
      const imageFiles = files.filter((f) => f.contentType.startsWith("image/"));
      const videoFiles = files.filter((f) => f.contentType.startsWith("video/"));
      const audioFiles = files.filter((f) => f.contentType.startsWith("application/octet-stream"));
      const otherFiles = files.filter(
        (f) =>
          !f.contentType.startsWith("image/") &&
          !f.contentType.startsWith("video/") &&
          !f.contentType.startsWith("application/octet-stream")
      );
      return (
        <div
          className={`flex flex-col max-w-[500px] gap-1 ${
            isSelfMessage ? "items-end" : "items-start"
          }`}
        >
          <Image.PreviewGroup
            preview={{
              countRender: (current, total) => (
                <Space size={12} className={styles.info}>
                  {current}/{total}
                </Space>
              ),
              toolbarRender: (
                _,
                {
                  transform: { scale },
                  actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn },
                  current,
                }
              ) => (
                <Space size={12} className={styles.toolbar}>
                  <DownloadOutlined
                    onClick={() => onDownload(imageFiles[current])}
                    className={styles.anticon}
                  />
                  <SwapOutlined rotate={90} onClick={onFlipY} className={styles.anticon} />
                  <SwapOutlined onClick={onFlipX} className={styles.anticon} />
                  <RotateLeftOutlined onClick={onRotateLeft} className={styles.anticon} />
                  <RotateRightOutlined onClick={onRotateRight} />
                  <ZoomOutOutlined
                    disabled={scale === 1}
                    onClick={onZoomOut}
                    className={styles.anticon}
                  />
                  <ZoomInOutlined
                    disabled={scale === 50}
                    onClick={onZoomIn}
                    className={styles.anticon}
                  />
                </Space>
              ),
            }}
          >
            <Tooltip
              placement={isSelfMessage ? "left" : "right"}
              title={formatDate(new Date(message.createdAt * 1000), "HH:mm")}
              overlayStyle={isSelfMessage ? { marginRight: 40 } : {}}
              className={`flex gap-2 flex-wrap items-end ${
                isSelfMessage ? "justify-end" : "justify-start"
              }`}
            >
              {imageFiles.map((f) => (
                <Image
                  key={f.id}
                  className="max-h-[100px] rounded-xl"
                  src={f.url}
                  alt={f.originalFileName}
                />
              ))}
            </Tooltip>
          </Image.PreviewGroup>
          {videoFiles.map((f) => (
            <Tooltip
              key={f.id}
              placement={isSelfMessage ? "left" : "right"}
              title={formatDate(new Date(message.createdAt * 1000), "HH:mm")}
              overlayStyle={isSelfMessage ? { marginRight: 40 } : {}}
            >
              <video controls className="rounded-xl" src={f.url} preload="metadata" />
            </Tooltip>
          ))}
          {audioFiles.map((f) => (
            <div className="flex flex-col gap-1" key={f.id}>
              <AudioContextMenu
                messageApi={messageApi}
                audioFile={f}
                message={message}
                disabled={isSelfMessage || readOnly}
                conversation={conversation}
              >
                <Tooltip
                  placement={isSelfMessage ? "left" : "right"}
                  title={formatDate(new Date(message.createdAt * 1000), "HH:mm")}
                  overlayStyle={isSelfMessage ? { marginRight: 40 } : {}}
                >
                  <audio controls className="rounded-xl" src={f.url} preload="metadata" />
                </Tooltip>
              </AudioContextMenu>
              {!isSelfMessage && f.transcript !== undefined && (
                <div
                  className={`flex flex-col bg-white rounded-br-2xl py-3 px-4 text-left rounded-tr-2xl min-w-[40px] max-w-[200px] lg:max-w-[400px] break-words whitespace-pre-wrap`}
                >
                  <div className="italic text-xs text-text flex gap-2 justify-start mb-2">
                    <div className="">Transcript</div>
                  </div>
                  {f.transcript ? (
                    f.transcript
                  ) : (
                    <Spinner className="w-8 h-8 m-auto text-gray-200 animate-spin fill-main" />
                  )}
                </div>
              )}
              {!isSelfMessage && f.translate && (
                <div
                  className={`flex flex-col bg-white rounded-br-2xl py-3 px-4 text-left rounded-tr-2xl min-w-[40px] max-w-[200px] lg:max-w-[400px] break-words whitespace-pre-wrap`}
                >
                  <div className="italic text-xs text-text flex gap-2 justify-between mb-2">
                    <div className="">{`Transcript (translate)`}</div>
                    <ArrowRightOutlined />
                    <div className="">{f.translate.name}</div>
                  </div>
                  {f.translate.text ? (
                    f.translate.text
                  ) : (
                    <Spinner className="w-8 h-8 m-auto text-gray-200 animate-spin fill-main" />
                  )}
                </div>
              )}
            </div>
          ))}
          {otherFiles.map((f) => (
            <Tooltip
              key={f.id}
              placement={isSelfMessage ? "left" : "right"}
              title={formatDate(new Date(message.createdAt * 1000), "HH:mm")}
              overlayStyle={isSelfMessage ? { marginRight: 40 } : {}}
            >
              <button
                className="rounded-xl bg-light-mid p-4 flex gap-2 items-center hover:opacity-50 active:scale-90 duration-300"
                onClick={() => onDownload(f)}
              >
                <div className="w-10 h-10 rounded-full bg-text flex justify-center items-center shadow-lg">
                  <svg
                    width="16"
                    height="20"
                    viewBox="0 0 16 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 8H6C6.26522 8 6.51957 7.89464 6.70711 7.70711C6.89464 7.51957 7 7.26522 7 7C7 6.73478 6.89464 6.48043 6.70711 6.29289C6.51957 6.10536 6.26522 6 6 6H5C4.73478 6 4.48043 6.10536 4.29289 6.29289C4.10536 6.48043 4 6.73478 4 7C4 7.26522 4.10536 7.51957 4.29289 7.70711C4.48043 7.89464 4.73478 8 5 8ZM5 10C4.73478 10 4.48043 10.1054 4.29289 10.2929C4.10536 10.4804 4 10.7348 4 11C4 11.2652 4.10536 11.5196 4.29289 11.7071C4.48043 11.8946 4.73478 12 5 12H11C11.2652 12 11.5196 11.8946 11.7071 11.7071C11.8946 11.5196 12 11.2652 12 11C12 10.7348 11.8946 10.4804 11.7071 10.2929C11.5196 10.1054 11.2652 10 11 10H5ZM16 6.94C15.9896 6.84813 15.9695 6.75763 15.94 6.67V6.58C15.8919 6.47718 15.8278 6.38267 15.75 6.3L9.75 0.3C9.66734 0.222216 9.57282 0.158081 9.47 0.11C9.44015 0.10576 9.40985 0.10576 9.38 0.11C9.27841 0.0517412 9.16622 0.0143442 9.05 0H3C2.20435 0 1.44129 0.316071 0.87868 0.87868C0.316071 1.44129 0 2.20435 0 3V17C0 17.7956 0.316071 18.5587 0.87868 19.1213C1.44129 19.6839 2.20435 20 3 20H13C13.7956 20 14.5587 19.6839 15.1213 19.1213C15.6839 18.5587 16 17.7956 16 17V7C16 7 16 7 16 6.94ZM10 3.41L12.59 6H11C10.7348 6 10.4804 5.89464 10.2929 5.70711C10.1054 5.51957 10 5.26522 10 5V3.41ZM14 17C14 17.2652 13.8946 17.5196 13.7071 17.7071C13.5196 17.8946 13.2652 18 13 18H3C2.73478 18 2.48043 17.8946 2.29289 17.7071C2.10536 17.5196 2 17.2652 2 17V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H8V5C8 5.79565 8.31607 6.55871 8.87868 7.12132C9.44129 7.68393 10.2044 8 11 8H14V17ZM11 14H5C4.73478 14 4.48043 14.1054 4.29289 14.2929C4.10536 14.4804 4 14.7348 4 15C4 15.2652 4.10536 15.5196 4.29289 15.7071C4.48043 15.8946 4.73478 16 5 16H11C11.2652 16 11.5196 15.8946 11.7071 15.7071C11.8946 15.5196 12 15.2652 12 15C12 14.7348 11.8946 14.4804 11.7071 14.2929C11.5196 14.1054 11.2652 14 11 14Z"
                      fill="black"
                    />
                  </svg>
                </div>
                {f.originalFileName}
              </button>
            </Tooltip>
          ))}
          {message.messageType === "MESSAGE_TYPE_FILE_TEXT" && (
            <div className="flex flex-col gap-1">
              <MessageContextMenu
                isSelfMessage={isSelfMessage}
                message={message}
                conversation={conversation}
                messageApi={messageApi}
                disabled={readOnly}
              >
                <Tooltip
                  placement={isSelfMessage ? "left" : "right"}
                  title={formatDate(new Date(message.createdAt * 1000), "HH:mm")}
                  overlayStyle={isSelfMessage ? { marginRight: 40 } : {}}
                >
                  <div
                    className={`${
                      isSelfMessage ? "bg-transparent rounded-bl-2xl" : "bg-white rounded-br-2xl"
                    } py-3 px-4 rounded-tl-2xl text-left rounded-tr-2xl min-w-[40px] max-w-[200px] lg:max-w-[400px] break-words whitespace-pre-wrap`}
                  >
                    {content}
                  </div>
                </Tooltip>
              </MessageContextMenu>
              {!isSelfMessage && translate && translate.code && (
                <div
                  className={`flex flex-col bg-white rounded-br-2xl py-3 px-4 text-left rounded-tr-2xl min-w-[40px] max-w-[200px] lg:max-w-[400px] break-words whitespace-pre-wrap`}
                >
                  <div className="italic text-xs text-text flex gap-2 justify-between mb-2">
                    <div className="">Translate</div>
                    <ArrowRightOutlined />
                    <div className="">{translate.name}</div>
                  </div>
                  {translate.text ? (
                    translate.text
                  ) : (
                    <Spinner className="w-8 h-8 m-auto text-gray-200 animate-spin fill-main" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    } else return <></>;
  }, [message, conversation.preferLanguage]);

  return message.messageType === "MESSAGE_TYPE_SYSTEM_TEXT" ? (
    <div className="text-text text-center my-2">{message.content}</div>
  ) : isSelfMessage ? (
    <div
      className={`relative flex items-end flex-row-reverse mx-2 ${
        shouldShowAvatar ? "mb-4" : "mb-1"
      }`}
    >
      {shouldShowAvatar ? (
        <>
          <AvatarWithoutStatus
            image={sender.avatar}
            userName={sender.displayName}
            className="rounded-full w-12 h-12"
          />
          {message.messageType !== "MESSAGE_TYPE_USER_FILE" && !deleted ? (
            <div className="h-6 w-4 mr-2 border-[16px] border-light-gray border-t-[0px] border-l-[0px] border-b-[24px] border-b-transparent" />
          ) : (
            <div className="w-6 h-12" />
          )}
        </>
      ) : (
        <div className="w-[72px] h-12" />
      )}
      {deleted ? <DeletedMessageDisplay /> : <MessageDisplay />}
    </div>
  ) : (
    <>
      <div className={`relative flex items-end mx-2 ${shouldShowAvatar ? "mb-4" : "mb-1"}`}>
        {shouldShowAvatar ? (
          <>
            <AvatarWithoutStatus
              image={sender.avatar}
              userName={sender.displayName}
              className="rounded-full w-12 h-12"
            />
            {message.messageType !== "MESSAGE_TYPE_USER_FILE" && !deleted ? (
              <div className="h-6 w-4 ml-2 border-[16px] border-light-gray border-t-[0px] border-r-[0px] border-b-[24px] border-b-white" />
            ) : (
              <div className="w-6 h-12" />
            )}
          </>
        ) : (
          <div className="w-[72px] h-12" />
        )}
        {deleted ? <DeletedMessageDisplay /> : <MessageDisplay />}
      </div>
      {shouldShowName && <div className="text-text text-sm ml-[88px]">{sender.displayName}</div>}
    </>
  );
};

export default connect()(messageItem);
