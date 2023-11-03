import { MessageInstance } from "antd/es/message/interface";
import React, { MouseEvent, useEffect, useRef, useState } from "react";

type Props = {
  messageApi: MessageInstance;
  onCancel: () => void;
  setAudioFile: (file?: File) => void;
};

let recorder: MediaRecorder;
let recordingChunks: BlobPart[] = [];
let timerTimeout: NodeJS.Timeout;
let streamG: MediaStream;

const voidRecorder = ({ messageApi, onCancel, setAudioFile }: Props) => {
  // const [stream, setStream] = useState<MediaStream>();

  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [playTimer, setPlayTimer] = useState(0);
  const [currentRecord, setCurrentRecord] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);

  const playingMinutes = Math.floor(playTimer / 60);
  const playingSeconds = playTimer % 60;
  const minutes = Math.floor(recordTimer / 60);
  const seconds = recordTimer % 60;

  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isRecording && recordTimer < 60) {
      timerTimeout = setTimeout(() => {
        setRecordTimer(recordTimer + 1);
      }, 1000);
    }
  }, [isRecording, recordTimer]);

  useEffect(() => {
    if (playTimer === recordTimer) {
      setIsPlaying(false);
      setPlayTimer(0);
    }
    if (isPlaying && playTimer < recordTimer) {
      timerTimeout = setTimeout(() => {
        setPlayTimer(playTimer + 1);
      }, 1000);
    }
  }, [isPlaying, playTimer]);

  const startRecording = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => {
          setIsRecording(true);
          streamG = stream;

          recorder = new MediaRecorder(stream);

          recorder.start();

          recorder.ondataavailable = (e) => {
            recordingChunks.push(e.data);
          };
        })
        .catch((error) => {
          messageApi.error(error);
        });
    }
  };

  const stopRecording = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    recorder.onstop = () => {
      const recordBlob = new Blob(recordingChunks, {
        type: "audio/ogg; codecs=opus",
      });

      setCurrentRecord(URL.createObjectURL(recordBlob));
      setAudioFile(new File(recordingChunks, "recording.ogg"));

      recordingChunks = [];
    };

    recorder.stop();

    setIsRecording(false);
    clearTimeout(timerTimeout);
  };

  const playTheRecord = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (ref && ref.current) ref.current.play();
    setIsPlaying(true);
  };

  const stopTheRecord = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (ref && ref.current) ref.current.pause();
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (recorder) recorder.stop();
      if (streamG) {
        streamG.getTracks().forEach((t) => t.stop());
      }
      setIsRecording(false);
      setIsPlaying(false);
      setRecordTimer(0);
      setPlayTimer(0);
      setCurrentRecord(undefined);
      clearTimeout(timerTimeout);
      onCancel();
    };
  }, []);

  return (
    <div className="flex-1 flex gap-2 items-center">
      <button
        onClick={onCancel}
        className="h-8 w-8 bg-main rounded-full hover:opacity-50 active:scale-90 duration-300"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="m-auto"
        >
          <path
            d="M7.41 5.99994L11.71 1.70994C11.8983 1.52164 12.0041 1.26624 12.0041 0.999941C12.0041 0.73364 11.8983 0.478245 11.71 0.289941C11.5217 0.101638 11.2663 -0.00415039 11 -0.00415039C10.7337 -0.00415039 10.4783 0.101638 10.29 0.289941L6 4.58994L1.71 0.289941C1.5217 0.101638 1.2663 -0.00415039 1 -0.00415039C0.733698 -0.00415039 0.478304 0.101638 0.29 0.289941C0.101696 0.478245 -0.00409174 0.73364 -0.00409174 0.999941C-0.00409174 1.26624 0.101696 1.52164 0.29 1.70994L4.59 5.99994L0.29 10.2899C0.196272 10.3829 0.121877 10.4935 0.0711088 10.6154C0.0203401 10.7372 -0.00579834 10.8679 -0.00579834 10.9999C-0.00579834 11.132 0.0203401 11.2627 0.0711088 11.3845C0.121877 11.5064 0.196272 11.617 0.29 11.7099C0.382963 11.8037 0.493564 11.8781 0.615423 11.9288C0.737282 11.9796 0.867988 12.0057 1 12.0057C1.13201 12.0057 1.26272 11.9796 1.38458 11.9288C1.50644 11.8781 1.61704 11.8037 1.71 11.7099L6 7.40994L10.29 11.7099C10.383 11.8037 10.4936 11.8781 10.6154 11.9288C10.7373 11.9796 10.868 12.0057 11 12.0057C11.132 12.0057 11.2627 11.9796 11.3846 11.9288C11.5064 11.8781 11.617 11.8037 11.71 11.7099C11.8037 11.617 11.8781 11.5064 11.9289 11.3845C11.9797 11.2627 12.0058 11.132 12.0058 10.9999C12.0058 10.8679 11.9797 10.7372 11.9289 10.6154C11.8781 10.4935 11.8037 10.3829 11.71 10.2899L7.41 5.99994Z"
            fill="#FBFBFB"
          />
        </svg>
      </button>
      <div className="relative flex-1 flex items-center justify-between p-1 rounded-full bg-main">
        <div
          className={`absolute top-0 bottom-0 left-0 bg-white opacity-50 rounded-full`}
          style={{
            width: currentRecord
              ? (playTimer / recordTimer) * 100 + "%"
              : (recordTimer / 60) * 100 + "%",
          }}
        />
        <button
          onClick={
            currentRecord
              ? !isPlaying
                ? playTheRecord
                : stopTheRecord
              : !isRecording
              ? startRecording
              : stopRecording
          }
          className="relative rounded-full w-6 h-6 bg-white hover:opacity-50 active:scale-90 duration-300"
        >
          {currentRecord ? (
            !isPlaying ? (
              <svg
                width="10"
                height="11"
                viewBox="0 0 10 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="m-auto"
              >
                <path
                  d="M9.21115 4.47642C9.94819 4.84495 9.94819 5.89675 9.21115 6.26528L1.44721 10.1472C0.782313 10.4797 -2.98023e-07 9.9962 -2.98023e-07 9.25282L-2.98023e-07 1.48888C-2.98023e-07 0.745502 0.782312 0.262006 1.44721 0.594456L9.21115 4.47642Z"
                  fill="#435334"
                />
              </svg>
            ) : (
              <svg
                width="15"
                height="16"
                viewBox="0 0 15 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="m-auto"
              >
                <path
                  d="M11.8571 0.65901C11.232 0.65901 10.6324 0.896063 10.1904 1.31802C9.74834 1.73998 9.5 2.31227 9.5 2.90901V13.409C9.5 14.0057 9.74834 14.578 10.1904 15C10.6324 15.422 11.232 15.659 11.8571 15.659C12.4823 15.659 13.0818 15.422 13.5239 15C13.9659 14.578 14.2143 14.0057 14.2143 13.409V2.90901C14.2143 2.31227 13.9659 1.73998 13.5239 1.31802C13.0818 0.896063 12.4823 0.65901 11.8571 0.65901ZM3.04757 0.660369C2.42242 0.660369 1.82287 0.897422 1.38082 1.31938C0.938771 1.74134 0.69043 2.31363 0.69043 2.91037V13.4104C0.69043 14.0071 0.938771 14.5794 1.38082 15.0014C1.82287 15.4233 2.42242 15.6604 3.04757 15.6604C3.67273 15.6604 4.27227 15.4233 4.71432 15.0014C5.15637 14.5794 5.40472 14.0071 5.40472 13.4104V2.91037C5.40472 2.31363 5.15637 1.74134 4.71432 1.31938C4.27227 0.897422 3.67273 0.660369 3.04757 0.660369Z"
                  fill="#435334"
                />
              </svg>
            )
          ) : !isRecording ? (
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="m-auto"
            >
              <path
                d="M7.5 0C6.01664 0 4.56659 0.439867 3.33323 1.26398C2.09986 2.08809 1.13856 3.25943 0.570907 4.62987C0.00324963 6.00032 -0.145275 7.50832 0.144114 8.96317C0.433503 10.418 1.14781 11.7544 2.1967 12.8033C3.2456 13.8522 4.58197 14.5665 6.03683 14.8559C7.49168 15.1453 8.99968 14.9967 10.3701 14.4291C11.7406 13.8614 12.9119 12.9001 13.736 11.6668C14.5601 10.4334 15 8.98336 15 7.5C15 6.51508 14.806 5.53981 14.4291 4.62987C14.0522 3.71993 13.4997 2.89314 12.8033 2.1967C12.1069 1.50026 11.2801 0.947814 10.3701 0.570903C9.46019 0.193993 8.48492 0 7.5 0V0ZM7.5 13.5C6.31331 13.5 5.15328 13.1481 4.16658 12.4888C3.17989 11.8295 2.41085 10.8925 1.95673 9.7961C1.5026 8.69974 1.38378 7.49334 1.61529 6.32946C1.8468 5.16557 2.41825 4.09647 3.25736 3.25736C4.09648 2.41824 5.16557 1.8468 6.32946 1.61529C7.49335 1.38378 8.69975 1.5026 9.7961 1.95672C10.8925 2.41085 11.8295 3.17988 12.4888 4.16658C13.1481 5.15327 13.5 6.31331 13.5 7.5C13.5 9.0913 12.8679 10.6174 11.7426 11.7426C10.6174 12.8679 9.0913 13.5 7.5 13.5V13.5ZM7.5 3C6.60999 3 5.73996 3.26392 4.99994 3.75839C4.25992 4.25285 3.68314 4.95566 3.34254 5.77792C3.00195 6.60019 2.91284 7.50499 3.08647 8.3779C3.2601 9.25082 3.68869 10.0526 4.31802 10.682C4.94736 11.3113 5.74918 11.7399 6.6221 11.9135C7.49501 12.0872 8.39981 11.998 9.22208 11.6575C10.0443 11.3169 10.7471 10.7401 11.2416 10.0001C11.7361 9.26004 12 8.39001 12 7.5C12 6.30652 11.5259 5.16193 10.682 4.31802C9.83807 3.4741 8.69348 3 7.5 3ZM7.5 10.5C6.90666 10.5 6.32664 10.324 5.83329 9.99441C5.33994 9.66476 4.95543 9.19623 4.72836 8.64805C4.5013 8.09987 4.44189 7.49667 4.55765 6.91473C4.6734 6.33278 4.95912 5.79824 5.37868 5.37868C5.79824 4.95912 6.33279 4.6734 6.91473 4.55764C7.49667 4.44189 8.09987 4.5013 8.64805 4.72836C9.19623 4.95542 9.66477 5.33994 9.99441 5.83329C10.3241 6.32664 10.5 6.90665 10.5 7.5C10.5 8.29565 10.1839 9.05871 9.62132 9.62132C9.05871 10.1839 8.29565 10.5 7.5 10.5Z"
                fill="black"
              />
            </svg>
          ) : (
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="m-auto"
            >
              <path
                d="M9.625 0H1.375C1.01033 0 0.660591 0.144866 0.402728 0.402728C0.144866 0.660591 0 1.01033 0 1.375V9.625C0 9.98967 0.144866 10.3394 0.402728 10.5973C0.660591 10.8551 1.01033 11 1.375 11H9.625C9.98967 11 10.3394 10.8551 10.5973 10.5973C10.8551 10.3394 11 9.98967 11 9.625V1.375C11 1.01033 10.8551 0.660591 10.5973 0.402728C10.3394 0.144866 9.98967 0 9.625 0Z"
                fill="#435334"
              />
            </svg>
          )}
        </button>
        <div className="relative rounded-full text-main bg-white px-2">
          {currentRecord &&
            `${playingMinutes}:${playingSeconds < 10 ? "0" + playingSeconds : playingSeconds} / `}
          {minutes}:{seconds < 10 ? "0" + seconds : seconds}
        </div>
        <audio controls hidden src={currentRecord} ref={ref} />
      </div>
    </div>
  );
};

export default voidRecorder;
