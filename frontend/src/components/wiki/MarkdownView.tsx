import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownView({ content }: { content: string }) {
  return (
    <div className="prose-sm max-w-none text-sm leading-relaxed text-gray-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="mb-3 mt-4 text-2xl font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-2 mt-4 text-xl font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-3 text-lg font-semibold">{children}</h3>,
          p: ({ children }) => <p className="mb-3">{children}</p>,
          ul: ({ children }) => <ul className="mb-3 list-disc pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 list-decimal pl-6">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          a: ({ children, href }) => (
            <a href={href} className="text-blue-600 hover:underline">
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="mb-3 overflow-auto rounded bg-gray-100 p-3 font-mono text-xs">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <table className="mb-3 border-collapse border border-gray-300 text-sm">{children}</table>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 bg-gray-50 px-3 py-1">{children}</th>
          ),
          td: ({ children }) => <td className="border border-gray-300 px-3 py-1">{children}</td>,
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-4 border-gray-300 pl-4 text-gray-600">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
