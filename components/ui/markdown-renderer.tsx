import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Customize table styling
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-border" {...props}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children, ...props }) => (
          <thead className="bg-muted/50" {...props}>
            {children}
          </thead>
        ),
        th: ({ children, ...props }) => (
          <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" {...props}>
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td className="px-3 py-2 text-sm whitespace-normal" {...props}>
            {children}
          </td>
        ),
        // Style other elements
        p: ({ children, ...props }) => (
          <p className="mb-3 last:mb-0" {...props}>
            {children}
          </p>
        ),
        strong: ({ children, ...props }) => (
          <strong className="font-semibold" {...props}>
            {children}
          </strong>
        ),
        ul: ({ children, ...props }) => (
          <ul className="list-disc list-inside mb-3 space-y-1" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal list-inside mb-3 space-y-1" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li className="ml-2" {...props}>
            {children}
          </li>
        ),
        // Remove links that might be in the response
        a: ({ children }) => <span>{children}</span>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
