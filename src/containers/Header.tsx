"use client";
import { FC } from "react";
import { Popconfirm, Space } from "antd";
import { Icon } from "@iconify/react";
import useCommon from "@/hooks/useCommon";
import useLiff from "@/hooks/useLiff";
import ThemeSwitch from "@/components/ThemeSwitch";
import useAntConfig from "@/hooks/useAntConfig";

const Header: FC = () => {
  const { liff } = useLiff();
  const { toggleDrawer, toggleSetting } = useCommon();
  const { isDarkMode, toggleIsDarkMode } = useAntConfig();

  const lineVersion = liff?.getLineVersion();

  return (
    <div className="flex items-center h-full">
      <div
        className="absolute left-4 top-3 mr-2 cursor-pointer md:hidden"
        onClick={() => toggleDrawer(true)}
      >
        <Icon width={32} icon="mdi:menu-close" />
      </div>
      <div className="base-text text-lg font-bold tracking-wide select-none ml-3 md:ml-0">
        Maju ChatGPT
      </div>
      <Space className="ml-auto">
        <ThemeSwitch isDark={isDarkMode} onChange={() => toggleIsDarkMode()} />
        <div
          className="flex items-center icon-text"
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
            <div className="flex items-center icon-text">
              <Icon width={32} icon="mdi:logout-variant" />
            </div>
          </Popconfirm>
        )}
      </Space>
    </div>
  );
};

export default Header;
