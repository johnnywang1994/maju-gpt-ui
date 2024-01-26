import { FC, PropsWithChildren } from "react";
import { Space, Input, Button } from "antd";
import { Icon } from "@iconify/react";
import useInput from "@/hooks/useInput";

interface Props extends PropsWithChildren {
  loading: boolean;
  onSubmit: (input: string) => Promise<void>;
}

const ChatInput: FC<Props> = ({ loading, onSubmit }) => {
  const [input, handleInput, setInput] = useInput("");

  const handleSubmit = async () => {
    await onSubmit(input);
    setInput("");
  };

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Input
        className="bg-gray-100"
        placeholder="Send message to ChatGPT..."
        size="large"
        disabled={loading}
        value={input}
        onChange={handleInput}
      />
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
