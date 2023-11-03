import Image from "next/image";
import logo from "../../../public/logo-full.svg";
import largeImage from "../../../public/saly-12.svg";
import icon from "../../../public/vectoricon1.svg";
import Link from "next/link";

const Page = () => {
  return (
    <div className="h-full flex flex-col px-6 pb-6">
      <div className="flex justify-between items-center py-2">
        <Image src={logo} alt="logo" className="object-scale-down h-4/5 w-auto" />

        <div className="flex font-bold">
          <div className="flex mr-6">
            <Image src={icon} alt="icon" className="w-auto h-auto" />
            <button className="text-transparent ml-1">English</button>
          </div>
          <Link href="/login">
            <button className="bg-main p-5 rounded-xl px-10 text-white duration-500 hover:bg-transparent hover:text-main active:scale-90 disabled:bg-transparent">
              Login
            </button>
          </Link>
        </div>
      </div>

      <div className="flex flex-1 rounded-3xl rounded-br-[20rem] bg-gradient-to-br from-main to-white justify-between text-white font-bold">
        <div className="pt-20 flex-1">
          <div>
            <p className="text-6xl pl-20 pr-10">Connect, Chat, Thrive: Your World in Words.</p>
          </div>
          <div className="pt-8">
            <p className="text-xl pl-20 pr-10">
              Empowering Connections, Enriching Conversations: Our chat app brings people closer
              through seamless communication, fostering relationships and shared moments in a
              dynamic digital realm.
            </p>
          </div>
          <Link href="/signup">
            <button className="ml-20 mt-10 p-5 rounded-xl px-8 bg-white text-main duration-500 hover:bg-transparent hover:text-white active:scale-90 disabled:bg-transparent">
              Get Started
            </button>
          </Link>
        </div>

        <Image src={largeImage} alt="largeImage" className="object-scale-down" priority />
      </div>
    </div>
  );
};

export default Page;
