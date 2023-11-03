import React, { useMemo } from "react";
import { Dropdown, MenuProps } from "antd";
import { AppDispatch, RootState } from "@/redux/store";
import { Language } from "@/redux/slices/language";
import { AlignLeftOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { Conversation, File, Message, transcribeAsyncAction } from "@/redux/slices/chat";
import { MessageInstance } from "antd/es/message/interface";

type Props = {
  children: React.ReactNode;
  language: Language[];
  message: Message;
  audioFile: File;
  conversation: Conversation;
  messageApi: MessageInstance;
  disabled: boolean;
  dispatch: AppDispatch;
};

const audioContextMenu = ({ children, language, message, audioFile, conversation, messageApi, disabled, dispatch }: Props) => {
  const items: MenuProps["items"] = useMemo(() => {
    const custom = [{ name: "⭐️ Conversation language", code: "cl" }, ...language];
    return [
      {
        label: (
          <span>
            <AlignLeftOutlined /> Transcribe
          </span>
        ),
        key: "transcribe",
        children:
          custom.length > 1
            ? custom.map((l, i) => ({
                key: i - 1,
                label: i < 2 ? l.name : l.name + " (" + l.code + ")",
              }))
            : undefined,
      },
    ];
  }, [language]);

  const handleMenuClick: MenuProps["onClick"] = (info) => {
    if (Number(info.key) === -1) {
      dispatch(
        transcribeAsyncAction({
          messageApi,
          message,
          conversation,
          audioFile,
          name: "",
          code: "cl",
        })
      );
    } else {
      dispatch(
        transcribeAsyncAction({
          messageApi,
          message,
          conversation,
          audioFile,
          name: language[Number(info.key)].name,
          code: language[Number(info.key)].code,
        })
      );
    }
  };

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["contextMenu"]} disabled={disabled}>
      {children}
    </Dropdown>
  );
};

const mapState = ({ language }: RootState) => ({
  language: language,
});

export default connect(mapState)(audioContextMenu);
