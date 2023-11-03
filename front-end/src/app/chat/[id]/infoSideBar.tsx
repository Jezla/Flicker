import React, { useState } from "react";
import AvatarWithStatus from "@/shared/components/avatarWithStatus";
import FileItem from "./fileItem";
import ImageItem from "./imageItem";
import { User } from "@/redux/slices/user";
import { useRouter } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "@/shared/components/loader";
import { PictureOutlined, FileTextOutlined, CameraOutlined, EditOutlined } from "@ant-design/icons";
import { ConfigProvider, Tabs, TabsProps } from "antd";
import {
  Conversation,
  getConversationDocsAsyncAction,
  getConversationMediaAsyncAction,
} from "@/redux/slices/chat";
import { Empty } from "@/shared/components/empty";
import { MessageInstance } from "antd/es/message/interface";
import { connect } from "react-redux";
import { AppDispatch } from "@/redux/store";
import GroupMemberCollapse from "./groupMemberCollapse";
import { AvatarWithoutStatus } from "@/shared/components/avatarWithoutStatus";
import ChangeGroupNameModal from "./changeGroupNameModal";
import ChangeGroupAvatarModal from "./changeGroupAvatarModal";
import SearchMessageModal from "./searchMessageModal";

type Props = {
  showInfo: boolean;
  data: Conversation;
  friend?: User;
  messageApi: MessageInstance;
  dispatch: AppDispatch;
};

