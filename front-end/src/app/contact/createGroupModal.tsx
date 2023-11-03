import { User } from "@/redux/slices/user";
import { AppDispatch, RootState } from "@/redux/store";
import { createGroupChat } from "@/shared/APIs/conversationAPI";
import { AvatarWithoutStatus } from "@/shared/components/avatarWithoutStatus";
import { Empty } from "@/shared/components/empty";
import { Button, Checkbox, ConfigProvider, Form, Input, Modal } from "antd";
import { useForm } from "antd/es/form/Form";
import { MessageInstance } from "antd/es/message/interface";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { connect } from "react-redux";

type Props = {
  user: User;
  friends: User[];
  open: boolean;
  onCancel: () => void;
  messageApi: MessageInstance;
};

type FieldType = {
  name: string;
  userIds: number[];
};

const createGroupModal = ({ user, friends, open, onCancel, messageApi }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = useForm<FieldType>();

  const onFinish = async (values: FieldType) => {
    try {
      setLoading(true);
      const response = await createGroupChat(values.name, [user.id, ...values.userIds]);
      router.push(`/chat/${response.id}`);
    } catch (e: any) {
      messageApi.error(e.message);
    } finally {
      setLoading(false);
    }
  };

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
          form.resetFields();
        }}
        closable={false}
        footer={null}
        width={600}
      >
        <div className="text-2xl pb-8 text-center text-main">Create new group</div>
        <Form
          form={form}
          name="group"
          style={{ width: 100 + "%" }}
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          disabled={loading}
          requiredMark={false}
        >
          <Form.Item<FieldType>
            label="Group name"
            name="name"
            rules={[{ required: true, message: "Please input your group name" }]}
          >
            <Input placeholder="Type your group's name" />
          </Form.Item>
          <Form.Item<FieldType>
            name="userIds"
            label="Members"
            rules={[
              {
                required: true,
                min: 2,
                max: 100,
                type: "array",
                message: "Please choose at least two friends",
              },
            ]}
          >
            <Checkbox.Group className="w-full max-h-[30vh] overflow-auto flex-col flex-nowrap outline-1 outline outline-gray-200 rounded-md">
              {friends.length === 0 ? (
                <Empty text="You have no friend" />
              ) : (
                friends.map((f) => (
                  <Checkbox
                    key={f.id}
                    value={f.id}
                    className="w-full items-center p-2 hover:bg-gray-100 duration-500"
                  >
                    <div className="flex items-center gap-2">
                      <AvatarWithoutStatus
                        image={f.avatar}
                        userName={f.displayName}
                        className="rounded-full h-14 w-14"
                      />
                      {f.displayName}
                      <div className="bg-transparent rounded-lg px-2 text-text">{f.email}</div>
                    </div>
                  </Checkbox>
                ))
              )}
            </Checkbox.Group>
          </Form.Item>
          <Form.Item className="mt-8">
            <div className="flex justify-around">
              <Button htmlType="submit" type="primary" loading={loading}>
                Create
              </Button>
              <Button htmlType="reset" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

const mapState = ({ contact, user }: RootState) => ({
  user: user,
  friends: contact.friends,
});

export default connect(mapState)(createGroupModal);
