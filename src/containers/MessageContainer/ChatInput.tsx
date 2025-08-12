import { FC, PropsWithChildren, useState, useEffect } from "react";
import { Space, Input, Button, Upload, UploadFile } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import useInput from "@/hooks/useInput";
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { encodeImageFileAsURL } from "@/lib/common";

interface Props extends PropsWithChildren {
  loading: boolean;
  onSubmit: (input: string, imageUrls: string[]) => Promise<void>;
}

const ChatInput: FC<Props> = ({ loading, onSubmit }) => {
  const [input, handleInput, setInput] = useInput("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const {
    listening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const handleSpeechRecognize = () => {
    if (listening) {
      stopListening();
    } else {
      startListening({
        continuous: true,
        language: 'zh-TW',
      });
    }
  };

  const handleUpload = (info: any) => {
    if (info.file.status === "done") {
      // Handle successful upload
      encodeImageFileAsURL(info.file.originFileObj).then((url) => {
        setFileList(info.fileList);
        setImageUrls((prev) => [...(prev || []), url]);
      });
    } else if (info.file.status === "error") {
      // Handle upload error
    }
  };

  const handleSubmit = async () => {
    await onSubmit(input, imageUrls);
    setInput("");
    setFileList([]);
    setImageUrls([]);
  };

  useEffect(() => {
    setInput(transcript);
  }, [transcript]);

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Input
        placeholder="Send message to ChatGPT..."
        size="large"
        disabled={loading}
        value={input}
        onChange={handleInput}
      />
      {browserSupportsSpeechRecognition && (
        <Button
          type="primary"
          size="large"
          danger={listening}
          onClick={handleSpeechRecognize}
        >
          <div className="h-full flex items-center">
            {
              listening ? (
                <Icon icon="mdi:stop-circle" />
              ) : (
                <Icon icon="mdi:microphone" />
              )
            }
          </div>
        </Button>
      )}
      <Upload showUploadList={false} onChange={handleUpload}>
        <Button
          type="primary"
          size="large"
          className="px-3"
          icon={<UploadOutlined />}
        >
          {fileList.length > 0 && (
            <div className="absolute bottom-full right-0 select-none text-xs text-gray-500">
              {fileList.map(file => (
                <span key={file.uid} className="block">
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </Button>
      </Upload>
      <Button
        type="primary"
        size="large"
        disabled={loading}
        onClick={handleSubmit}
      >
        <div className="h-full flex items-center">
          <Icon icon="mdi:send" />
        </div>
      </Button>
    </Space.Compact>
  );
};

export default ChatInput;
