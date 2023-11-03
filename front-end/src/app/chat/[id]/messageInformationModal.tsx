import { User } from "@/redux/slices/user";
import { AvatarWithoutStatus } from "@/shared/components/avatarWithoutStatus";
import { ConfigProvider, Modal } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Loader } from "@/shared/components/loader";
import { getUserUnSeenMessage, getUsersSeenMessage } from "@/shared/APIs/messageAPI";
import { CheckCircleOutlined, CheckCircleFilled } from "@ant-design/icons";
import { Message } from "@/redux/slices/chat";

type Props = {
  conversationId: number;
  message: Message;
  open: boolean;
  onCancel: () => void;
  messageApi: MessageInstance;
};

const messageInformationModal = ({
  conversationId,
  message,
  open,
  onCancel,
  messageApi,
}: Props) => {
  const [seenUser, setSeenUser] = useState<User[]>([]);
  const [unseenUser, setUnseenUser] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchInfo = async () => {
        try {
          setLoading(true);
          const seenUserResponse = await getUsersSeenMessage(conversationId, message.id);
          const unseenUserResponse = await getUserUnSeenMessage(conversationId, message.id);
          setSeenUser(seenUserResponse);
          setUnseenUser(unseenUserResponse);
        } catch (e: any) {
          messageApi.error(e.message);
        } finally {
          setLoading(false);
        }
      };

      fetchInfo();
    }
  }, [open]);

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
        {loading ? (
          <div className="min-h-[30vh] flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4 text-transparent text-xl">
              Sent
              <CheckCircleOutlined />
            </div>
            <div className="flex flex-col gap-2">
              {unseenUser.map((u) => (
                <div key={u.id} className="flex gap-2 items-center text-xl">
                  <AvatarWithoutStatus
                    image={u.avatar}
                    userName={u.displayName}
                    className="rounded-full h-16 w-16"
                  />
                  {u.displayName}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mb-4 text-transparent text-xl mt-4">
              Read
              <CheckCircleFilled />
            </div>
            <div className="flex flex-col gap-2">
              {seenUser.map((u) => (
                <div key={u.id} className="flex gap-2 items-center text-xl">
                  <AvatarWithoutStatus
                    image={u.avatar}
                    userName={u.displayName}
                    className="rounded-full h-16 w-16"
                  />
                  {u.displayName}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
};

export default connect()(messageInformationModal);
