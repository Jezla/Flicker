import { User, setState } from "@/redux/slices/user";
import { AppDispatch, RootState } from "@/redux/store";
import { Modal } from "antd";
import Image from "next/image";
import React, { ChangeEvent, useRef, useState } from "react";
import { connect } from "react-redux";
import background from "../../../public/profile-background.svg";
import { AvatarWithoutStatus } from "@/shared/components/avatarWithoutStatus";
import {
  DeleteOutlined,
  UploadOutlined,
  LoadingOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { MessageInstance } from "antd/es/message/interface";
import { removeAvatar, removeCover, updateAvatar, updateCover } from "@/shared/APIs/userAPI";

type Props = {
  open: boolean;
  onCancel: () => void;
  user: User;
  messageApi: MessageInstance;
  dispatch: AppDispatch;
};

const updateCoverModal = ({ open, onCancel, user, messageApi, dispatch }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [newCover, setNewCover] = useState<File>();
  const [cover, setCover] = useState<string | null>(user.cover);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewCover(e.target.files[0]);
      setCover(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDelete = () => {
    if (inputRef && inputRef.current) inputRef.current.value = "";
    setNewCover(undefined);
    setCover(null);
  };

  const handleUpdateAvatar = async () => {
    try {
      if (newCover) {
        if (newCover.type === "image/jpeg" || newCover.type === "image/png") {
          if (newCover.size <= 20 * Math.pow(1024, 2)) {
            setLoading(true);
            const response = await updateCover(newCover);
            dispatch(setState(response));
            messageApi.success("Update cover successfully");
            setLoading(false);
            onCancel();
          } else {
            messageApi.error("Image size must be smaller than 20MB");
            return;
          }
        } else {
          messageApi.error("File must be image (jpg/png)");
          setNewCover(undefined);
          setCover(user.cover);
          onCancel();
          return;
        }
      } else {
        setLoading(true);
        const response = await removeCover();
        dispatch(setState(response));
        messageApi.success("Update avatar successfully");
        setLoading(false);
        onCancel();
      }
    } catch (err: any) {
      setLoading(false);
      messageApi.error("Fail to update cover: " + err.message);
    }
  };

  return (
    <Modal open={open} onCancel={onCancel} closable={false} footer={null} width={600}>
      <div className="relative mb-20">
        <Image
          src={cover ? cover : background}
          alt="background"
          width={2000}
          height={100}
          className="h-[100px] w-full object-cover rounded-xl"
          priority
        />
        <div className="absolute -bottom-16 left-20">
          <AvatarWithoutStatus
            image={user.avatar}
            userName={user.displayName}
            className="rounded-full border-4 border-white w-32 h-32"
          />
        </div>
      </div>
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
          <UploadOutlined className="mr-2 opacity-30" /> Upload cover
        </button>
        <button
          disabled={cover ? false : true}
          className={`${
            cover ? "opacity-100 hover:bg-[rgb(184,184,184)] hover:scale-105" : "opacity-30"
          } className="bg-[rgb(218,218,218)] rounded-xl p-2 text-xl text-[rgb(66,66,66)] duration-300 text-start font-bold`}
          onClick={handleDelete}
          style={{ backgroundColor: "red", color: "white" }}
        >
          <DeleteOutlined className="mr-2 " /> Delete cover
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

export default connect(mapState)(updateCoverModal);
