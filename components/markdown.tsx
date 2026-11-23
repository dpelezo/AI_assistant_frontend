import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

// Styled elements for assistant replies. Headings are scaled down so a
// report's "# Title" does not dominate a chat bubble.
const components: Components = {
  h1: ({ node: _node, ...props }) => <h3 className="mt-4 mb-2 text-base font-semibold first:mt-0" {...props} />,
  h2: ({ node: _node, ...props }) => <h4 className="mt-4 mb-2 text-sm font-semibold first:mt-0" {...props} />,
  h3: ({ node: _node, ...props }) => <h5 className="mt-3 mb-1 text-sm font-semibold first:mt-0" {...props} />,
  p: ({ node: _node, ...props }) => <p className="my-2 leading-relaxed first:mt-0 last:mb-0" {...props} />,
  ul: ({ node: _node, ...props }) => <ul className="my-2 list-disc space-y-1 pl-5" {...props} />,
  ol: ({ node: _node, ...props }) => <ol className="my-2 list-decimal space-y-2 pl-5" {...props} />,
  li: ({ node: _node, ...props }) => <li className="leading-relaxed" {...props} />,
  a: ({ node: _node, ...props }) => (
    <a
      className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  strong: ({ node: _node, ...props }) => <strong className="font-semibold text-zinc-50" {...props} />,
  blockquote: ({ node: _node, ...props }) => (
    <blockquote className="my-2 border-l-2 border-zinc-600 pl-3 text-zinc-300" {...props} />
  ),
  code: ({ node: _node, className, ...props }) => (
    <code className={className ?? "rounded bg-zinc-900 px-1 py-0.5 text-[0.85em]"} {...props} />
  ),
  pre: ({ node: _node, ...props }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs" {...props} />
  ),
  table: ({ node: _node, ...props }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs" {...props} />
    </div>
  ),
  th: ({ node: _node, ...props }) => <th className="border-b border-zinc-600 px-2 py-1 font-semibold" {...props} />,
  td: ({ node: _node, ...props }) => <td className="border-b border-zinc-700/60 px-2 py-1 align-top" {...props} />,
  hr: () => <hr className="my-3 border-zinc-700" />,
}

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  )
}
