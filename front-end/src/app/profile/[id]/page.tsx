"use client";
import Image from "next/image";
import background from "../../../../public/profile-background.svg";
import chain from "../../../../public/link-chain.svg";
import cIcon from "../../../../public/connect-icon.svg";
import { AvatarWithoutStatus } from "@/shared/components/avatarWithoutStatus";
import { useEffect, useState } from "react";
import { User } from "@/redux/slices/user";
import { Loader } from "@/shared/components/loader";
import { Result, message } from "antd";
import { getFriendsStatus, getNumberOfFriend, getUserProfile } from "@/shared/APIs/userAPI";
import { Empty } from "@/shared/components/empty";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import { connect } from "react-redux";
import { sendRequest } from "@/shared/APIs/contactAPI";
import { Spinner } from "@/shared/components/spinner";

type Props = {
  params: { id: string };
  userId: number;
};

const page = ({ params, userId }: Props) => {
  const router = useRouter();
  const [data, setData] = useState<User>();
  const [numberOfFriend, setNumberOfFriend] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [status, setStatus] = useState<"PENDING" | "ACCEPTED" | "DECLINED" | "NOT_FRIEND" | "SELF">(
    "SELF"
  );
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = await getUserProfile(Number(params.id));
        const nof = await getNumberOfFriend(Number(params.id));
        if (Number(params.id) !== userId) {
          const s = await getFriendsStatus(Number(params.id));
          setStatus(s);
        }
        setData(user);
        setNumberOfFriend(nof);
      } catch (e: any) {
        messageApi.error(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleClickConnect = async () => {
    try {
      setLoadingSend(true);
      const response = await sendRequest(Number(params.id));
      setStatus(response.status);
    } catch (e: any) {
      messageApi.error(e.message);
    } finally {
      setLoadingSend(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-2 gap-2">
      {contextHolder}
      {loading ? (
        <Loader />
      ) : !data ? (
        <Result
          status="404"
          title="Profile not found"
          subTitle="Sorry, the Flicker you visited does not exist."
        />
      ) : (
        <>
          <div className="relative h-1/5 mb-[100px]">
            <Image
              src={data.cover ? data.cover : background}
              alt="background"
              className="w-full h-full object-cover rounded-2xl"
              width={2000}
              height={190}
              priority
            />
            <AvatarWithoutStatus
              image={data.avatar}
              userName={data.displayName}
              className="rounded-full border-4 border-white absolute -bottom-[100px] left-1/2 transform -translate-x-1/2 h-[200px] w-[200px]"
            />
            <div className="mt-2 relative">
              <div className="flex justify-between bg-[#F3FDE6] w-full h-[90px] p-2 rounded-lg max-w-xl absolute top-0 left-1/2 transform -translate-x-1/2 -z-10 shadow-[0_4px_4px_0_rgba(0,0,0,0.15)]">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="17"
                    viewBox="0 0 22 17"
                    fill="none"
                  >
                    <path
                      d="M11.3 8.72C11.8336 8.25813 12.2616 7.68688 12.5549 7.04502C12.8482 6.40316 13 5.70571 13 5C13 3.67392 12.4732 2.40215 11.5355 1.46447C10.5979 0.526784 9.32608 1.78911e-07 8 1.78911e-07C6.67392 1.78911e-07 5.40215 0.526784 4.46447 1.46447C3.52678 2.40215 3 3.67392 3 5C2.99999 5.70571 3.1518 6.40316 3.44513 7.04502C3.73845 7.68688 4.16642 8.25813 4.7 8.72C3.30014 9.35388 2.11247 10.3775 1.27898 11.6685C0.445495 12.9596 0.00147185 14.4633 0 16C0 16.2652 0.105357 16.5196 0.292893 16.7071C0.48043 16.8946 0.734784 17 1 17C1.26522 17 1.51957 16.8946 1.70711 16.7071C1.89464 16.5196 2 16.2652 2 16C2 14.4087 2.63214 12.8826 3.75736 11.7574C4.88258 10.6321 6.4087 10 8 10C9.5913 10 11.1174 10.6321 12.2426 11.7574C13.3679 12.8826 14 14.4087 14 16C14 16.2652 14.1054 16.5196 14.2929 16.7071C14.4804 16.8946 14.7348 17 15 17C15.2652 17 15.5196 16.8946 15.7071 16.7071C15.8946 16.5196 16 16.2652 16 16C15.9985 14.4633 15.5545 12.9596 14.721 11.6685C13.8875 10.3775 12.6999 9.35388 11.3 8.72ZM8 8C7.40666 8 6.82664 7.82405 6.33329 7.49441C5.83994 7.16476 5.45542 6.69623 5.22836 6.14805C5.0013 5.59987 4.94189 4.99667 5.05764 4.41473C5.1734 3.83279 5.45912 3.29824 5.87868 2.87868C6.29824 2.45912 6.83279 2.1734 7.41473 2.05764C7.99667 1.94189 8.59987 2.0013 9.14805 2.22836C9.69623 2.45542 10.1648 2.83994 10.4944 3.33329C10.8241 3.82664 11 4.40666 11 5C11 5.79565 10.6839 6.55871 10.1213 7.12132C9.55871 7.68393 8.79565 8 8 8ZM17.74 8.32C18.38 7.59933 18.798 6.70905 18.9438 5.75634C19.0896 4.80362 18.9569 3.82907 18.5618 2.95C18.1666 2.07093 17.5258 1.3248 16.7165 0.801423C15.9071 0.27805 14.9638 -0.0002576 14 1.78911e-07C13.7348 1.78911e-07 13.4804 0.105357 13.2929 0.292893C13.1054 0.48043 13 0.734784 13 1C13 1.26522 13.1054 1.51957 13.2929 1.70711C13.4804 1.89464 13.7348 2 14 2C14.7956 2 15.5587 2.31607 16.1213 2.87868C16.6839 3.44129 17 4.20435 17 5C16.9986 5.52524 16.8593 6.0409 16.5961 6.49542C16.3328 6.94994 15.9549 7.32738 15.5 7.59C15.3517 7.67552 15.2279 7.79766 15.1404 7.94474C15.0528 8.09182 15.0045 8.2589 15 8.43C14.9958 8.59976 15.0349 8.7678 15.1137 8.91826C15.1924 9.06872 15.3081 9.19665 15.45 9.29L15.84 9.55L15.97 9.62C17.1754 10.1917 18.1923 11.096 18.901 12.2263C19.6096 13.3566 19.9805 14.6659 19.97 16C19.97 16.2652 20.0754 16.5196 20.2629 16.7071C20.4504 16.8946 20.7048 17 20.97 17C21.2352 17 21.4896 16.8946 21.6771 16.7071C21.8646 16.5196 21.97 16.2652 21.97 16C21.9782 14.4654 21.5938 12.9543 20.8535 11.6101C20.1131 10.2659 19.0413 9.13331 17.74 8.32Z"
                      fill="#435334"
                    />
                  </svg>
                  <h1 className="font-normal text-xl text-text">{numberOfFriend} Connections</h1>
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="font-normal text-xl text-text">
                    Since {new Date(data.createdAt * 1000).getFullYear()}
                  </h1>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M22 9.67002C21.9368 9.48711 21.822 9.32645 21.6693 9.20753C21.5167 9.0886 21.3328 9.01652 21.14 9.00002L15.45 8.17002L12.9 3.00002C12.8181 2.83095 12.6903 2.68837 12.5311 2.5886C12.3719 2.48883 12.1878 2.43591 12 2.43591C11.8121 2.43591 11.6281 2.48883 11.4689 2.5886C11.3097 2.68837 11.1819 2.83095 11.1 3.00002L8.54999 8.16002L2.85999 9.00002C2.67492 9.02633 2.50092 9.10399 2.35774 9.22418C2.21457 9.34438 2.10795 9.5023 2.04999 9.68002C1.99694 9.8537 1.99218 10.0385 2.03622 10.2147C2.08026 10.3909 2.17145 10.5517 2.29999 10.68L6.42999 14.68L5.42999 20.36C5.39429 20.5475 5.41299 20.7413 5.48386 20.9185C5.55474 21.0957 5.67485 21.2489 5.82999 21.36C5.98121 21.4681 6.15957 21.5319 6.34504 21.5443C6.53051 21.5567 6.71576 21.5171 6.87999 21.43L12 18.76L17.1 21.44C17.2403 21.5192 17.3989 21.5606 17.56 21.56C17.7718 21.5608 17.9784 21.4942 18.15 21.37C18.3051 21.2589 18.4252 21.1057 18.4961 20.9285C18.567 20.7513 18.5857 20.5575 18.55 20.37L17.55 14.69L21.68 10.69C21.8244 10.5677 21.9311 10.4069 21.9877 10.2264C22.0444 10.0458 22.0486 9.8529 22 9.67002ZM15.85 13.67C15.7327 13.7835 15.645 13.9239 15.5944 14.079C15.5439 14.2341 15.5321 14.3993 15.56 14.56L16.28 18.75L12.52 16.75C12.3753 16.673 12.2139 16.6327 12.05 16.6327C11.8861 16.6327 11.7247 16.673 11.58 16.75L7.81999 18.75L8.53999 14.56C8.56793 14.3993 8.55611 14.2341 8.50556 14.079C8.45501 13.9239 8.36727 13.7835 8.24999 13.67L5.24999 10.67L9.45999 10.06C9.62199 10.0375 9.77599 9.97556 9.90849 9.87967C10.041 9.78379 10.148 9.65686 10.22 9.51002L12 5.70002L13.88 9.52002C13.952 9.66686 14.059 9.79379 14.1915 9.88968C14.324 9.98556 14.478 10.0475 14.64 10.07L18.85 10.68L15.85 13.67Z"
                      fill="#435334"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full p-4 border rounded-lg shadow-xl bg-white max-w-xl mx-auto">
            <div className="flex flex-col pb-8">
              <h1 className="font-normal text-2xl text-text pb-2">Name</h1>
              <p className="font-semibold text-2xl text-main ">{data.displayName}</p>
            </div>
            <div className="flex flex-col pb-8">
              <h1 className="font-normal text-2xl text-text pb-2">Email</h1>
              <p className="font-semibold text-2xl text-main ">{data.email}</p>
            </div>
            <div className="flex flex-col pb-8">
              <h1 className="font-normal text-2xl text-text pb-2">Phone</h1>
              <p className="font-semibold text-2xl text-main ">{data.phoneNumber}</p>
            </div>
            <div className="flex flex-col pb-8">
              <h1 className="font-normal text-2xl text-text pb-2">About</h1>
              <div className="font-semibold text-2xl text-main ">
                {data.about ? data.about : <p className="italic font-light">No description</p>}
              </div>
            </div>

            <div className="flex flex-row space-x-4">
              {status === "DECLINED" || status === "NOT_FRIEND" ? (
                <button
                  onClick={handleClickConnect}
                  className="flex flex-row space-x-1 justify-center items-center gap-2 grow bg-connect p-3 rounded-xl px-10 text-xl font-normal duration-500 hover:bg-transparent hover:text-main active:scale-90 "
                >
                  {loadingSend ? (
                    <Spinner />
                  ) : (
                    <>
                      <Image src={cIcon} alt="connect image" />
                      <p>Connect</p>
                    </>
                  )}
                </button>
              ) : status === "PENDING" ? (
                <button
                  onClick={() => router.push("/contact/friend-request")}
                  className="flex flex-row space-x-1 justify-center items-center gap-2 grow bg-connect p-3 rounded-xl px-10 text-xl font-normal duration-500 hover:bg-transparent hover:text-main active:scale-90"
                >
                  <svg
                    width="16"
                    height="20"
                    viewBox="0 0 16 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 10C0 10.2652 0.105357 10.5196 0.292893 10.7071C0.48043 10.8946 0.734784 11 1 11H8.59L6.29 13.29C6.19627 13.383 6.12188 13.4936 6.07111 13.6154C6.02034 13.7373 5.9942 13.868 5.9942 14C5.9942 14.132 6.02034 14.2627 6.07111 14.3846C6.12188 14.5064 6.19627 14.617 6.29 14.71C6.38296 14.8037 6.49356 14.8781 6.61542 14.9289C6.73728 14.9797 6.86799 15.0058 7 15.0058C7.13201 15.0058 7.26272 14.9797 7.38458 14.9289C7.50644 14.8781 7.61704 14.8037 7.71 14.71L11.71 10.71C11.801 10.6149 11.8724 10.5028 11.92 10.38C12.02 10.1365 12.02 9.86346 11.92 9.62C11.8724 9.49725 11.801 9.3851 11.71 9.29L7.71 5.29C7.61676 5.19676 7.50607 5.1228 7.38425 5.07234C7.26243 5.02188 7.13186 4.99591 7 4.99591C6.86814 4.99591 6.73757 5.02188 6.61575 5.07234C6.49393 5.1228 6.38324 5.19676 6.29 5.29C6.19676 5.38324 6.1228 5.49393 6.07234 5.61575C6.02188 5.73757 5.99591 5.86814 5.99591 6C5.99591 6.13186 6.02188 6.26243 6.07234 6.38425C6.1228 6.50607 6.19676 6.61676 6.29 6.71L8.59 9H1C0.734784 9 0.48043 9.10536 0.292893 9.29289C0.105357 9.48043 0 9.73478 0 10ZM13 0H3C2.20435 0 1.44129 0.316071 0.87868 0.87868C0.316071 1.44129 0 2.20435 0 3V6C0 6.26522 0.105357 6.51957 0.292893 6.70711C0.48043 6.89464 0.734784 7 1 7C1.26522 7 1.51957 6.89464 1.70711 6.70711C1.89464 6.51957 2 6.26522 2 6V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H13C13.2652 2 13.5196 2.10536 13.7071 2.29289C13.8946 2.48043 14 2.73478 14 3V17C14 17.2652 13.8946 17.5196 13.7071 17.7071C13.5196 17.8946 13.2652 18 13 18H3C2.73478 18 2.48043 17.8946 2.29289 17.7071C2.10536 17.5196 2 17.2652 2 17V14C2 13.7348 1.89464 13.4804 1.70711 13.2929C1.51957 13.1054 1.26522 13 1 13C0.734784 13 0.48043 13.1054 0.292893 13.2929C0.105357 13.4804 0 13.7348 0 14V17C0 17.7956 0.316071 18.5587 0.87868 19.1213C1.44129 19.6839 2.20435 20 3 20H13C13.7956 20 14.5587 19.6839 15.1213 19.1213C15.6839 18.5587 16 17.7956 16 17V3C16 2.20435 15.6839 1.44129 15.1213 0.87868C14.5587 0.316071 13.7956 0 13 0Z"
                      fill="black"
                    />
                  </svg>
                  <p>Wait for response</p>
                </button>
              ) : status === "ACCEPTED" ? (
                <button
                  disabled
                  className="flex flex-row space-x-1 justify-center items-center gap-2 grow bg-connect p-3 rounded-xl px-10 text-xl font-normal duration-500"
                >
                  <svg
                    width="16"
                    height="12"
                    viewBox="0 0 16 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.7099 1.20986C14.617 1.11613 14.5064 1.04174 14.3845 0.990969C14.2627 0.940201 14.132 0.914062 13.9999 0.914062C13.8679 0.914062 13.7372 0.940201 13.6154 0.990969C13.4935 1.04174 13.3829 1.11613 13.29 1.20986L5.83995 8.66986L2.70995 5.52986C2.61343 5.43662 2.49949 5.36331 2.37463 5.3141C2.24978 5.2649 2.11645 5.24077 1.98227 5.24309C1.84809 5.24541 1.71568 5.27414 1.5926 5.32763C1.46953 5.38113 1.35819 5.45834 1.26495 5.55486C1.17171 5.65138 1.0984 5.76532 1.04919 5.89018C0.999989 6.01503 0.975859 6.14836 0.97818 6.28254C0.980502 6.41672 1.00923 6.54913 1.06272 6.67221C1.11622 6.79529 1.19343 6.90662 1.28995 6.99986L5.12995 10.8399C5.22291 10.9336 5.33351 11.008 5.45537 11.0588C5.57723 11.1095 5.70794 11.1357 5.83995 11.1357C5.97196 11.1357 6.10267 11.1095 6.22453 11.0588C6.34639 11.008 6.45699 10.9336 6.54995 10.8399L14.7099 2.67986C14.8115 2.58622 14.8925 2.47257 14.9479 2.34607C15.0033 2.21957 15.0319 2.08296 15.0319 1.94486C15.0319 1.80676 15.0033 1.67015 14.9479 1.54365C14.8925 1.41715 14.8115 1.3035 14.7099 1.20986Z"
                      fill="black"
                    />
                  </svg>
                  <p>Friend</p>
                </button>
              ) : (
                <></>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`http://localhost:3000/profile/${data.id}`);
                  messageApi.success("Copied 🎉");
                }}
                className={`${
                  status === "SELF" ? "grow flex justify-center" : ""
                } bg-transparent p-3 rounded-xl px-10 text-white duration-500 hover:bg-gray-200 hover:text-main active:scale-90 disabled:bg-transparent`}
              >
                <Image src={chain} alt="link image" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const mapState = ({ user }: RootState) => ({
  userId: user.id,
});

export default connect(mapState)(page);
