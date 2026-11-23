"use client"

import { AlertCircle, FileSearch, Globe, Loader2 } from "lucide-react"
import { Markdown } from "@/components/markdown"
import type { Message } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const usedWebSearch = message.toolCalls?.some((tool) => tool.name === "retrieve_web_content")
  const searchCount = message.researchData?.search_queries?.length ?? 0
  const showFooter =
    !isUser && !message.isLoading && !message.isError && (message.mode === "research" || usedWebSearch)

  return (
    <div className={cn("flex w-full gap-2 py-2", isUser ? "justify-end pl-10" : "justify-start pr-10")}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-zinc-800 text-xs">
          AI
        </div>
      )}

      <div
        className={cn(
          "min-w-0 rounded-2xl px-4 py-2.5 text-sm text-zinc-100",
          isUser && "bg-blue-600 text-zinc-50",
          !isUser && !message.isError && "bg-zinc-800",
          message.isError && "border border-red-500/40 bg-red-950/50",
        )}
      >
        {message.isLoading ? (
          <div className="flex items-center gap-2 text-zinc-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{message.content}</span>
          </div>
        ) : isUser ? (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        ) : (
          <div className={cn("break-words", message.isError && "flex items-start gap-2")}>
            {message.isError && (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-label="Error" />
            )}
            <div className="min-w-0">
              <Markdown>{message.content}</Markdown>
            </div>
          </div>
        )}

        {showFooter && (
          <div className="mt-2 flex items-center gap-1 border-t border-zinc-700/50 pt-1 text-xs text-zinc-400">
            {message.mode === "research" ? (
              <>
                <FileSearch className="h-3 w-3" />
                <span>
                  Deep research
                  {searchCount > 0 && ` · ${searchCount} ${searchCount === 1 ? "search" : "searches"}`}
                </span>
              </>
            ) : (
              <>
                <Globe className="h-3 w-3" />
                <span>Web search</span>
              </>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-zinc-800 text-xs">
          You
        </div>
      )}
    </div>
  )
}
