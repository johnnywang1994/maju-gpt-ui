"use client";

import { MarkdownHooks } from "react-markdown";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

type Props = { content: string };

export default function MarkdownMessage({ content }: Props) {
  return (
    <MarkdownHooks
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypePrettyCode, { theme: "github-dark", keepBackground: false }]]}
      components={{
        h1: ({ children }) => <h1 className="mt-4 mb-2 text-xl font-bold first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="mt-4 mb-2 text-lg font-bold first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-3 mb-1.5 text-base font-semibold first:mt-0">{children}</h3>,
        p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
        li: ({ children }) => <li className="pl-0.5">{children}</li>,
        blockquote: ({ children }) => <blockquote className="my-3 border-l-4 border-slate-300 bg-slate-50 py-1 pr-3 pl-3 text-slate-600">{children}</blockquote>,
        a: ({ children, href }) => <a className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900" href={href} target="_blank" rel="noreferrer">{children}</a>,
        table: ({ children }) => <div className="my-3 overflow-x-auto rounded-lg border border-slate-200"><table className="w-full border-collapse text-left text-xs">{children}</table></div>,
        thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
        th: ({ children }) => <th className="border-b border-slate-200 px-3 py-2 font-semibold whitespace-nowrap">{children}</th>,
        td: ({ children }) => <td className="border-b border-slate-100 px-3 py-2 align-top last:border-b-0">{children}</td>,
        hr: () => <hr className="my-4 border-0 border-t border-slate-200" />,
        img: () => null,
        pre: ({ children, ...props }) => <pre className="my-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs leading-6" {...props}>{children}</pre>,
        code: ({ className, children, ...props }) => {
          if (className?.includes("language-")) return <code className={className} {...props}>{children}</code>;

          return <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[.85em] text-rose-800" {...props}>{children}</code>;
        },
      }}
    >
      {content}
    </MarkdownHooks>
  );
}
