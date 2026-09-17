"use client";

import {
  CopilotChatAssistantMessage,
  CopilotChatMessageView,
} from "@copilotkit/react-core/v2";
import type { ComponentProps } from "react";
import MarkdownMessage from "@/components/MarkdownMessage";

type AssistantMessageProps = ComponentProps<typeof CopilotChatAssistantMessage>;
type MessageViewProps = ComponentProps<typeof CopilotChatMessageView>;

const MajuAssistantMessage = Object.assign(
  function MajuAssistantMessage({ message, ...props }: AssistantMessageProps) {
    return (
      <CopilotChatAssistantMessage
        {...props}
        message={message}
        toolbarVisible={false}
        markdownRenderer={({ content }) => <MarkdownMessage content={content} />}
      />
    );
  },
  CopilotChatAssistantMessage,
);

const MajuMessageView = Object.assign(
  function MajuMessageView(props: MessageViewProps) {
    return <CopilotChatMessageView {...props} assistantMessage={MajuAssistantMessage} />;
  },
  CopilotChatMessageView,
);

export default MajuMessageView;
