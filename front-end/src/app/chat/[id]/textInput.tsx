import React, { ChangeEvent, FormEvent, useContext, useRef, useState } from "react";
import { ClientContext } from "../layout";
import { Popover } from "antd";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { MessageInstance } from "antd/es/message/interface";
import FilePreviewItem from "./filePreviewItem";
import { sendFiles } from "@/shared/APIs/fileAPI";
import { Spinner } from "@/shared/components/spinner";
import { File as CustomFile } from "@/redux/slices/chat";
import { User } from "@/redux/slices/user";
import VoidRecorder from "./voiceRecorder";

type Props = {
  conversationId: number;
  user: User;
  scrollToBottom: Function;
  messageApi: MessageInstance;
};

const TextInput = ({ conversationId, user, scrollToBottom, messageApi }: Props) => {
  const client = useContext(ClientContext);
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState(1);
  const [voiceRecorderMode, setVoiceRecorderMode] = useState(false);
  const [audioFile, setAudioFile] = useState<File>();

  const [files, setFiles] = useState<File[]>([]);
  const [loadingFile, setLoadingFile] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const updateRows = (textarea: EventTarget & HTMLTextAreaElement) => {
    const lineHeight = 24;
    const minRows = 1;
    const maxRows = 5;

    const previousRows = textarea.rows;
    textarea.rows = minRows;

    const currentRows = Math.ceil((textarea.scrollHeight - lineHeight) / lineHeight) + 1;

    if (currentRows === previousRows) {
      textarea.rows = currentRows;
    }

    if (currentRows > maxRows) {
      textarea.rows = maxRows;
      textarea.scrollTop = textarea.scrollHeight;
    }

    setRows(currentRows < maxRows ? currentRows : maxRows);
  };

  const onEmojiClick = (emojiData: EmojiClickData, e: MouseEvent) => {
    setMessage((message) => message + (emojiData.isCustom ? emojiData.unified : emojiData.emoji));
  };

  const sendMessage = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (client && client.connected) {
      if (voiceRecorderMode) {
        if (audioFile) {
          try {
            setLoadingFile(true);
            const response: CustomFile[] = await sendFiles(conversationId, [audioFile]);
            client.publish({
              destination: `/app/send/${conversationId}/${user.id}`,
              body: JSON.stringify({
                content: `@${user.displayName} sent a voice message`,
                fileIds: response.map((f) => f.id),
                messageType: "MESSAGE_TYPE_USER_FILE",
              }),
            });
            setVoiceRecorderMode(false);
          } catch (e: any) {
            messageApi.error(e.message);
          } finally {
            setLoadingFile(false);
          }
        }
      } else {
        const trimmedMessage = message.trim();
        if (trimmedMessage && files.length > 0) {
          try {
            setLoadingFile(true);
            const response: CustomFile[] = await sendFiles(conversationId, files);
            client.publish({
              destination: `/app/send/${conversationId}/${user.id}`,
              body: JSON.stringify({
                content: trimmedMessage,
                fileIds: response.map((f) => f.id),
                messageType: "MESSAGE_TYPE_FILE_TEXT",
              }),
            });
          } catch (e: any) {
            messageApi.error(e.message);
          } finally {
            setLoadingFile(false);
          }
        } else if (trimmedMessage) {
          client.publish({
            destination: `/app/send/${conversationId}/${user.id}`,
            body: JSON.stringify({
              content: trimmedMessage,
              messageType: "MESSAGE_TYPE_USER_TEXT",
            }),
          });
        } else if (files.length > 0) {
          try {
            setLoadingFile(true);
            const response: CustomFile[] = await sendFiles(conversationId, files);
            client.publish({
              destination: `/app/send/${conversationId}/${user.id}`,
              body: JSON.stringify({
                content: `@${user.displayName} has uploaded some files`,
                fileIds: response.map((f) => f.id),
                messageType: "MESSAGE_TYPE_USER_FILE",
              }),
            });
          } catch (e: any) {
            messageApi.error(e.message);
          } finally {
            setLoadingFile(false);
          }
        }
        setFiles([]);
        setRows(1);
        setMessage("");
      }
      scrollToBottom();
    }
  };

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const largeFile = [];
      for (let i = 0; i < e.target.files.length; i++) {
        if (e.target.files[i].size <= 20 * Math.pow(1024, 2)) {
          files.push(e.target.files[i]);
        } else {
          largeFile.push(e.target.files[i]);
        }
      }
      setFiles([...files]);
      if (ref && ref.current) ref.current.value = "";
      largeFile.forEach((f) => messageApi.warning(`${f.name} is too large (> 20MB)`));
    }
  };

  const removeFile = (file: File) => {
    setFiles(files.filter((f) => f !== file));
  };

  return (
    <div className="p-2">
      <input
        type="file"
        hidden
        multiple
        onChange={handleChangeImage}
        ref={ref}
        accept="image/png, image/jpeg, video/*, .doc, .docx, .pdf, .ppt, .pptx, .xlsx, .xls"
      />
      {files.length > 0 && (
        <div className="flex gap-4 p-2 flex-wrap rounded-tl-lg rounded-tr-lg bg-white">
          {files.map((f, i) => (
            <FilePreviewItem key={i} data={f} handleRemove={() => removeFile(f)} />
          ))}
        </div>
      )}
      <form
        onSubmit={sendMessage}
        className={`${
          files.length > 0 ? "rounded-bl-lg rounded-br-lg" : "rounded-lg"
        } bg-white flex items-center p-2 gap-2 `}
      >
        {!voiceRecorderMode ? (
          <>
            <textarea
              rows={rows}
              style={{ resize: "none" }}
              value={message}
              placeholder="Type here"
              className="flex-1 focus:outline-none"
              onChange={(e) => {
                setMessage(e.target.value);
                updateRows(e.target);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              onClick={() => setVoiceRecorderMode(true)}
              className="p-1 rounded-md hover:bg-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M15.8333 9.16663C15.8333 12.3883 13.2216 15 9.99996 15M9.99996 15C6.7783 15 4.16663 12.3883 4.16663 9.16663M9.99996 15V18.3333M9.99996 18.3333H6.66663M9.99996 18.3333H13.3333M9.99996 11.6666C8.61925 11.6666 7.49996 10.5473 7.49996 9.16663V4.16663C7.49996 2.78591 8.61925 1.66663 9.99996 1.66663C11.3807 1.66663 12.5 2.78591 12.5 4.16663V9.16663C12.5 10.5473 11.3807 11.6666 9.99996 11.6666Z"
                  stroke="#435334"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <Popover
              content={<EmojiPicker onEmojiClick={onEmojiClick} lazyLoadEmojis />}
              trigger="click"
            >
              <button
                className="p-1 rounded-md hover:bg-button"
                onClick={(e) => e.preventDefault()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M12.36 12.23C11.6915 12.769 10.8587 13.0629 10 13.0629C9.14131 13.0629 8.30849 12.769 7.64 12.23C7.43579 12.0603 7.17251 11.9786 6.90808 12.003C6.64365 12.0274 6.39974 12.1558 6.23 12.36C6.06027 12.5642 5.9786 12.8275 6.00298 13.0919C6.02736 13.3563 6.15579 13.6003 6.36 13.77C7.38134 14.6226 8.66957 15.0896 10 15.0896C11.3304 15.0896 12.6187 14.6226 13.64 13.77C13.8442 13.6003 13.9726 13.3563 13.997 13.0919C14.0214 12.8275 13.9397 12.5642 13.77 12.36C13.686 12.2589 13.5828 12.1753 13.4665 12.1141C13.3501 12.0528 13.2229 12.0151 13.0919 12.003C12.8275 11.9786 12.5642 12.0603 12.36 12.23ZM7 9C7.19779 9 7.39113 8.94135 7.55557 8.83147C7.72002 8.72159 7.8482 8.56541 7.92388 8.38268C7.99957 8.19996 8.01937 7.99889 7.98079 7.80491C7.9422 7.61093 7.84696 7.43275 7.70711 7.29289C7.56726 7.15304 7.38908 7.0578 7.19509 7.01921C7.00111 6.98063 6.80005 7.00043 6.61732 7.07612C6.43459 7.15181 6.27842 7.27998 6.16853 7.44443C6.05865 7.60888 6 7.80222 6 8C6 8.26522 6.10536 8.51957 6.2929 8.70711C6.48043 8.89464 6.73479 9 7 9ZM13 7C12.8022 7 12.6089 7.05865 12.4444 7.16853C12.28 7.27841 12.1518 7.43459 12.0761 7.61732C12.0004 7.80004 11.9806 8.00111 12.0192 8.19509C12.0578 8.38907 12.153 8.56725 12.2929 8.70711C12.4328 8.84696 12.6109 8.9422 12.8049 8.98079C12.9989 9.01937 13.2 8.99957 13.3827 8.92388C13.5654 8.84819 13.7216 8.72002 13.8315 8.55557C13.9414 8.39112 14 8.19778 14 8C14 7.73478 13.8946 7.48043 13.7071 7.29289C13.5196 7.10536 13.2652 7 13 7ZM10 0C8.02219 0 6.08879 0.58649 4.4443 1.6853C2.79981 2.78412 1.51809 4.3459 0.761209 6.17317C0.00433284 8.00043 -0.193701 10.0111 0.192152 11.9509C0.578004 13.8907 1.53041 15.6725 2.92894 17.0711C4.32746 18.4696 6.10929 19.422 8.0491 19.8079C9.98891 20.1937 11.9996 19.9957 13.8268 19.2388C15.6541 18.4819 17.2159 17.2002 18.3147 15.5557C19.4135 13.9112 20 11.9778 20 10C20 8.68678 19.7413 7.38642 19.2388 6.17317C18.7363 4.95991 17.9997 3.85752 17.0711 2.92893C16.1425 2.00035 15.0401 1.26375 13.8268 0.761205C12.6136 0.258658 11.3132 0 10 0ZM10 18C8.41775 18 6.87104 17.5308 5.55544 16.6518C4.23985 15.7727 3.21447 14.5233 2.60897 13.0615C2.00347 11.5997 1.84504 9.99113 2.15372 8.43928C2.4624 6.88743 3.22433 5.46197 4.34315 4.34315C5.46197 3.22433 6.88743 2.4624 8.43928 2.15372C9.99113 1.84504 11.5997 2.00346 13.0615 2.60896C14.5233 3.21447 15.7727 4.23984 16.6518 5.55544C17.5308 6.87103 18 8.41775 18 10C18 12.1217 17.1572 14.1566 15.6569 15.6569C14.1566 17.1571 12.1217 18 10 18Z"
                    fill="#435334"
                  />
                </svg>
              </button>
            </Popover>
            <button
              onClick={(e) => {
                e.preventDefault();
                ref.current?.click();
              }}
              className="p-1 rounded-md hover:bg-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M10.0916 12.825L6.85828 16.0583C6.46681 16.4361 5.94399 16.6473 5.39995 16.6473C4.8559 16.6473 4.33308 16.4361 3.94161 16.0583C3.74962 15.8671 3.59727 15.6398 3.49332 15.3896C3.38937 15.1393 3.33586 14.871 3.33586 14.6C3.33586 14.329 3.38937 14.0607 3.49332 13.8104C3.59727 13.5602 3.74962 13.3329 3.94161 13.1417L7.17494 9.90833C7.33186 9.75141 7.42002 9.53858 7.42002 9.31666C7.42002 9.09475 7.33186 8.88192 7.17494 8.725C7.01802 8.56808 6.8052 8.47992 6.58328 8.47992C6.36136 8.47992 6.14853 8.56808 5.99161 8.725L2.75828 11.9667C2.10691 12.6757 1.75463 13.6089 1.77501 14.5715C1.79539 15.534 2.18685 16.4515 2.86764 17.1323C3.54843 17.8131 4.46591 18.2046 5.42848 18.2249C6.39105 18.2453 7.32428 17.893 8.03328 17.2417L11.2749 14.0083C11.4319 13.8514 11.52 13.6386 11.52 13.4167C11.52 13.1947 11.4319 12.9819 11.2749 12.825C11.118 12.6681 10.9052 12.5799 10.6833 12.5799C10.4614 12.5799 10.2485 12.6681 10.0916 12.825ZM17.2416 2.75833C16.5406 2.06167 15.5924 1.67065 14.6041 1.67065C13.6158 1.67065 12.6676 2.06167 11.9666 2.75833L8.72495 5.99166C8.64725 6.06936 8.58561 6.1616 8.54356 6.26312C8.50151 6.36464 8.47987 6.47345 8.47987 6.58333C8.47987 6.69321 8.50151 6.80202 8.54356 6.90354C8.58561 7.00506 8.64725 7.0973 8.72495 7.175C8.80264 7.2527 8.89489 7.31433 8.9964 7.35638C9.09792 7.39843 9.20673 7.42007 9.31661 7.42007C9.4265 7.42007 9.5353 7.39843 9.63682 7.35638C9.73834 7.31433 9.83058 7.2527 9.90828 7.175L13.1416 3.94166C13.5331 3.56385 14.0559 3.35271 14.5999 3.35271C15.144 3.35271 15.6668 3.56385 16.0583 3.94166C16.2503 4.1329 16.4026 4.36017 16.5066 4.61043C16.6105 4.86069 16.664 5.12901 16.664 5.4C16.664 5.67099 16.6105 5.93931 16.5066 6.18957C16.4026 6.43982 16.2503 6.66709 16.0583 6.85833L12.8249 10.0917C12.7468 10.1691 12.6848 10.2613 12.6425 10.3629C12.6002 10.4644 12.5784 10.5733 12.5784 10.6833C12.5784 10.7933 12.6002 10.9023 12.6425 11.0038C12.6848 11.1054 12.7468 11.1975 12.8249 11.275C12.9024 11.3531 12.9946 11.4151 13.0961 11.4574C13.1977 11.4997 13.3066 11.5215 13.4166 11.5215C13.5266 11.5215 13.6355 11.4997 13.7371 11.4574C13.8386 11.4151 13.9308 11.3531 14.0083 11.275L17.2416 8.03333C17.9383 7.33231 18.3293 6.38414 18.3293 5.39583C18.3293 4.40752 17.9383 3.45935 17.2416 2.75833ZM7.35828 12.6417C7.43614 12.7189 7.52849 12.78 7.63002 12.8215C7.73155 12.8629 7.84027 12.884 7.94994 12.8833C8.05962 12.884 8.16834 12.8629 8.26987 12.8215C8.3714 12.78 8.46375 12.7189 8.54161 12.6417L12.6416 8.54166C12.7985 8.38474 12.8867 8.17192 12.8867 7.95C12.8867 7.72808 12.7985 7.51525 12.6416 7.35833C12.4847 7.20141 12.2719 7.11325 12.0499 7.11325C11.828 7.11325 11.6152 7.20141 11.4583 7.35833L7.35828 11.4583C7.28017 11.5358 7.21818 11.628 7.17587 11.7295C7.13356 11.8311 7.11178 11.94 7.11178 12.05C7.11178 12.16 7.13356 12.2689 7.17587 12.3705C7.21818 12.472 7.28017 12.5642 7.35828 12.6417Z"
                  fill="#435334"
                />
              </svg>
            </button>
          </>
        ) : (
          <VoidRecorder
            messageApi={messageApi}
            onCancel={() => setVoiceRecorderMode(false)}
            setAudioFile={(file?: File) => setAudioFile(file)}
          />
        )}
        <button
          type="submit"
          className="flex justify-center items-center min-h-[32px] gap-2 py-1 px-2 rounded-lg text-white bg-main hover:bg-transparent active:scale-90 duration-100"
        >
          {voiceRecorderMode ? "" : "Send"}
          {loadingFile ? (
            <Spinner className="w-[18px] h-[18px] mr-2 text-gray-200 animate-spin fill-main" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="18"
              viewBox="0 0 21 18"
              fill="none"
            >
              <path
                d="M18.1934 6.00798L4.19345 0.227983C3.66372 0.00876957 3.08228 -0.0540727 2.51795 0.0468957C1.95362 0.147864 1.43004 0.408415 1.00919 0.797703C0.588336 1.18699 0.287838 1.68871 0.143269 2.24348C-0.00130066 2.79824 0.0161127 3.38281 0.193447 3.92798L1.73345 8.77798L0.153447 13.628C-0.0286814 14.1753 -0.0491403 14.7636 0.0945214 15.3223C0.238183 15.881 0.539873 16.3864 0.963447 16.778C1.50809 17.283 2.22073 17.5681 2.96345 17.578C3.35818 17.5777 3.74898 17.4996 4.11345 17.348L18.1634 11.568C18.7106 11.3404 19.1782 10.9559 19.507 10.4629C19.8359 9.96994 20.0114 9.3906 20.0114 8.79798C20.0114 8.20537 19.8359 7.62603 19.507 7.13305C19.1782 6.64007 18.7106 6.25555 18.1634 6.02798L18.1934 6.00798ZM3.38345 15.478C3.20705 15.5507 3.01351 15.5715 2.82569 15.5379C2.63786 15.5042 2.46359 15.4175 2.32345 15.288C2.19143 15.1618 2.09648 15.0019 2.04888 14.8257C2.00129 14.6494 2.00287 14.4634 2.05345 14.288L3.51345 9.77798H17.2434L3.38345 15.478ZM3.51345 7.77798L2.02345 3.30798C1.97286 3.13253 1.97129 2.94658 2.01888 2.7703C2.06648 2.59402 2.16143 2.43413 2.29345 2.30798C2.38755 2.20926 2.50086 2.13083 2.6264 2.07752C2.75194 2.02421 2.88706 1.99714 3.02345 1.99798C3.15749 1.99824 3.29012 2.02545 3.41345 2.07798L17.2434 7.77798H3.51345Z"
                fill="white"
              />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default TextInput;
