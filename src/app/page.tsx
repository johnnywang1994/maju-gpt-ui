import { Layout } from "antd";
import { Header, Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import HomeApp from "@/containers/HomeApp";
import MessageBoard from "@/containers/MessageBoard";
import MyHeader from "@/containers/Header";
import MySidebar from "@/containers/Sidebar";

export default function Home() {
  return (
    <Layout className="h-screen">
      <HomeApp>
        <Header>
          <MyHeader />
        </Header>
        <Layout hasSider>
          <Sider className="w-1/4 hidden md:block">
            <MySidebar />
          </Sider>
          <Content>
            <MessageBoard />
          </Content>
        </Layout>
      </HomeApp>
    </Layout>
  );
}
