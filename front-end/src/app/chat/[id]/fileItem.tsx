import { File } from "@/redux/slices/chat";
import { formatDate } from "@/shared/utils/dateFormat";
import React from "react";

type Props = {
  data: File;
};

const fileItem = ({ data }: Props) => {
  const onDownload = () => {
    fetch(data.url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.download = data.originalFileName;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
      });
  };

  return (
    <button
      onClick={onDownload}
      className="flex gap-2 items-center p-2 bg-transparent rounded-md hover:opacity-80 active:scale-90 duration-500"
    >
      <div className="flex items-center justify-center shadow-2xl rounded-full h-10 w-10 bg-main basis-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="26"
          viewBox="0 0 21 31"
          fill="none"
          className="h-full"
        >
          <path
            d="M6.5625 12.4H7.875C8.2231 12.4 8.55694 12.2367 8.80308 11.946C9.04922 11.6553 9.1875 11.2611 9.1875 10.85C9.1875 10.4389 9.04922 10.0447 8.80308 9.75398C8.55694 9.4633 8.2231 9.3 7.875 9.3H6.5625C6.2144 9.3 5.88056 9.4633 5.63442 9.75398C5.38828 10.0447 5.25 10.4389 5.25 10.85C5.25 11.2611 5.38828 11.6553 5.63442 11.946C5.88056 12.2367 6.2144 12.4 6.5625 12.4ZM6.5625 15.5C6.2144 15.5 5.88056 15.6633 5.63442 15.954C5.38828 16.2447 5.25 16.6389 5.25 17.05C5.25 17.4611 5.38828 17.8553 5.63442 18.146C5.88056 18.4367 6.2144 18.6 6.5625 18.6H14.4375C14.7856 18.6 15.1194 18.4367 15.3656 18.146C15.6117 17.8553 15.75 17.4611 15.75 17.05C15.75 16.6389 15.6117 16.2447 15.3656 15.954C15.1194 15.6633 14.7856 15.5 14.4375 15.5H6.5625ZM21 10.757C20.9863 10.6146 20.9599 10.4743 20.9213 10.3385V10.199C20.8581 10.0396 20.774 9.89313 20.6719 9.765L12.7969 0.465C12.6884 0.344435 12.5643 0.245026 12.4294 0.1705C12.3902 0.163928 12.3504 0.163928 12.3112 0.1705C12.1779 0.0801989 12.0307 0.0222335 11.8781 0H3.9375C2.89321 0 1.89169 0.489909 1.15327 1.36195C0.414843 2.234 0 3.41674 0 4.65V26.35C0 27.5833 0.414843 28.766 1.15327 29.638C1.89169 30.5101 2.89321 31 3.9375 31H17.0625C18.1068 31 19.1083 30.5101 19.8467 29.638C20.5852 28.766 21 27.5833 21 26.35V10.85C21 10.85 21 10.85 21 10.757ZM13.125 5.2855L16.5244 9.3H14.4375C14.0894 9.3 13.7556 9.1367 13.5094 8.84601C13.2633 8.55533 13.125 8.16109 13.125 7.75V5.2855ZM18.375 26.35C18.375 26.7611 18.2367 27.1553 17.9906 27.446C17.7444 27.7367 17.4106 27.9 17.0625 27.9H3.9375C3.5894 27.9 3.25556 27.7367 3.00942 27.446C2.76328 27.1553 2.625 26.7611 2.625 26.35V4.65C2.625 4.23891 2.76328 3.84467 3.00942 3.55398C3.25556 3.2633 3.5894 3.1 3.9375 3.1H10.5V7.75C10.5 8.98326 10.9148 10.166 11.6533 11.038C12.3917 11.9101 13.3932 12.4 14.4375 12.4H18.375V26.35ZM14.4375 21.7H6.5625C6.2144 21.7 5.88056 21.8633 5.63442 22.154C5.38828 22.4447 5.25 22.8389 5.25 23.25C5.25 23.6611 5.38828 24.0553 5.63442 24.346C5.88056 24.6367 6.2144 24.8 6.5625 24.8H14.4375C14.7856 24.8 15.1194 24.6367 15.3656 24.346C15.6117 24.0553 15.75 23.6611 15.75 23.25C15.75 22.8389 15.6117 22.4447 15.3656 22.154C15.1194 21.8633 14.7856 21.7 14.4375 21.7Z"
            fill="#CEDEBD"
          />
        </svg>
      </div>
      <div className="flex-1 flex flex-col items-start">
        <h1 className="text-base font-semibold truncate max-w-[17vw]">{data.originalFileName}</h1>
        <p className="text-xs font-light truncate max-w-[17vw]">
          {formatDate(new Date(data.createdAt * 1000), "dd MMM yyyy, HH:mm")}
        </p>
      </div>
    </button>
  );
};

export default fileItem;
