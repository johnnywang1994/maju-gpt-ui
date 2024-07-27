'use client';
import dynamic from "next/dynamic";
import Layout from "antd/es/layout";
import { Header, Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { AntConfigProvider } from "@/hooks/useAntConfig";
import HomeApp from "@/containers/HomeApp";
import MyHeader from "@/containers/Header";
import MySidebar from "@/containers/Sidebar";

const MessageBoard = dynamic(() => import("@/containers/MessageBoard"), {
  ssr: false,
});

export default function Home() {
  return (
    <AntConfigProvider>
      <Layout className="h-screen">
        <HomeApp>
          <Header className="bg-gray-100 dark:bg-gray-800 block-border border-0 border-b pr-4">
            <MyHeader />
          </Header>
          <Layout hasSider>
            <Sider className="w-1/4 hidden md:block bg-gray-100 dark:bg-gray-800 block-border border-0 border-r">
              <MySidebar />
            </Sider>
            <Content>
              <MessageBoard />
            </Content>
          </Layout>
        </HomeApp>
      </Layout>
    </AntConfigProvider>
  );
}
