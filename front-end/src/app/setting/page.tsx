"use client";
import Image from "next/image";
import background from "../../../public/profile-background.svg";
import React, { useEffect, useState } from "react";
import { AvatarWithoutStatus } from "@/shared/components/avatarWithoutStatus";
import { AppDispatch, RootState } from "@/redux/store";
import { connect } from "react-redux";
import { logoutAsyncAction } from "@/redux/slices/login";
import { useRouter } from "next/navigation";
import { Language } from "@/redux/slices/language";
import Link from "next/link";
import { Dropdown } from "@/shared/components/dropDown";
import {
  User,
  updateNotificationAsyncAction,
  updateProfileAsyncAction,
  updateStatusAsyncAction,
} from "@/redux/slices/user";
import {
  CameraOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { ConfigProvider, Skeleton, Switch, message } from "antd";
import UpdateAvatarModal from "./updateAvatarModal";
import UpdateCoverModal from "./updateCoverModal";

type Props = {
  languages: Language[];
  user: User;
  dispatch: AppDispatch;
};

const page = ({ languages, user, dispatch }: Props) => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [editDisplayName, setEditDisplayName] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [editPhoneNumber, setEditPhoneNumber] = useState(false);
  const [about, setAbout] = useState<string | null>(user.about);
  const [editAbout, setEditAbout] = useState(false);

  const [languageIndex, setLanguageIndex] = useState<number>(-1);

  const [openUpdateAvatar, setOpenUpdateAvatar] = useState(false);
  const [openUpdateCover, setOpenUpdateCover] = useState(false);

  useEffect(() => {
    if (user.language === null) setLanguageIndex(0);
    else setLanguageIndex(languages.findIndex((l) => l.code === user.language));
  }, [languages]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#CEDEBD",
        },
      }}
    >
      <div className="flex-1 flex flex-col p-2">
        {contextHolder}
        <UpdateAvatarModal
          open={openUpdateAvatar}
          onCancel={() => setOpenUpdateAvatar(false)}
          messageApi={messageApi}
        />
        <UpdateCoverModal
          open={openUpdateCover}
          onCancel={() => setOpenUpdateCover(false)}
          messageApi={messageApi}
        />
        <div className="h-1/5 relative mb-[100px]">
          <button
            onClick={() => setOpenUpdateCover(true)}
            className="absolute top-3 right-3 bg-[rgba(0,0,0,0.5)] w-10 h-10 rounded-xl duration-500 opacity-50 hover:opacity-100 active:scale-90"
          >
            <EditOutlined className="text-white" />
          </button>
          <Image
            src={user.cover ? user.cover : background}
            alt="background"
            width={2000}
            height={190}
            className="h-[190px] w-full object-cover rounded-2xl"
            priority
          />
          <div className="relative w-fit left-[400px] top-2 flex gap-4">
            <button
              onClick={() => router.push(`/profile/${user.id}`)}
              className="py-2 px-3 rounded-xl bg-transparent text-main duration-500 hover:scale-110 active:scale-90"
            >
              @{user.username}
            </button>
            <button
              onClick={() => router.push(`/profile/${user.id}`)}
              className="py-2 px-4 rounded-xl bg-transparent text-main duration-500 hover:scale-110 active:scale-90"
            >
              {user.email}
            </button>
          </div>
          <div className="absolute -bottom-[100px] left-48">
            <AvatarWithoutStatus
              image={user.avatar}
              userName={user.displayName}
              className="rounded-full border-4 border-white h-[200px] w-[200px]"
            />
            <div
              onClick={() => setOpenUpdateAvatar(true)}
              className="absolute top-0 left-0 bottom-0 right-0 bg-[rgba(0,0,0,0.5)] flex items-center duration-500 justify-center rounded-full border-4 border-white opacity-0 hover:opacity-100 cursor-pointer"
            >
              <CameraOutlined className="text-4xl text-white" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 flex-1">
          <div className="flex flex-col w-full p-4 bg-[#FBFBFB] basis-1/2 rounded-lg">
            <div className="flex flex-col justify-start pb-8">
              <label className="mb-2 text-text text-2xl font-normal">Your Name</label>
              <div className="flex gap-8">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!editDisplayName}
                  type="text"
                  id="small-input"
                  className="p-2 text-gray-900 border rounded-lg text-2xl font-semibold flex-1"
                />
                {editDisplayName ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (displayName === "") message.warning("Your name should not be empty");
                        else if (displayName.length > 20)
                          message.warning("Your name should not be over 20 characters");
                        else {
                          setEditDisplayName(false);
                          dispatch(
                            updateProfileAsyncAction({
                              messageApi,
                              displayName,
                              phoneNumber,
                              about,
                              language:
                                languageIndex > -1 ? languages[languageIndex].code : user.language,
                            })
                          );
                        }
                      }}
                      className="bg-green-300 px-3 rounded-xl flex items-center justify-center duration-500 hover:opacity-50 active:scale-90"
                    >
                      <CheckCircleOutlined className="text-green-800 text-2xl" />
                    </button>
                    <button
                      onClick={() => {
                        setEditDisplayName(false);
                        setDisplayName(user.displayName);
                      }}
                      className="bg-red-300 px-3 rounded-xl flex items-center justify-center duration-500 hover:opacity-50 active:scale-90"
                    >
                      <CloseCircleOutlined className="text-red-800 text-2xl" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditDisplayName(true)}
                    className="bg-transparent text-2xl px-7 font-bold rounded-xl duration-500 hover:bg-gray-200 hover:text-main active:scale-90 disabled:bg-transparent"
                  >
                    <p>Edit</p>
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-start pb-8">
              <label className="mb-2 text-text text-2xl font-normal">Phone</label>
              <div className="flex gap-8">
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={!editPhoneNumber}
                  type="text"
                  id="small-input"
                  className="p-2 text-gray-900 border rounded-lg text-2xl font-semibold flex-1"
                />
                {editPhoneNumber ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (phoneNumber === "") message.warning("Phone number should not be empty");
                        else if (phoneNumber.length > 15)
                          message.warning("Your name should not be over 15 characters");
                        else if (
                          !phoneNumber.match(
                            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/g
                          )
                        ) {
                          message.warning("Phone number is invalid");
                        } else {
                          setEditPhoneNumber(false);
                          dispatch(
                            updateProfileAsyncAction({
                              messageApi,
                              displayName,
                              phoneNumber,
                              about,
                              language:
                                languageIndex > -1 ? languages[languageIndex].code : user.language,
                            })
                          );
                        }
                      }}
                      className="bg-green-300 px-3 rounded-xl flex items-center justify-center duration-500 hover:opacity-50 active:scale-90"
                    >
                      <CheckCircleOutlined className="text-green-800 text-2xl" />
                    </button>
                    <button
                      onClick={() => {
                        setEditPhoneNumber(false);
                        setPhoneNumber(user.phoneNumber);
                      }}
                      className="bg-red-300 px-3 rounded-xl flex items-center justify-center duration-500 hover:opacity-50 active:scale-90"
                    >
                      <CloseCircleOutlined className="text-red-800 text-2xl" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditPhoneNumber(true)}
                    className="bg-transparent text-2xl px-7 font-bold rounded-xl duration-500 hover:bg-gray-200 hover:text-main active:scale-90 disabled:bg-transparent"
                  >
                    <p>Edit</p>
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-start">
              <label className="mb-2 text-text text-2xl font-normal">About</label>
              <div className="flex gap-8 flex-1 items-center">
                <textarea
                  value={about ? about : ""}
                  onChange={(e) => setAbout(e.target.value)}
                  disabled={!editAbout}
                  id="small-input"
                  className="flex-1 p-2 text-gray-900 border rounded-lg text-2xl font-semibold h-full"
                  style={{ resize: "none" }}
                />
                {editAbout ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (phoneNumber === "") message.warning("Phone number should not be empty");
                        else if (phoneNumber.length > 15)
                          message.warning("Your name should not be over 15 characters");
                        else if (
                          !phoneNumber.match(
                            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/g
                          )
                        ) {
                          message.warning("Phone number is invalid");
                        } else {
                          setEditAbout(false);
                          dispatch(
                            updateProfileAsyncAction({
                              messageApi,
                              displayName,
                              phoneNumber,
                              about,
                              language:
                                languageIndex > -1 ? languages[languageIndex].code : user.language,
                            })
                          );
                        }
                      }}
                      className="bg-green-300 px-3 py-3 rounded-xl flex items-center justify-center duration-500 hover:opacity-50 active:scale-90"
                    >
                      <CheckCircleOutlined className="text-green-800 text-2xl" />
                    </button>
                    <button
                      onClick={() => {
                        setEditAbout(false);
                        setAbout(user.about);
                      }}
                      className="bg-red-300 px-3 py-3 rounded-xl flex items-center justify-center duration-500 hover:opacity-50 active:scale-90"
                    >
                      <CloseCircleOutlined className="text-red-800 text-2xl" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditAbout(true)}
                    className="bg-transparent text-2xl px-7 py-3 font-bold rounded-xl duration-500 hover:bg-gray-200 hover:text-main active:scale-90 disabled:bg-transparent"
                  >
                    <p>Edit</p>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col basis-1/2 bg-[#FBFBFB] p-4 rounded-lg justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between items-center">
                <div className="flex justify-center items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                  >
                    <path
                      d="M19.08 10.185L12.645 16.635L10.17 14.16C10.0355 14.003 9.87006 13.8754 9.68396 13.7854C9.49786 13.6954 9.29516 13.6448 9.08858 13.6368C8.88201 13.6288 8.67601 13.6636 8.48352 13.739C8.29103 13.8145 8.11621 13.9288 7.97003 14.075C7.82385 14.2212 7.70946 14.396 7.63405 14.5885C7.55864 14.781 7.52383 14.987 7.53181 15.1936C7.53979 15.4002 7.59038 15.6029 7.68042 15.789C7.77045 15.975 7.89798 16.1405 8.05501 16.275L11.58 19.815C11.7202 19.954 11.8864 20.064 12.0691 20.1386C12.2519 20.2133 12.4476 20.2511 12.645 20.25C13.0385 20.2483 13.4156 20.0921 13.695 19.815L21.195 12.315C21.3356 12.1756 21.4472 12.0097 21.5233 11.8269C21.5995 11.6441 21.6387 11.448 21.6387 11.25C21.6387 11.052 21.5995 10.8559 21.5233 10.6731C21.4472 10.4903 21.3356 10.3244 21.195 10.185C20.914 9.90562 20.5338 9.74881 20.1375 9.74881C19.7412 9.74881 19.361 9.90562 19.08 10.185ZM15 0C12.0333 0 9.13319 0.879734 6.66645 2.52796C4.19972 4.17618 2.27713 6.51885 1.14181 9.25974C0.00649926 12.0006 -0.290551 15.0166 0.288228 17.9263C0.867006 20.8361 2.29562 23.5088 4.3934 25.6066C6.49119 27.7044 9.16394 29.133 12.0737 29.7118C14.9834 30.2905 17.9994 29.9935 20.7403 28.8582C23.4811 27.7229 25.8238 25.8003 27.472 23.3335C29.1203 20.8668 30 17.9667 30 15C30 13.0302 29.612 11.0796 28.8582 9.25974C28.1044 7.43986 26.9995 5.78628 25.6066 4.3934C24.2137 3.00052 22.5601 1.89563 20.7403 1.14181C18.9204 0.387986 16.9698 0 15 0ZM15 27C12.6266 27 10.3066 26.2962 8.33316 24.9776C6.35977 23.659 4.8217 21.7849 3.91345 19.5922C3.0052 17.3995 2.76756 14.9867 3.23058 12.6589C3.69361 10.3311 4.83649 8.19295 6.51472 6.51472C8.19295 4.83649 10.3312 3.6936 12.6589 3.23058C14.9867 2.76755 17.3995 3.00519 19.5922 3.91344C21.7849 4.8217 23.6591 6.35977 24.9776 8.33315C26.2962 10.3065 27 12.6266 27 15C27 18.1826 25.7357 21.2348 23.4853 23.4853C21.2348 25.7357 18.1826 27 15 27Z"
                      fill="#435334"
                    />
                  </svg>
                  <p className="text-2xl font-normal">Active status</p>
                </div>
                <Switch
                  onChange={(checked) =>
                    dispatch(updateStatusAsyncAction({ messageApi, online: checked }))
                  }
                  className="bg-gray-200"
                  defaultChecked={user.online}
                  checkedChildren="Online"
                  unCheckedChildren="Offline"
                />
              </div>

              <div className="flex flex-row justify-between items-center">
                <div className="flex justify-center items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 35 35"
                    fill="none"
                  >
                    <path
                      d="M26.25 19.2208V14.5833C26.2479 12.517 25.5147 10.5181 24.1801 8.94067C22.8455 7.3632 20.9958 6.30892 18.9584 5.96454V4.37496C18.9584 3.98819 18.8047 3.61725 18.5312 3.34376C18.2577 3.07027 17.8868 2.91663 17.5 2.91663C17.1133 2.91663 16.7423 3.07027 16.4688 3.34376C16.1954 3.61725 16.0417 3.98819 16.0417 4.37496V5.96454C14.0043 6.30892 12.1546 7.3632 10.82 8.94067C9.4854 10.5181 8.75213 12.517 8.75004 14.5833V19.2208C7.89903 19.5217 7.16191 20.0784 6.63974 20.8147C6.11757 21.5509 5.83591 22.4307 5.83337 23.3333V26.25C5.83337 26.6367 5.98702 27.0077 6.26051 27.2812C6.534 27.5546 6.90493 27.7083 7.29171 27.7083H11.8709C12.2067 28.944 12.9398 30.0349 13.9572 30.8127C14.9745 31.5905 16.2195 32.0118 17.5 32.0118C18.7806 32.0118 20.0256 31.5905 21.0429 30.8127C22.0602 30.0349 22.7934 28.944 23.1292 27.7083H27.7084C28.0951 27.7083 28.4661 27.5546 28.7396 27.2812C29.0131 27.0077 29.1667 26.6367 29.1667 26.25V23.3333C29.1642 22.4307 28.8825 21.5509 28.3603 20.8147C27.8382 20.0784 27.101 19.5217 26.25 19.2208ZM11.6667 14.5833C11.6667 13.0362 12.2813 11.5525 13.3753 10.4585C14.4692 9.36454 15.9529 8.74996 17.5 8.74996C19.0471 8.74996 20.5309 9.36454 21.6248 10.4585C22.7188 11.5525 23.3334 13.0362 23.3334 14.5833V18.9583H11.6667V14.5833ZM17.5 29.1666C16.991 29.1636 16.4917 29.0273 16.0517 28.7715C15.6116 28.5157 15.2462 28.1491 14.9917 27.7083H20.0084C19.7539 28.1491 19.3885 28.5157 18.9484 28.7715C18.5084 29.0273 18.009 29.1636 17.5 29.1666ZM26.25 24.7916H8.75004V23.3333C8.75004 22.9465 8.90369 22.5756 9.17718 22.3021C9.45067 22.0286 9.8216 21.875 10.2084 21.875H24.7917C25.1785 21.875 25.5494 22.0286 25.8229 22.3021C26.0964 22.5756 26.25 22.9465 26.25 23.3333V24.7916Z"
                      fill="#525252"
                    />
                  </svg>
                  <p className="text-2xl font-normal"> Notification </p>
                </div>
                <Switch
                  onChange={(checked) => {
                    dispatch(updateNotificationAsyncAction({ messageApi, notification: checked }));
                  }}
                  className="bg-gray-200"
                  defaultChecked={user.notification ? true : false}
                  checkedChildren="On"
                  unCheckedChildren="Off"
                />
              </div>

              <div className="flex flex-row justify-between ">
                <div className="flex justify-center items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                  >
                    <path
                      d="M29.113 9.94525C29.113 9.94525 29.113 9.94525 29.113 9.87004C28.054 6.97593 26.1325 4.47723 23.6083 2.71195C21.0842 0.946669 18.0792 0 15 0C11.9208 0 8.91583 0.946669 6.39168 2.71195C3.86754 4.47723 1.946 6.97593 0.886995 9.87004C0.886995 9.87004 0.886995 9.87004 0.886995 9.94525C-0.295665 13.2111 -0.295665 16.7889 0.886995 20.0547C0.886995 20.0547 0.886995 20.0547 0.886995 20.13C1.946 23.0241 3.86754 25.5228 6.39168 27.288C8.91583 29.0533 11.9208 30 15 30C18.0792 30 21.0842 29.0533 23.6083 27.288C26.1325 25.5228 28.054 23.0241 29.113 20.13C29.113 20.13 29.113 20.13 29.113 20.0547C30.2957 16.7889 30.2957 13.2111 29.113 9.94525ZM3.33686 18.0088C2.81566 16.0368 2.81566 13.9632 3.33686 11.9912H6.1324C5.89197 13.9899 5.89197 16.0101 6.1324 18.0088H3.33686ZM4.5693 21.0176H6.67348C7.02626 22.3592 7.5305 23.6563 8.17646 24.8838C6.70248 23.8788 5.47033 22.5581 4.5693 21.0176ZM6.67348 8.98245H4.5693C5.45737 7.44659 6.67377 6.12631 8.13137 5.11617C7.50095 6.34562 7.01186 7.64267 6.67348 8.98245ZM13.467 26.5838C11.6209 25.2279 10.3244 23.2519 9.81471 21.0176H13.467V26.5838ZM13.467 18.0088H9.16843C8.88796 16.0127 8.88796 13.9873 9.16843 11.9912H13.467V18.0088ZM13.467 8.98245H9.81471C10.3244 6.74808 11.6209 4.77214 13.467 3.41621V8.98245ZM25.3706 8.98245H23.2664C22.9136 7.64077 22.4094 6.34366 21.7634 5.11617C23.2374 6.1212 24.4695 7.44186 25.3706 8.98245ZM16.4729 3.41621C18.3189 4.77214 19.6154 6.74808 20.1252 8.98245H16.4729V3.41621ZM16.4729 26.5838V21.0176H20.1252C19.6154 23.2519 18.3189 25.2279 16.4729 26.5838ZM20.7715 18.0088H16.4729V11.9912H20.7715C21.0519 13.9873 21.0519 16.0127 20.7715 18.0088ZM21.8085 24.8838C22.4545 23.6563 22.9587 22.3592 23.3115 21.0176H25.4157C24.5146 22.5581 23.2825 23.8788 21.8085 24.8838ZM26.603 18.0088H23.8075C23.9297 17.0106 23.9899 16.0057 23.9878 15C23.9895 13.9943 23.9293 12.9895 23.8075 11.9912H26.603C27.1242 13.9632 27.1242 16.0368 26.603 18.0088Z"
                      fill="#435334"
                    />
                  </svg>
                  <p className="text-2xl font-normal"> Primary Language </p>
                </div>
                {languages.length > 0 && languageIndex > -1 ? (
                  <Dropdown
                    value={languageIndex}
                    values={languages}
                    onChange={(value: number) => {
                      setLanguageIndex(value);
                      dispatch(
                        updateProfileAsyncAction({
                          messageApi,
                          displayName,
                          phoneNumber,
                          about,
                          language: value > 0 ? languages[value].code : null,
                        })
                      );
                    }}
                  />
                ) : (
                  <Skeleton.Button active />
                )}
              </div>

              <div className="flex">
                <div className="flex-1 w-full h-px bg-gray-400"></div>
              </div>

              <div className="flex flex-row justify-between">
                <div className="flex justify-center items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                  >
                    <path
                      d="M0.750565 10.3796L14.25 18.0312C14.478 18.1603 14.7367 18.2283 15 18.2283C15.2633 18.2283 15.522 18.1603 15.75 18.0312L29.2494 10.3796C29.4761 10.2512 29.6646 10.0669 29.7962 9.84487C29.9278 9.62287 29.9978 9.37096 29.9994 9.11417C30.0005 8.85488 29.9316 8.59993 29.7999 8.37512C29.6682 8.15032 29.4783 7.96364 29.2494 7.834L15.75 0.197138C15.522 0.0679907 15.2633 0 15 0C14.7367 0 14.478 0.0679907 14.25 0.197138L0.750565 7.834C0.521668 7.96364 0.331754 8.15032 0.200054 8.37512C0.0683547 8.59993 -0.000454266 8.85488 0.000595043 9.11417C0.00217504 9.37096 0.0722306 9.62287 0.203799 9.84487C0.335367 10.0669 0.523867 10.2512 0.750565 10.3796ZM15 3.22834L25.4996 9.11417L15 15L4.50042 9.11417L15 3.22834ZM27.7495 13.7787L15 20.8858L2.25051 13.7198C2.07931 13.6225 1.89019 13.5594 1.69403 13.5342C1.49787 13.5089 1.29855 13.5219 1.10755 13.5725C0.916543 13.6231 0.737633 13.7103 0.581118 13.829C0.424604 13.9477 0.293579 14.0957 0.195587 14.2643C3.64989e-05 14.6021 -0.0513609 15.0022 0.0526103 15.3771C0.156581 15.752 0.407481 16.0713 0.750565 16.2655L14.25 23.917C14.478 24.0462 14.7367 24.1142 15 24.1142C15.2633 24.1142 15.522 24.0462 15.75 23.917L29.2494 16.2655C29.5925 16.0713 29.8434 15.752 29.9474 15.3771C30.0514 15.0022 30 14.6021 29.8044 14.2643C29.7064 14.0957 29.5754 13.9477 29.4189 13.829C29.2624 13.7103 29.0835 13.6231 28.8925 13.5725C28.7015 13.5219 28.5021 13.5089 28.306 13.5342C28.1098 13.5594 27.9207 13.6225 27.7495 13.7198V13.7787ZM27.7495 19.6645L15 26.7717L2.25051 19.6057C2.07931 19.5084 1.89019 19.4453 1.69403 19.42C1.49787 19.3947 1.29855 19.4077 1.10755 19.4583C0.916543 19.5089 0.737633 19.5961 0.581118 19.7148C0.424604 19.8336 0.293579 19.9815 0.195587 20.1501C3.64989e-05 20.488 -0.0513609 20.888 0.0526103 21.2629C0.156581 21.6378 0.407481 21.9572 0.750565 22.1513L14.25 29.8029C14.478 29.932 14.7367 30 15 30C15.2633 30 15.522 29.932 15.75 29.8029L29.2494 22.1513C29.5925 21.9572 29.8434 21.6378 29.9474 21.2629C30.0514 20.888 30 20.488 29.8044 20.1501C29.7064 19.9815 29.5754 19.8336 29.4189 19.7148C29.2624 19.5961 29.0835 19.5089 28.8925 19.4583C28.7015 19.4077 28.5021 19.3947 28.306 19.42C28.1098 19.4453 27.9207 19.5084 27.7495 19.6057V19.6645Z"
                      fill="#435334"
                    />
                  </svg>
                  <p className="text-2xl font-normal"> Export your data </p>
                </div>
                <button className="bg-main w-10 h-10 flex justify-center items-center rounded-md text-white duration-500 hover:bg-gray-200 hover:text-main active:scale-90 disabled:bg-transparent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M8.71 7.71002L11 5.41002V15C11 15.2652 11.1054 15.5196 11.2929 15.7071C11.4804 15.8947 11.7348 16 12 16C12.2652 16 12.5196 15.8947 12.7071 15.7071C12.8946 15.5196 13 15.2652 13 15V5.41002L15.29 7.71002C15.383 7.80375 15.4936 7.87814 15.6154 7.92891C15.7373 7.97968 15.868 8.00582 16 8.00582C16.132 8.00582 16.2627 7.97968 16.3846 7.92891C16.5064 7.87814 16.617 7.80375 16.71 7.71002C16.8037 7.61706 16.8781 7.50645 16.9289 7.3846C16.9797 7.26274 17.0058 7.13203 17.0058 7.00002C17.0058 6.86801 16.9797 6.7373 16.9289 6.61544C16.8781 6.49358 16.8037 6.38298 16.71 6.29002L12.71 2.29002C12.6149 2.19898 12.5028 2.12761 12.38 2.08002C12.1365 1.98 11.8635 1.98 11.62 2.08002C11.4972 2.12761 11.3851 2.19898 11.29 2.29002L7.29 6.29002C7.19676 6.38326 7.1228 6.49395 7.07234 6.61577C7.02188 6.73759 6.99591 6.86816 6.99591 7.00002C6.99591 7.13188 7.02188 7.26245 7.07234 7.38427C7.1228 7.50609 7.19676 7.61678 7.29 7.71002C7.38324 7.80326 7.49393 7.87722 7.61575 7.92768C7.73757 7.97814 7.86814 8.00411 8 8.00411C8.13186 8.00411 8.26243 7.97814 8.38425 7.92768C8.50607 7.87722 8.61676 7.80326 8.71 7.71002ZM21 14C20.7348 14 20.4804 14.1054 20.2929 14.2929C20.1054 14.4804 20 14.7348 20 15V19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8947 19.2652 20 19 20H5C4.73478 20 4.48043 19.8947 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V15C4 14.7348 3.89464 14.4804 3.70711 14.2929C3.51957 14.1054 3.26522 14 3 14C2.73478 14 2.48043 14.1054 2.29289 14.2929C2.10536 14.4804 2 14.7348 2 15V19C2 19.7957 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7957 22 19V15C22 14.7348 21.8946 14.4804 21.7071 14.2929C21.5196 14.1054 21.2652 14 21 14Z"
                      fill="#FBFBFB"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex flex-row justify-between">
                <div className="flex justify-center items-center gap-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                  >
                    <path
                      d="M26.865 20.265H20.07C19.6722 20.265 19.2906 20.423 19.0093 20.7043C18.728 20.9856 18.57 21.3672 18.57 21.765C18.57 22.1628 18.728 22.5444 19.0093 22.8257C19.2906 23.107 19.6722 23.265 20.07 23.265H23.67C22.0154 24.9941 19.8816 26.189 17.5427 26.6961C15.2039 27.2032 12.7668 26.9994 10.5447 26.1109C8.32252 25.2223 6.4168 23.6897 5.07239 21.7098C3.72797 19.7299 3.00626 17.3932 3 15C3 14.6022 2.84196 14.2206 2.56066 13.9393C2.27936 13.658 1.89782 13.5 1.5 13.5C1.10218 13.5 0.720644 13.658 0.43934 13.9393C0.158035 14.2206 0 14.6022 0 15C0.00792999 17.9292 0.873331 20.792 2.48941 23.235C4.10548 25.6781 6.4015 27.5945 9.09411 28.7478C11.7867 29.9011 14.7581 30.2408 17.6415 29.725C20.525 29.2091 23.1943 27.8603 25.32 25.845V28.5C25.32 28.8978 25.478 29.2794 25.7593 29.5607C26.0406 29.842 26.4222 30 26.82 30C27.2178 30 27.5994 29.842 27.8807 29.5607C28.162 29.2794 28.32 28.8978 28.32 28.5V21.75C28.3163 21.3625 28.1627 20.9914 27.8915 20.7145C27.6203 20.4377 27.2524 20.2766 26.865 20.265ZM15 0C11.1546 0.0109683 7.46024 1.49837 4.68 4.155V1.5C4.68 1.10218 4.52197 0.720644 4.24066 0.43934C3.95936 0.158035 3.57782 0 3.18 0C2.78218 0 2.40064 0.158035 2.11934 0.43934C1.83804 0.720644 1.68 1.10218 1.68 1.5V8.25C1.68 8.64782 1.83804 9.02936 2.11934 9.31066C2.40064 9.59196 2.78218 9.75 3.18 9.75H9.93C10.3278 9.75 10.7094 9.59196 10.9907 9.31066C11.272 9.02936 11.43 8.64782 11.43 8.25C11.43 7.85218 11.272 7.47064 10.9907 7.18934C10.7094 6.90804 10.3278 6.75 9.93 6.75H6.33C7.9837 5.02181 10.1161 3.82725 12.4536 3.31966C14.7911 2.81207 17.2269 3.01462 19.4484 3.90129C21.6699 4.78797 23.5758 6.31832 24.9213 8.29591C26.2669 10.2735 26.9908 12.6081 27 15C27 15.3978 27.158 15.7794 27.4393 16.0607C27.7206 16.342 28.1022 16.5 28.5 16.5C28.8978 16.5 29.2794 16.342 29.5607 16.0607C29.842 15.7794 30 15.3978 30 15C30 13.0302 29.612 11.0796 28.8582 9.25975C28.1044 7.43986 26.9995 5.78628 25.6066 4.3934C24.2137 3.00052 22.5601 1.89563 20.7403 1.14181C18.9204 0.387987 16.9698 0 15 0Z"
                      fill="#435334"
                    />
                  </svg>
                  <p className="text-2xl font-normal"> Backup message on cloud </p>
                </div>
                <button className="bg-main w-10 h-10 flex justify-center items-center rounded-md  text-white duration-500 hover:bg-gray-200 hover:text-main active:scale-90 disabled:bg-transparent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M14.29 14.1899L11 17.4799L9.71 16.1899C9.61704 16.0962 9.50644 16.0218 9.38458 15.971C9.26272 15.9202 9.13201 15.8941 9 15.8941C8.86799 15.8941 8.73729 15.9202 8.61543 15.971C8.49357 16.0218 8.38297 16.0962 8.29 16.1899C8.10375 16.3773 7.99921 16.6307 7.99921 16.8949C7.99921 17.1591 8.10375 17.4125 8.29 17.5999L10.29 19.5999C10.383 19.6936 10.4936 19.768 10.6154 19.8188C10.7373 19.8696 10.868 19.8957 11 19.8957C11.132 19.8957 11.2627 19.8696 11.3846 19.8188C11.5064 19.768 11.617 19.6936 11.71 19.5999L15.71 15.5999C15.8963 15.4125 16.0008 15.1591 16.0008 14.8949C16.0008 14.6307 15.8963 14.3773 15.71 14.1899C15.617 14.0962 15.5064 14.0218 15.3846 13.971C15.2627 13.9202 15.132 13.8941 15 13.8941C14.868 13.8941 14.7373 13.9202 14.6154 13.971C14.4936 14.0218 14.383 14.0962 14.29 14.1899ZM18.42 8.3199C17.8083 6.91571 16.753 5.75089 15.4157 5.00405C14.0785 4.25721 12.5333 3.96957 11.0169 4.18522C9.5005 4.40087 8.0967 5.10792 7.02072 6.19796C5.94474 7.28799 5.25596 8.70085 5.06 10.2199C4.226 10.4268 3.4808 10.8968 2.93474 11.5603C2.38869 12.2238 2.07081 13.0455 2.02818 13.9037C1.98555 14.762 2.22043 15.6111 2.69804 16.3255C3.17565 17.0398 3.87061 17.5813 4.68 17.8699C4.80773 17.9369 4.94846 17.9755 5.09251 17.983C5.23656 17.9906 5.38054 17.9668 5.51456 17.9135C5.64857 17.8601 5.76946 17.7784 5.86892 17.6739C5.96839 17.5694 6.04407 17.4447 6.09078 17.3082C6.13749 17.1717 6.15412 17.0268 6.13953 16.8833C6.12494 16.7397 6.07947 16.6011 6.00625 16.4768C5.93303 16.3525 5.83379 16.2455 5.71533 16.1632C5.59688 16.0809 5.46202 16.0252 5.32 15.9999C4.93024 15.859 4.59387 15.6005 4.3574 15.2601C4.12093 14.9198 3.99604 14.5143 4 14.0999C4 13.5695 4.21072 13.0608 4.58579 12.6857C4.96086 12.3106 5.46957 12.0999 6 12.0999C6.26522 12.0999 6.51957 11.9945 6.70711 11.807C6.89465 11.6195 7 11.3651 7 11.0999C7.0049 9.91803 7.42829 8.7761 8.19507 7.87671C8.96185 6.97733 10.0224 6.37864 11.1887 6.18686C12.3549 5.99509 13.5513 6.22263 14.5657 6.82912C15.5801 7.43561 16.3469 8.38183 16.73 9.4999C16.7887 9.66987 16.8921 9.82089 17.0293 9.93704C17.1666 10.0532 17.3327 10.1302 17.51 10.1599C18.1761 10.2858 18.7799 10.6335 19.223 11.1464C19.6662 11.6594 19.9226 12.3073 19.9504 12.9845C19.9782 13.6618 19.7759 14.3286 19.3763 14.8761C18.9767 15.4237 18.4035 15.8198 17.75 15.9999C17.4848 16.033 17.2436 16.1702 17.0795 16.3812C16.9154 16.5922 16.8419 16.8597 16.875 17.1249C16.9082 17.3901 17.0453 17.6313 17.2563 17.7954C17.4673 17.9595 17.7348 18.033 18 17.9999H18.25C19.3024 17.7218 20.2353 17.1079 20.907 16.2514C21.5787 15.3948 21.9526 14.3425 21.9718 13.2542C21.9911 12.1658 21.6546 11.1009 21.0136 10.2212C20.3725 9.34149 19.4619 8.69499 18.42 8.3799V8.3199Z"
                      fill="#FBFBFB"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex">
                <div className="flex-1 w-full h-px bg-gray-400"></div>
              </div>

              <Link
                href="#"
                onClick={(e) => {
                  window.location.href =
                    "mailto:elec5619.group14@gmail.com?subject=Report a problem with Flicker&body=Write your problem here:";
                  e.preventDefault();
                }}
                className="gap-4 flex text-2xl font-semibold bg-[#F4F4F4F4] p-4 rounded-lg hover:opacity-50 active:scale-95 duration-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                >
                  <path
                    d="M14.9661 21.0306C14.6979 21.0306 14.4358 21.1183 14.2129 21.2826C13.99 21.4468 13.8162 21.6803 13.7136 21.9534C13.611 22.2266 13.5841 22.5271 13.6364 22.8171C13.6888 23.1071 13.8179 23.3735 14.0075 23.5825C14.1971 23.7916 14.4386 23.9339 14.7016 23.9916C14.9646 24.0493 15.2372 24.0197 15.4849 23.9066C15.7326 23.7934 15.9443 23.6018 16.0933 23.356C16.2423 23.1102 16.3218 22.8211 16.3218 22.5255C16.3218 22.129 16.1789 21.7488 15.9247 21.4685C15.6705 21.1881 15.3256 21.0306 14.9661 21.0306ZM29.4312 23.2281L18.518 2.30004C18.1652 1.60271 17.65 1.02187 17.0256 0.617526C16.4012 0.213183 15.6902 0 14.9661 0C14.2419 0 13.531 0.213183 12.9065 0.617526C12.2821 1.02187 11.7669 1.60271 11.4142 2.30004L0.568734 23.2281C0.203778 23.9068 0.00767438 24.6796 0.000220706 25.4686C-0.00723296 26.2576 0.174227 27.0348 0.526281 27.7217C0.878336 28.4086 1.38852 28.981 2.00533 29.3809C2.62214 29.7809 3.32373 29.9944 4.03928 29.9998H25.8929C26.6142 30.0076 27.3244 29.8038 27.9507 29.4092C28.577 29.0146 29.0968 28.4434 29.4569 27.7542C29.817 27.0651 30.0044 26.2827 29.9999 25.4873C29.9954 24.6919 29.7991 23.9122 29.4312 23.2281ZM27.0859 26.2178C26.967 26.4509 26.7937 26.6446 26.5838 26.7787C26.374 26.9128 26.1354 26.9824 25.8929 26.9802H4.03928C3.79676 26.9824 3.55815 26.9128 3.34831 26.7787C3.13848 26.6446 2.96511 26.4509 2.84628 26.2178C2.72729 25.9905 2.66465 25.7328 2.66465 25.4704C2.66465 25.208 2.72729 24.9502 2.84628 24.7229L13.6917 3.7949C13.8055 3.55004 13.9783 3.34454 14.1912 3.20105C14.4041 3.05756 14.6488 2.98163 14.8983 2.98163C15.1478 2.98163 15.3925 3.05756 15.6054 3.20105C15.8182 3.34454 15.9911 3.55004 16.1049 3.7949L27.0181 24.7229C27.1526 24.9469 27.2299 25.2067 27.2418 25.475C27.2537 25.7434 27.1999 26.0103 27.0859 26.2477V26.2178ZM14.9661 9.07175C14.6065 9.07175 14.2617 9.22924 14.0075 9.50958C13.7532 9.78992 13.6104 10.1701 13.6104 10.5666V16.546C13.6104 16.9425 13.7532 17.3227 14.0075 17.6031C14.2617 17.8834 14.6065 18.0409 14.9661 18.0409C15.3256 18.0409 15.6705 17.8834 15.9247 17.6031C16.1789 17.3227 16.3218 16.9425 16.3218 16.546V10.5666C16.3218 10.1701 16.1789 9.78992 15.9247 9.50958C15.6705 9.22924 15.3256 9.07175 14.9661 9.07175Z"
                    fill="#435334"
                  />
                </svg>{" "}
                Report a problem{" "}
              </Link>
            </div>

            <button
              onClick={() => {
                dispatch(logoutAsyncAction(router));
              }}
              className="flex justify-center bg-red-500 p-3 text-white rounded-xl text-2xl font-bold duration-500 hover:bg-red-700 hover:text-black active:scale-90 "
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

const mapState = ({ language, user }: RootState) => ({
  languages: language,
  user: user,
});

export default connect(mapState)(page);
