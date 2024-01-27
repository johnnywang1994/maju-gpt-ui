"use client";
import Script from "next/script";
import { FC, PropsWithChildren, useEffect } from "react";
import { Drawer, Modal, Input, Spin } from "antd";
import useLiff from "@/hooks/useLiff";
import useCommon from "@/hooks/useCommon";
import useAntConfig from "@/hooks/useAntConfig";
import MySidebar from "@/containers/Sidebar";
import MySettings from "@/containers/Settings";

import { ENABLE_AUTH, MODE } from "@/lib/env";

interface Props extends PropsWithChildren {}

const isStatic = MODE === "static";

const App: FC<Props> = ({ children }) => {
  const { isInited, initialize } = useLiff();
  const {
    apiKey,
    openDrawer,
    openSetting,
    openApiKeyModal,
    toggleDrawer,
    toggleSetting,
    setApiKey,
    setApiKeyModal,
  } = useCommon();
  const { initialize: initializeTheme } = useAntConfig();

  useEffect(() => {
    initialize();
    initializeTheme();
    if (isStatic) {
      setApiKeyModal(true);
    }
  }, [initialize, initializeTheme, setApiKeyModal]);

  return (
    <>
      {ENABLE_AUTH && (
        <Script
          src="https://static.line-scdn.net/liff/edge/2/sdk.js"
          onLoad={initialize}
        ></Script>
      )}

      {isStatic && (
        <Modal
          open={openApiKeyModal}
          title="Please enter your API Key:"
          onOk={() => setApiKeyModal(false)}
          closable={false}
          footer={(_, { OkBtn }) => <OkBtn />}
        >
          <Input
            value={apiKey}
            placeholder="your API key won't be saved in anywhere"
            onChange={({ target: { value } }) => setApiKey(value)}
          />
          <p className="text-xs">
            You can add API key later in settings, but you can not send message
            before entering the api key.
          </p>
        </Modal>
      )}

      <Drawer
        rootClassName="md:hidden"
        className="[&>.ant-drawer-body]:bg-gray-100 dark:[&>.ant-drawer-body]:bg-gray-800"
        placement="left"
        title="Chat History"
        width={250}
        open={openDrawer}
        onClose={() => toggleDrawer(false)}
      >
        <MySidebar onClose={() => toggleDrawer(false)} />
      </Drawer>

      <Drawer
        className="[&>.ant-drawer-body]:bg-gray-100 dark:[&>.ant-drawer-body]:bg-gray-800 [&>.ant-drawer-body]:p-4"
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
