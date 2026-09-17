import type { Metadata } from "next";
import "@/styles/global.scss";

export const metadata: Metadata = {
  title: "Maju Chat",
  description:
    "A CopilotKit chat interface backed by an OpenAI-compatible API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
