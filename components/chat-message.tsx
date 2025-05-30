"use client"

import { cn } from "@/lib/utils"
import { Message } from "@/lib/types"
import { Globe, FileSearch, Clock } from "lucide-react"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  
  return (
    <div
      className={cn(
        "flex w-full gap-2 py-2",
        isUser ? "justify-end pl-10" : "justify-start pr-10"
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-zinc-800 text-xs">
          AI
        </div>
      )}
      
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "bg-blue-600 text-zinc-50"
            : message.isError
              ? "bg-red-900/40 text-zinc-50"
              : "bg-zinc-800 text-zinc-50"
        )}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
        
        {/* Show loading indicator for research in progress */}
        {!isUser && message.isLoading && (
          <div className="mt-2 flex items-center text-xs text-zinc-400 pt-1 border-t border-zinc-700/50">
            <Clock className="h-3 w-3 mr-1 animate-pulse" />
            <span>Researching... This may take a minute</span>
          </div>
        )}
        
        {/* Show mode indicators for completed messages */}
        {!isUser && !message.isLoading && message.mode && (
          <div className="mt-2 flex items-center text-xs text-zinc-400 pt-1 border-t border-zinc-700/50">
            {message.mode === 'research' ? (
              <>
                <FileSearch className="h-3 w-3 mr-1" />
                <span>Deep Research</span>
                {message.researchData && (
                  <span className="ml-2 text-zinc-500">
                    ({message.researchData.iterations} iterations, 
                    {message.researchData.search_queries?.length || 0} queries)
                  </span>
                )}
              </>
            ) : message.toolCalls && message.toolCalls.some(tool => tool.name === "retrieve_web_content") ? (
              <>
                <Globe className="h-3 w-3 mr-1" />
                <span>Web Search</span>
              </>
            ) : null}
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