import { FC, PropsWithChildren, useEffect } from "react";
import { Space, Input, Button } from "antd";
import { Icon } from "@iconify/react";
import useInput from "@/hooks/useInput";
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface Props extends PropsWithChildren {
  loading: boolean;
  onSubmit: (input: string) => Promise<void>;
}

const ChatInput: FC<Props> = ({ loading, onSubmit }) => {
  const [input, handleInput, setInput] = useInput("");
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

  const handleSubmit = async () => {
    await onSubmit(input);
    setInput("");
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
