import ChatApp from "@/containers/ChatApp";
import { getImageModelOptions, getModelOptions } from "@/lib/models";

export const dynamic = "force-dynamic";

export default function Home() {
  return <ChatApp modelOptions={getModelOptions()} imageModelOptions={getImageModelOptions()} />;
}
