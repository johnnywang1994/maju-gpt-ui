// Reference
// https://blog.designly.biz/react-markdown-how-to-create-a-copy-code-button
import { FC, PropsWithChildren, ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import a11yDark from "react-syntax-highlighter/dist/cjs/styles/prism/a11y-dark";
import CopyButton from "./CopyButton";

interface MarkdownProps {
  content: string;
}

const PreBlock = ({ children }: PropsWithChildren) => {
  const code = (children as ReactElement)?.props.children;
  return (
    <pre className="relative text-xs md:text-sm">
      <CopyButton className="absolute right-2 top-2" text={code} />
      {children}
    </pre>
  );
};

const CodeBlock = ({ children, className }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  return match ? (
    <SyntaxHighlighter style={a11yDark as any} language={match[1]} PreTag="div">
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  ) : (
    <code className={className}>{children}</code>
  );
};

const Markdown: FC<MarkdownProps> = ({ content }) => {
  return (
    <ReactMarkdown
      className="chat-markdown"
      rehypePlugins={[]}
      remarkPlugins={[]}
      components={{
        pre: (props) => <PreBlock {...props} />,
        code: CodeBlock,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default Markdown;
