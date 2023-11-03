import React, { useContext, useMemo, useState } from "react";
import { Dropdown, MenuProps } from "antd";
import { AppDispatch, RootState } from "@/redux/store";
import { Language } from "@/redux/slices/language";
import { TranslationOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { Conversation, Message, translateAsyncAction } from "@/redux/slices/chat";
import { MessageInstance } from "antd/es/message/interface";
import { ClientContext } from "../layout";
import { User } from "@/redux/slices/user";
import MessageInformationModal from "./messageInformationModal";

type Props = {
  children: React.ReactNode;
  language: Language[];
  isSelfMessage: boolean;
  message: Message;
  user: User;
  conversation: Conversation;
  messageApi: MessageInstance;
  disabled: boolean;
  dispatch: AppDispatch;
};

const messageContextMenu = ({ children, language, isSelfMessage, message, user, conversation, messageApi, disabled, dispatch }: Props) => {
  const client = useContext(ClientContext);
  const [open, setOpen] = useState(false);

  const items: MenuProps["items"] = useMemo(() => {
    if (isSelfMessage) {
      return [
        {
          label: (
            <span>
              <InfoCircleOutlined /> Information
            </span>
          ),
          key: "info",
        },
        {
          label: (
            <span className="text-red-500">
              <DeleteOutlined /> Delete
            </span>
          ),
          key: "delete",
        },
      ];
    } else {
      return [
        {
          label: (
            <span>
              <InfoCircleOutlined /> Information
            </span>
          ),
          key: "info",
        },
        {
          label: (
            <span>
              <TranslationOutlined /> Translate
            </span>
          ),
          key: "translate",
          children: language.length > 0 ? language.filter((l, i) => i > 0).map((l, i) => ({ key: i + 1, label: l.name + " (" + l.code + ")" })) : undefined,
        },
      ];
    }
  }, [language, isSelfMessage]);

  const handleMenuClick: MenuProps["onClick"] = (info) => {
    if (info.key === "delete") {
      if (client && client.connected) {
        client.publish({
          destination: `/app/delete/${conversation.id}/${user.id}/${message.id}`,
        });
      }
    } else if (info.key === "info") {
      setOpen(true);
    } else {
      dispatch(
        translateAsyncAction({
          messageApi,
          conversationId: conversation.id,
          message,
          name: language[Number(info.key)].name,
          code: language[Number(info.key)].code,
        })
      );
    }
  };

  return (
    <>
      <MessageInformationModal open={open} onCancel={() => setOpen(false)} conversationId={conversation.id} message={message} messageApi={messageApi} />
      <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["contextMenu"]} disabled={disabled}>
        {children}
      </Dropdown>
    </>
  );
};

const mapState = ({ language, user }: RootState) => ({
  user: user,
  language: language,
});

export default connect(mapState)(messageContextMenu);
