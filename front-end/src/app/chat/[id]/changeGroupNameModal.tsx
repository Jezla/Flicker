import { User } from "@/redux/slices/user";
import { RootState } from "@/redux/store";
import { Button, ConfigProvider, Form, Input, Modal } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useContext, useState } from "react";
import { connect } from "react-redux";
import { ClientContext } from "../layout";
import { Conversation } from "@/redux/slices/chat";

type Props = {
  user: User;
  conversation: Conversation;
  open: boolean;
  onCancel: () => void;
};

type FieldType = {
  name: string;
};

const changeGroupNameModal = ({ user, conversation, open, onCancel }: Props) => {
  const client = useContext(ClientContext);
  const [form] = useForm<FieldType>();

  const onFinish = async (values: FieldType) => {
    if (client && client.connected) {
      client.publish({
        destination: `/app/update/rename/${conversation.id}/${user.id}`,
        body: JSON.stringify({
          conversationName: values.name,
        }),
      });
      onCancel();
      form.resetFields();
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
        <div className="text-2xl pb-8 text-center text-main">Change group name</div>
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
            label="Group name"
            name="name"
            rules={[{ required: true, max: 500, message: "Please input your group name" }]}
          >
            <Input
              placeholder="Type your group's name"
              defaultValue={conversation.conversationName}
            />
          </Form.Item>

          <Form.Item className="mt-8">
            <div className="flex justify-around">
              <Button htmlType="submit" type="primary">
                Edit
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

const mapState = ({ user }: RootState) => ({
  user: user,
});

export default connect(mapState)(changeGroupNameModal);
