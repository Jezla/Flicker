import { File } from "@/redux/slices/chat";
import { Image, Space } from "antd";
import React from "react";
import styles from "./styles.module.css";
import {
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";

type Props = {
  data: File;
};

const imageItem = ({ data }: Props) => {
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
    <div className="p-1 rounded-xl w-1/3 ">
      <Image
        preview={{
          toolbarRender: (
            _,
            {
              transform: { scale },
              actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn },
            }
          ) => (
            <Space size={12} className={styles.toolbar}>
              <DownloadOutlined onClick={onDownload} className={styles.anticon} />
              <SwapOutlined rotate={90} onClick={onFlipY} className={styles.anticon} />
              <SwapOutlined onClick={onFlipX} className={styles.anticon} />
              <RotateLeftOutlined onClick={onRotateLeft} className={styles.anticon} />
              <RotateRightOutlined onClick={onRotateRight} />
              <ZoomOutOutlined
                disabled={scale === 1}
                onClick={onZoomOut}
                className={styles.anticon}
              />
              <ZoomInOutlined
                disabled={scale === 50}
                onClick={onZoomIn}
                className={styles.anticon}
              />
            </Space>
          ),
        }}
        src={data.url}
        alt={data.originalFileName}
        className="!object-cover rounded-xl aspect-square"
      />
    </div>
  );
};

export default imageItem;
