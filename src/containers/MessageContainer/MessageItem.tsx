import { FC } from "react";
import { Icon } from "@iconify/react";
import { Space, Popconfirm } from "antd";
import clsx from "clsx";

import Markdown from "@/containers/MessageContainer/Markdown";
import CopyButton from "./CopyButton";
import { Message, RoleType, ContentObject } from "@/types/message";

interface Props {
  names: {
    user: string;
    assistant: string;
  };
  message: Message;
  onDelete?: () => void;
}

const renderContent = (content: string | ContentObject[], isGPT: boolean) => {
  if (Array.isArray(content)) {
    return (
      <>
        {content.map((item, index) => (
          <div key={index}>
            {item.type === "text" ? (
              <Markdown content={item.text ?? ''} />
            ) : item.type === "image_url" ? (
              <img className="max-w-[350px]" src={item.image_url?.url} alt="Image is deleted." />
            ) : null}
          </div>
        ))}
      </>
    )
  }
  if (isGPT && (content.startsWith('https://') || content.startsWith('data:image/'))) {
    return <img className="max-w-[350px]" src={content} alt="Image is deleted." />;
  }
  return <Markdown content={content} />;
};

const MessageItem: FC<Props> = ({ names, message, onDelete }) => {
  const { content, role } = message;
  const isGPT = role === RoleType.GPT;
  const avatarColor = isGPT ? "bg-sky-500" : "bg-orange-500";
  return (
    <div className="relative mt-4 text-sm md:text-base">
      <div className="absolute left-0 top-0">
        <div
          className={clsx(
            "flex items-center justify-center w-8 h-8 text-white rounded-full",
            avatarColor
          )}
        >
          <Icon icon={isGPT ? "mdi:face-agent" : "mdi:account"} width={26} />
        </div>
      </div>
      <div className="pl-10 dark:text-gray-100">
        <h4>{isGPT ? names.assistant : names.user}</h4>
        <div>
          {renderContent(content, isGPT)}
        </div>
        {/* actions */}
        <div className="absolute right-0 top-0">
          <Space>
            {isGPT && (
              <div className="w-7 h-7 rounded-md inline-flex items-center justify-center bg-gray-400 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 cursor-pointer">
                <CopyButton text={content as string} />
              </div>
            )}
            <Popconfirm
              title="Are you sure to delete this message?"
              onConfirm={onDelete}
            >
              <div className="w-7 h-7 rounded-md inline-flex items-center justify-center text-white bg-gray-400 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 cursor-pointer">
                <Icon width={20} icon="mdi:trash-can-outline" />
              </div>
            </Popconfirm>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
