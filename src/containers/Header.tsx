"use client";
import { FC } from "react";
import { Popconfirm, Space } from "antd";
import { Icon } from "@iconify/react";
import useCommon from "@/hooks/useCommon";
import useLiff from "@/hooks/useLiff";

const Header: FC = () => {
  const { liff } = useLiff();
  const { toggleDrawer, toggleSetting } = useCommon();

  const lineVersion = liff?.getLineVersion();

  return (
    <div className="flex items-center h-full">
      <div
        className="absolute left-4 top-3 text-white mr-2 cursor-pointer md:hidden"
        onClick={() => toggleDrawer(true)}
      >
        <Icon width={32} icon="mdi:menu-close" />
      </div>
      <div className="text-white text-lg tracking-wide select-none ml-3 md:ml-0">
        Maju ChatGPT
      </div>
      <Space className="ml-auto">
        <div
          className="flex items-center text-gray-400 hover:text-white cursor-pointer"
          onClick={() => toggleSetting(true)}
        >
          <Icon width={32} icon="mdi:cog-box" />
        </div>
        {liff && !lineVersion && (
          <Popconfirm
            title="Are you sure to logout LINE account?"
            onConfirm={() => {
              liff.logout();
              location.reload();
            }}
          >
            <div className="flex items-center text-gray-400 hover:text-white cursor-pointer">
              <Icon width={32} icon="mdi:logout-variant" />
            </div>
          </Popconfirm>
        )}
      </Space>
    </div>
  );
};

export default Header;
