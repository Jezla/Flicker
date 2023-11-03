import { User } from "@/redux/slices/user";
import { AppDispatch, RootState } from "@/redux/store";
import { Modal } from "antd";
import React, { ChangeEvent, useContext, useRef, useState } from "react";
import { connect } from "react-redux";
import { AvatarWithoutStatus } from "@/shared/components/avatarWithoutStatus";
import {
  DeleteOutlined,
  UploadOutlined,
  LoadingOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { MessageInstance } from "antd/es/message/interface";
import { ClientContext } from "../layout";
import { Conversation } from "@/redux/slices/chat";
import { removeGroupAvatar, uploadGroupAvatar } from "@/shared/APIs/conversationAPI";

type Props = {
  open: boolean;
  onCancel: () => void;
  user: User;
  conversation: Conversation;
  messageApi: MessageInstance;
  dispatch: AppDispatch;
};

const changeGroupAvatarModal = ({ open, onCancel, user, messageApi, conversation }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const client = useContext(ClientContext);
  const [newAvatar, setNewAvatar] = useState<File>();
  const [avatar, setAvatar] = useState<string | null>(conversation.avatar);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatar(e.target.files[0]);
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDelete = () => {
    if (inputRef && inputRef.current) inputRef.current.value = "";
    setNewAvatar(undefined);
    setAvatar(null);
  };

  const handleUpdateAvatar = async () => {
    try {
      if (newAvatar) {
        if (newAvatar.type === "image/jpeg" || newAvatar.type === "image/png") {
          if (newAvatar.size <= 20 * Math.pow(1024, 2)) {
            setLoading(true);
            const response = await uploadGroupAvatar(conversation.id, newAvatar);
            if (client && client.connected) {
              client.publish({
                destination: `/app/send/${response.id}/${user.id}`,
                body: JSON.stringify({
                  content: `@${user.displayName} has changed the group avatar`,
                  messageType: "MESSAGE_TYPE_SYSTEM_TEXT",
                }),
              });
              messageApi.success("Update group avatar successfully");
            }
            setLoading(false);
            onCancel();
          } else {
            messageApi.error("Image size must be smaller than 20MB");
            return;
          }
        } else {
          messageApi.error("File must be image (jpg/png)");
          setNewAvatar(undefined);
          setAvatar(conversation.avatar);
          onCancel();
          return;
        }
      } else {
        setLoading(true);
        const response = await removeGroupAvatar(conversation.id);
        if (client && client.connected) {
          client.publish({
            destination: `/app/send/${response.id}/${user.id}`,
            body: JSON.stringify({
              content: `@${user.displayName} has deleted the group avatar`,
              messageType: "MESSAGE_TYPE_SYSTEM_TEXT",
            }),
          });
          messageApi.success("Update group avatar successfully");
        }
        setLoading(false);
        onCancel();
      }
    } catch (err: any) {
      setLoading(false);
      messageApi.error("Fail to update avatar: " + err.message);
    }
  };

  return (
    <Modal open={open} onCancel={onCancel} closable={false} footer={null} width={600}>
      <div className="text-2xl pb-8 text-center text-main">Change group avatar</div>
      <AvatarWithoutStatus
        image={avatar}
        userName={conversation.conversationName}
        className="rounded-full border-2 border-white shadow-2xl h-32 w-32 m-auto mb-8"
      />
      <div className="flex flex-col gap-2">
        <input
          type="file"
          hidden
          onChange={handleChangeImage}
          ref={inputRef}
          accept="image/png, image/jpeg"
        />
        <button
          className="bg-[rgb(218,218,218)] rounded-xl p-2 text-xl text-[rgb(66,66,66)] duration-300 hover:bg-[rgb(184,184,184)] hover:scale-105 text-start font-bold"
          onClick={() => inputRef.current?.click()}
        >
          <UploadOutlined className="mr-2 opacity-30" /> Upload avatar
        </button>
        <button
          disabled={avatar ? false : true}
          className={`${
            avatar ? "opacity-100 hover:bg-[rgb(184,184,184)] hover:scale-105" : "opacity-30"
          } className="bg-[rgb(218,218,218)] rounded-xl p-2 text-xl text-[rgb(66,66,66)] duration-300 text-start font-bold`}
          onClick={handleDelete}
          style={{ backgroundColor: "red", color: "white" }}
        >
          <DeleteOutlined className="mr-2 " /> Delete avatar
        </button>
      </div>
      <div className="flex justify-around items-center mt-8">
        <button
          onClick={handleUpdateAvatar}
          className="text-transparent px-2 py-3 bg-gray-100 rounded-xl font-bold hover:scale-105 duration-500"
        >
          {loading ? <LoadingOutlined /> : <CloudUploadOutlined />} Update
        </button>
        <button
          onClick={onCancel}
          className="text-red-300 bg-gray-100 rounded-xl font-bold hover:scale-105 duration-500 p-3"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

const mapState = ({ user }: RootState) => ({
  user: user,
});

export default connect(mapState)(changeGroupAvatarModal);
