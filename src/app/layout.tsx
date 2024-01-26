import type { Metadata } from "next";
// prevent page flicker
// https://ant.design/docs/react/use-with-next#using-app-router
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/global.scss";

export const metadata: Metadata = {
  title: "Maju GPT UI",
  description:
    "Maju GPT UI is a simple UI for ChatGPT, integrated with LIFF login if you want. Chat data are stored in browser localStorage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