const infoSideBar = ({ showInfo, data, friend, messageApi, dispatch }: Props) => {
  const { media, document } = data;
  const router = useRouter();
  const [openUpdateAvatar, setOpenUpdateAvatar] = useState(false);
  const [openUpdateName, setOpenUpdateName] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  const loadMedia = () => {
    const page = Math.floor(media.mediaFiles.length / 20);
    dispatch(
      getConversationMediaAsyncAction({ messageApi, conversationId: data.id, page, size: 20 })
    );
  };

  const loadDocs = () => {
    const page = Math.floor(document.documentFiles.length / 20);
    dispatch(
      getConversationDocsAsyncAction({ messageApi, conversationId: data.id, page, size: 20 })
    );
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span>
          <PictureOutlined />
          Media
        </span>
      ),
      children: (
        <div className="overflow-auto h-full" id="tab1">
          <InfiniteScroll
            next={loadMedia}
            hasMore={media.hasMore}
            loader={
              <div className="p-6">
                <Loader />
              </div>
            }
            dataLength={media.mediaFiles.length}
            scrollableTarget="tab1"
            className="flex flex-wrap"
          >
            {media.mediaFiles.length > 0 ? (
              media.mediaFiles.map((m) => <ImageItem key={m.id} data={m} />)
            ) : (
              <div className="w-full">
                <Empty text="No media files" />
              </div>
            )}
          </InfiniteScroll>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <FileTextOutlined />
          Document
        </span>
      ),
      children: (
        <div className="overflow-auto h-full" id="tab2">
          <InfiniteScroll
            next={loadDocs}
            hasMore={document.hasMore}
            loader={
              <div className="p-6">
                <Loader />
              </div>
            }
            dataLength={document.documentFiles.length}
            scrollableTarget="tab2"
            className="flex flex-col gap-2"
          >
            {document.documentFiles.length > 0 ? (
              document.documentFiles.map((d) => <FileItem key={d.id} data={d} />)
            ) : (
              <div className="w-full">
                <Empty text="No document files" />
              </div>
            )}
          </InfiniteScroll>
        </div>
      ),
    },
  ];

  return (
    <div
      className={`flex flex-col basis-1/3 items-center bg-white gap-2 py-4 ${
        showInfo ? "" : "hidden"
      }`}
    >
      <SearchMessageModal
        open={openSearch}
        onCancel={() => setOpenSearch(false)}
        conversation={data}
        messageApi={messageApi}
      />
      <ChangeGroupNameModal
        open={openUpdateName}
        onCancel={() => setOpenUpdateName(false)}
        conversation={data}
      />
      <ChangeGroupAvatarModal
        open={openUpdateAvatar}
        onCancel={() => setOpenUpdateAvatar(false)}
        conversation={data}
        messageApi={messageApi}
      />
      {data.isGroup ? (
        <div className="relative">
          <AvatarWithoutStatus
            image={data.avatar}
            userName={data.conversationName}
            className="rounded-full border-2 border-white shadow-2xl h-32 w-32"
          />
          <div
            onClick={() => setOpenUpdateAvatar(true)}
            className="absolute top-0 left-0 bottom-0 right-0 bg-[rgba(0,0,0,0.5)] flex items-center duration-500 justify-center rounded-full border-4 border-white opacity-0 hover:opacity-100 cursor-pointer"
          >
            <CameraOutlined className="text-2xl text-white" />
          </div>
        </div>
      ) : friend ? (
        <AvatarWithStatus
          image={friend.avatar}
          userName={friend.displayName}
          active={friend.online}
        />
      ) : (
        <></>
      )}
      <h1 className="text-2xl font-semibold">
        {data.isGroup ? (
          <p>
            {data.conversationName}{" "}
            <button
              onClick={() => setOpenUpdateName(true)}
              className="hover:text-text duration-500 active:scale-50"
            >
              <EditOutlined />
            </button>
          </p>
        ) : (
          friend?.displayName
        )}
      </h1>
      {data.isGroup ? (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => setOpenSearch(true)}
              className="flex flex-col justify-center items-center text-text p-2 pb-1 rounded-md hover:bg-gray-100"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.7099 19.2904L16.9999 15.6104C18.44 13.8148 19.1374 11.5357 18.9487 9.24169C18.76 6.94769 17.6996 4.81318 15.9854 3.27704C14.2713 1.7409 12.0337 0.919903 9.73283 0.982863C7.43194 1.04582 5.24263 1.98795 3.61505 3.61553C1.98747 5.24311 1.04534 7.43243 0.982375 9.73332C0.919414 12.0342 1.74041 14.2718 3.27655 15.9859C4.81269 17.7001 6.94721 18.7605 9.2412 18.9492C11.5352 19.1379 13.8143 18.4405 15.6099 17.0004L19.2899 20.6804C19.3829 20.7741 19.4935 20.8485 19.6153 20.8993C19.7372 20.9501 19.8679 20.9762 19.9999 20.9762C20.1319 20.9762 20.2626 20.9501 20.3845 20.8993C20.5063 20.8485 20.6169 20.7741 20.7099 20.6804C20.8901 20.4939 20.9909 20.2447 20.9909 19.9854C20.9909 19.7261 20.8901 19.4769 20.7099 19.2904ZM9.9999 17.0004C8.61544 17.0004 7.26206 16.5899 6.11091 15.8207C4.95977 15.0515 4.06256 13.9583 3.53275 12.6792C3.00293 11.4001 2.86431 9.99263 3.13441 8.63476C3.4045 7.27689 4.07119 6.02961 5.05016 5.05065C6.02912 4.07168 7.27641 3.40499 8.63427 3.1349C9.99214 2.8648 11.3996 3.00342 12.6787 3.53324C13.9578 4.06305 15.051 4.96026 15.8202 6.1114C16.5894 7.26255 16.9999 8.61592 16.9999 10.0004C16.9999 11.8569 16.2624 13.6374 14.9497 14.9501C13.6369 16.2629 11.8564 17.0004 9.9999 17.0004Z"
                  fill="#435334"
                />
              </svg>
              Search
            </button>
          </div>
          <GroupMemberCollapse data={data} messageApi={messageApi} conversation={data} />
        </>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/profile/${friend?.id}`)}
            className="flex flex-col justify-center items-center text-text p-2 pb-1 rounded-md hover:bg-gray-100"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 0C8.06053 0.00368503 6.16393 0.571311 4.54128 1.63374C2.91862 2.69617 1.63994 4.20754 0.86099 5.98377C0.0820354 7.76 -0.163575 9.72442 0.154075 11.6378C0.471725 13.5511 1.33893 15.3308 2.65005 16.76C3.58647 17.775 4.72299 18.5851 5.98799 19.1392C7.25298 19.6933 8.61903 19.9793 10 19.9793C11.3811 19.9793 12.7471 19.6933 14.0121 19.1392C15.2771 18.5851 16.4136 17.775 17.35 16.76C18.6612 15.3308 19.5284 13.5511 19.846 11.6378C20.1637 9.72442 19.9181 7.76 19.1391 5.98377C18.3602 4.20754 17.0815 2.69617 15.4588 1.63374C13.8362 0.571311 11.9396 0.00368503 10 0ZM10 18C7.92851 17.9969 5.93896 17.1903 4.45005 15.75C4.90209 14.6495 5.67108 13.7083 6.6593 13.0459C7.64752 12.3835 8.81036 12.0298 10 12.0298C11.1897 12.0298 12.3526 12.3835 13.3408 13.0459C14.329 13.7083 15.098 14.6495 15.55 15.75C14.0611 17.1903 12.0716 17.9969 10 18ZM8.00005 8C8.00005 7.60444 8.11735 7.21776 8.33711 6.88886C8.55687 6.55996 8.86923 6.30362 9.23468 6.15224C9.60013 6.00087 10.0023 5.96126 10.3902 6.03843C10.7782 6.1156 11.1346 6.30608 11.4143 6.58579C11.694 6.86549 11.8844 7.22186 11.9616 7.60982C12.0388 7.99778 11.9992 8.39991 11.8478 8.76537C11.6964 9.13082 11.4401 9.44318 11.1112 9.66294C10.7823 9.8827 10.3956 10 10 10C9.46962 10 8.96091 9.78929 8.58584 9.41421C8.21076 9.03914 8.00005 8.53043 8.00005 8ZM16.91 14C16.0166 12.4718 14.6415 11.283 13 10.62C13.5092 10.0427 13.841 9.33066 13.9555 8.56944C14.0701 7.80822 13.9625 7.03011 13.6458 6.3285C13.3291 5.62688 12.8166 5.03156 12.17 4.61397C11.5233 4.19637 10.7698 3.97425 10 3.97425C9.23026 3.97425 8.47682 4.19637 7.83014 4.61397C7.18346 5.03156 6.67102 5.62688 6.3543 6.3285C6.03758 7.03011 5.93004 7.80822 6.04458 8.56944C6.15912 9.33066 6.49088 10.0427 7.00005 10.62C5.35865 11.283 3.98352 12.4718 3.09005 14C2.37799 12.7871 2.00177 11.4065 2.00005 10C2.00005 7.87827 2.8429 5.84344 4.34319 4.34315C5.84349 2.84285 7.87832 2 10 2C12.1218 2 14.1566 2.84285 15.6569 4.34315C17.1572 5.84344 18 7.87827 18 10C17.9983 11.4065 17.6221 12.7871 16.91 14Z"
                fill="#435334"
              />
            </svg>
            Profile
          </button>
          <button
            onClick={() => setOpenSearch(true)}
            className="flex flex-col justify-center items-center text-text p-2 pb-1 rounded-md hover:bg-gray-100"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 21 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.7099 19.2904L16.9999 15.6104C18.44 13.8148 19.1374 11.5357 18.9487 9.24169C18.76 6.94769 17.6996 4.81318 15.9854 3.27704C14.2713 1.7409 12.0337 0.919903 9.73283 0.982863C7.43194 1.04582 5.24263 1.98795 3.61505 3.61553C1.98747 5.24311 1.04534 7.43243 0.982375 9.73332C0.919414 12.0342 1.74041 14.2718 3.27655 15.9859C4.81269 17.7001 6.94721 18.7605 9.2412 18.9492C11.5352 19.1379 13.8143 18.4405 15.6099 17.0004L19.2899 20.6804C19.3829 20.7741 19.4935 20.8485 19.6153 20.8993C19.7372 20.9501 19.8679 20.9762 19.9999 20.9762C20.1319 20.9762 20.2626 20.9501 20.3845 20.8993C20.5063 20.8485 20.6169 20.7741 20.7099 20.6804C20.8901 20.4939 20.9909 20.2447 20.9909 19.9854C20.9909 19.7261 20.8901 19.4769 20.7099 19.2904ZM9.9999 17.0004C8.61544 17.0004 7.26206 16.5899 6.11091 15.8207C4.95977 15.0515 4.06256 13.9583 3.53275 12.6792C3.00293 11.4001 2.86431 9.99263 3.13441 8.63476C3.4045 7.27689 4.07119 6.02961 5.05016 5.05065C6.02912 4.07168 7.27641 3.40499 8.63427 3.1349C9.99214 2.8648 11.3996 3.00342 12.6787 3.53324C13.9578 4.06305 15.051 4.96026 15.8202 6.1114C16.5894 7.26255 16.9999 8.61592 16.9999 10.0004C16.9999 11.8569 16.2624 13.6374 14.9497 14.9501C13.6369 16.2629 11.8564 17.0004 9.9999 17.0004Z"
                fill="#435334"
              />
            </svg>
            Search
          </button>
        </div>
      )}
      <div className="flex-1 w-full p-2 h-10">
        <ConfigProvider
          theme={{
            components: {
              Tabs: {
                inkBarColor: "#CEDEBD",
                itemActiveColor: "#CEDEBD",
                itemHoverColor: "#435334",
                itemSelectedColor: "#CEDEBD",
              },
            },
          }}
        >
          <Tabs defaultActiveKey="1" centered size="large" items={items} className="h-full" />
        </ConfigProvider>
      </div>
    </div>
  );
};

export default connect()(infoSideBar);
