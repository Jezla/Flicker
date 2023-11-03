"use client";
import React, { useEffect } from "react";
import SentRequestItem from "./sentRequestItem";
import ReceivedRequestItem from "./receivedRequestItem";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getRequestsAsyncAction, toggle } from "@/redux/slices/contact";
import { User } from "@/redux/slices/user";
import { message } from "antd";
import { Loader } from "@/shared/components/loader";
import { Empty } from "@/shared/components/empty";

type Props = {
  sentRequests: User[];
  receivedRequests: User[];
  loading: boolean;
  dispatch: AppDispatch;
};

const page = ({ sentRequests, receivedRequests, loading, dispatch }: Props) => {
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    dispatch(toggle({ frActive: true, fafActive: false }));
    dispatch(getRequestsAsyncAction({ messageApi }));
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col gap-4 p-4 px-8">
      {contextHolder}
      <h1 className="font-normal text-2xl text-text text-center">Sent requests</h1>
      {sentRequests.length > 0 ? (
        <div className="flex flex-col gap-4">
          {sentRequests.map((r) => (
            <SentRequestItem key={r.id} data={r} messageApi={messageApi} />
          ))}
        </div>
      ) : (
        <Empty text="No sent requests" />
      )}
      <h1 className="font-normal text-2xl text-text text-center">Received requests</h1>
      {receivedRequests.length > 0 ? (
        <div className="flex flex-col gap-4">
          {receivedRequests.map((r) => (
            <ReceivedRequestItem key={r.id} data={r} messageApi={messageApi} />
          ))}
        </div>
      ) : (
        <Empty text="No received requests" />
      )}
    </div>
  );
};

const mapState = ({ contact }: RootState) => ({
  sentRequests: contact.sentRequests,
  receivedRequests: contact.receivedRequests,
  loading: contact.loadingRequest,
});

export default connect(mapState)(page);
