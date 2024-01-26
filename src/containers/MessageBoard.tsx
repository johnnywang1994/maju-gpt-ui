"use client";
import { FC, useRef, useEffect } from "react";
import { message } from "antd";
import BackTop from "antd/es/float-button/BackTop";
import useLiff from "@/hooks/useLiff";
import useCommon, { localSettingKey } from "@/hooks/useCommon";
import useMessages from "@/hooks/useMessages";
import { sendUserCompletions } from "./MessageContainer/api";
import MessageContainer from "./MessageContainer";
import { RoleType, SendMessage } from "@/types/message";
import { MAX_MESSAGES } from "@/lib/env";

const MessageBoard: FC = () => {
  const ref = useRef(null);
  const { messages } = useMessages();
  const { settings, computed, setSettings } = useCommon();
  const { accessToken } = useLiff();

  const handleMessages = (newMessage: SendMessage) => {
    const { enableSystemPrompt } = settings;
    let sendMessages = messages.map(({ role, content }) => ({
      role,
      content,
    }));
    sendMessages.push(newMessage);
    // slice only last required messages to send
    sendMessages = sendMessages.slice(-MAX_MESSAGES);
    // system prompt will placed at the top of all messages
    if (enableSystemPrompt) {
      const systemMessage = {
        role: RoleType.SYSTEM,
        content: computed.systemPrompt,
      };
      // replace first message to keep message number still be within config
      if (sendMessages.length >= MAX_MESSAGES) {
        sendMessages[0] = systemMessage;
      } else {
        sendMessages.unshift(systemMessage);
      }
    }
    return sendMessages;
  };

  const handleError = (status: number) => {
    switch (status) {
      case 403:
        message.error(
          "You don't have permission, please ask to Administrator."
        );
        break;
    }
  };

  const handleSendRequest = async (newMessage: SendMessage) => {
    try {
      const res = await sendUserCompletions({
        messages: handleMessages(newMessage),
        token: accessToken,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        model: settings.model,
        frequencyPenalty: settings.frequencyPenalty,
        presencePenalty: settings.presencePenalty,
      });
      if (res?.data) return res.data;
      handleError(res.status);
    } catch (err) {
      console.warn(err);
      message.error("Server error, please contact project owner.");
    }
  };

  useEffect(() => {
    (ref.current as unknown as HTMLElement)?.scrollTo({
      top: 99999,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const prevSettings = localStorage.getItem(localSettingKey);
    if (!!prevSettings) {
      try {
        setSettings(JSON.parse(prevSettings));
      } catch {}
    }
  }, []);

  return (
    <div ref={ref} className="h-full overflow-auto">
      <BackTop
        style={{ insetBlockEnd: 100 }}
        target={() => ref.current as any}
      />
      <MessageContainer
        names={{
          user: settings.username,
          assistant: settings.gptname,
        }}
        onSendRequest={handleSendRequest}
      />
      <p className="text-sky-700 mx-auto text-xs px-4 text-center">
        *only last {MAX_MESSAGES} messages in this context will be sent to
        GPT.(includes system prompt if enabled)
      </p>
    </div>
  );
};

export default MessageBoard;
