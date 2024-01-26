"use client";
import Script from "next/script";
import { FC, PropsWithChildren, useEffect } from "react";
import { Spin, Drawer } from "antd";
import useLiff from "@/hooks/useLiff";
import useCommon from "@/hooks/useCommon";
import MySidebar from "@/containers/Sidebar";
import MySettings from "@/containers/Settings";

import { ENABLE_AUTH } from "@/lib/env";

interface Props extends PropsWithChildren {}

const App: FC<Props> = ({ children }) => {
  const { isInited, initialize } = useLiff();
  const { openDrawer, openSetting, toggleDrawer, toggleSetting } = useCommon();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      {ENABLE_AUTH && (
        <Script
          src="https://static.line-scdn.net/liff/edge/2/sdk.js"
          onLoad={initialize}
        ></Script>
      )}

      <Drawer
        rootClassName="md:hidden"
        className="[&>.ant-drawer-body]:bg-gray-800"
        placement="left"
        title="Chat History"
        width={250}
        open={openDrawer}
        onClose={() => toggleDrawer(false)}
      >
        <MySidebar onClose={() => toggleDrawer(false)} />
      </Drawer>

      <Drawer
        className="[&>.ant-drawer-body]:bg-gray-200 [&>.ant-drawer-body]:p-4"
        placement="right"
        title="Settings"
        width={350}
        open={openSetting}
        onClose={() => toggleSetting(false)}
      >
        <MySettings />
      </Drawer>

      <Spin spinning={!isInited}>
        {!isInited && <div className="min-h-screen"></div>}
      </Spin>
      {isInited && children}
    </>
  );
};

export default App;
