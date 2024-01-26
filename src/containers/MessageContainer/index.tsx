"use client";
import { FC, useState, useEffect } from "react";
import { Spin, Skeleton, message } from "antd";
import { Icon } from "@iconify/react";

import useMessages, { parseMessage } from "@/hooks/useMessages";
import ChatInput from "@/containers/MessageContainer/ChatInput";
import MessageItem from "@/containers/MessageContainer/MessageItem";
import { RoleType, RawGPTMessage, SendMessage } from "@/types/message";

interface Props {
  names: {
    user: string;
    assistant: string;
  };
  minLength?: number;
  onSendRequest: (message: SendMessage) => Promise<RawGPTMessage | void>;
}

const MessageContainer: FC<Props> = ({
  names,
  minLength = 8,
  onSendRequest,
}) => {
  const { isInited, messages, addMessage, deleteMessage, initialize } =
    useMessages();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (input: string) => {
    // prevent user from mistakenly send message
    if (input.length < minLength) {
      message.info(
        "Question is too short, make sure you have enter your question correctly."
      );
      return;
    }
    // add user question
    const newUserMessage = {
      role: RoleType.USER,
      content: input,
    };
    addMessage(newUserMessage);
    setLoading(true);
    try {
      const res = await onSendRequest(newUserMessage);
      if (res?.id) {
        addMessage(parseMessage(res));
      }
    } catch (err) {
      console.error(err);
      message.error("unhandled error, please contact project owner.");
    }
    setLoading(false);
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <Spin spinning={!isInited}>
      <div className="relative px-4 py-6 md:px-6">
        <div className="max-w-[512px] md:max-w-[850px] mx-auto pb-28">
          {messages.map((item) => (
            <MessageItem
              key={item.id}
              names={names}
              message={item}
              onDelete={() => deleteMessage(item.id)}
            />
          ))}
          {messages.length === 0 && (
            <div className="h-[280px] sm:h-[400px] md:h-[600px] flex justify-center items-center select-none">
              <div className="text-center text-gray-500">
                <Icon width={36} icon="mdi:emoticon-cool-outline" />
                <h2>How can I help you today?</h2>
              </div>
            </div>
          )}
          <Spin spinning={loading}>
            {loading && <Skeleton className="mt-4" avatar active />}
          </Spin>
        </div>

        <div className="fixed bottom-12 left-0 md:left-1/4 right-0 max-w-[580px] mx-auto px-4">
          <ChatInput loading={loading} onSubmit={handleSubmit} />
        </div>
      </div>
    </Spin>
  );
};

export default MessageContainer;
