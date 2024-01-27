"use client";
import { FC, PropsWithChildren } from "react";
import clsx from "clsx";
import { Button, Popconfirm } from "antd";
import { Icon } from "@iconify/react";
import useMessages, { newRoom } from "@/hooks/useMessages";
import EditableText from "@/components/EditableText";

interface Props extends PropsWithChildren {
  onClose?: () => void;
}

const MySidebar: FC<Props> = ({ onClose }) => {
  const {
    isInited,
    roomHistory,
    currentRoom,
    deleteRoom,
    updateCurrentRoom,
    setChatroom,
  } = useMessages();

  return isInited ? (
    <div className="h-full px-4 py-6 overflow-auto">
      <div>
        <Button
          className="w-full"
          icon={
            <Icon
              width={20}
              icon="mdi:chat-plus-outline"
              className="align-middle"
            />
          }
          onClick={() => {
            setChatroom(newRoom());
            onClose?.();
          }}
        >
          New Chat
        </Button>
      </div>
      <div className="base-text mt-6">
        {roomHistory.map(({ label, key }) => (
          <div key={key} className="relative group">
            <EditableText
              className={clsx(
                `px-4 py-2 pr-10 my-1 rounded-md cursor-pointer`,
                key === currentRoom.key
                  ? "bg-sky-200 dark:bg-sky-500"
                  : "group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
              )}
              label={label}
              onClick={() => {
                setChatroom({ label, key });
                onClose?.();
              }}
              onConfirm={(newLabel) => updateCurrentRoom(newLabel)}
            />
            <Popconfirm
              title="Are you sure you want to delete this dialog?"
              onConfirm={() => deleteRoom({ label, key })}
            >
              <div className="delete-icon absolute right-1 top-2 hidden group-hover:block icon-text">
                <Icon width={20} icon="mdi:delete-circle" />
              </div>
            </Popconfirm>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <></>
  );
};

export default MySidebar;
