import { User } from "@/redux/slices/user";
import { AppDispatch, RootState } from "@/redux/store";
import { AvatarWithoutStatus } from "@/shared/components/avatarWithoutStatus";
import { Button, Checkbox, ConfigProvider, Form, Input, Modal } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import React, { useContext, useEffect, useState } from "react";
import { connect } from "react-redux";
import { ClientContext } from "../layout";
import { getFriendsAsyncAction } from "@/redux/slices/contact";
import { Loader } from "@/shared/components/loader";
import { Empty } from "@/shared/components/empty";
import { Conversation } from "@/redux/slices/chat";
import { useForm } from "antd/es/form/Form";

type Props = {
  user: User;
  conversation: Conversation;
  friends: User[];
  loading: boolean;
  open: boolean;
  onCancel: () => void;
  messageApi: MessageInstance;
  dispatch: AppDispatch;
};

type FieldType = {
  userIds: number[];
};

const addNewMembersModal = ({
  user,
  conversation,
  friends,
  loading,
  open,
  onCancel,
  messageApi,
  dispatch,
}: Props) => {
  const client = useContext(ClientContext);
  const [form] = useForm<FieldType>();

  useEffect(() => {
    dispatch(getFriendsAsyncAction({ messageApi }));
  }, []);

  const onFinish = async (values: FieldType) => {
    if (client && client.connected) {
      client.publish({
        destination: `/app/update/${conversation.id}/users/add/${user.id}`,
        body: JSON.stringify({
          userIds: values.userIds,
        }),
      });
      onCancel();
      form.resetFields();
    }
  };

  friends = friends.filter((f) => !conversation.users.find((u) => u.id === f.id));

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
        <div className="text-2xl pb-8 text-center text-main">Add new members</div>
        <Form
          form={form}
          name="group"
          style={{ width: 100 + "%" }}
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item<FieldType>
            name="userIds"
            label="Members"
            rules={[
              {
                required: true,
                min: 1,
                max: 100,
                type: "array",
                message: "Please choose at least one friend",
              },
            ]}
          >
            <Checkbox.Group className="w-full max-h-[30vh] overflow-auto flex-col flex-nowrap outline-1 outline outline-gray-200 rounded-md">
              {loading ? (
                <Loader />
              ) : friends.length === 0 ? (
                <Empty text="You have no friends to add" />
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
              <Button htmlType="submit" type="primary">
                Add
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
  loading: contact.loadingFriend,
});

export default connect(mapState)(addNewMembersModal);
