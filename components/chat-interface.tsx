"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { ChatMessage } from "@/components/chat-message"
import { MessageInput } from "@/components/message-input"
import type { APIResponse, Message } from "@/lib/types"

type Mode = "search" | "research"

const SEARCH_POLL_MS = 1000
const SEARCH_MAX_POLLS = 60 // about 1 minute
const RESEARCH_POLL_MS = 2000
const RESEARCH_MAX_POLLS = 150 // about 5 minutes

const TEXT = {
  thinking: "Thinking…",
  researching: "Researching… this can take a minute or two.",
  generic: "Something went wrong. Please try again.",
  network: "I couldn't reach the assistant. Check your connection and try again.",
  timeout: "This is taking longer than usual. Please try again in a moment.",
  noReport: "The research finished, but no report was produced. Try a more specific question.",
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isBusy, setIsBusy] = useState(false)
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Stop polling if the page unmounts.
  useEffect(() => () => {
    if (pollTimer.current) clearTimeout(pollTimer.current)
  }, [])

  // Each reply starts as a placeholder message; updates target it by ID, so
  // they never depend on a stale copy of the message list.
  const updateMessage = useCallback((id: string, patch: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }, [])

  const finish = useCallback(
    (id: string, patch: Partial<Message>) => {
      updateMessage(id, { ...patch, isLoading: false, createdAt: new Date() })
      setIsBusy(false)
    },
    [updateMessage],
  )

  const pollThread = useCallback(
    (threadId: string, placeholderId: string, attempt = 0) => {
      pollTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/chat?thread_id=${encodeURIComponent(threadId)}`)
          if (res.ok) {
            const data: APIResponse = await res.json()
            const reply = [...(data.messages ?? [])].reverse().find((m) => m.role === "assistant")
            if (reply) {
              finish(placeholderId, {
                content: reply.content || TEXT.generic,
                isError: Boolean(reply.is_error) || !reply.content,
                toolCalls: reply.tool_calls,
              })
              return
            }
          }
        } catch (error) {
          console.error("Polling for the reply failed; retrying", error)
        }
        if (attempt + 1 >= SEARCH_MAX_POLLS) {
          finish(placeholderId, { content: TEXT.timeout, isError: true })
        } else {
          pollThread(threadId, placeholderId, attempt + 1)
        }
      }, SEARCH_POLL_MS)
    },
    [finish],
  )

  const pollResearch = useCallback(
    (researchId: string, placeholderId: string, attempt = 0) => {
      pollTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/chat?research_id=${encodeURIComponent(researchId)}`)
          if (res.ok) {
            const data: APIResponse = await res.json()
            const first = data.messages?.[0]
            if (data.status === "completed") {
              finish(placeholderId, {
                content: first?.content || TEXT.noReport,
                isError: !first?.content,
                researchData: data.research_data,
              })
              return
            }
            if (data.status === "error") {
              finish(placeholderId, { content: first?.content || TEXT.generic, isError: true })
              return
            }
          }
        } catch (error) {
          console.error("Polling for the research result failed; retrying", error)
        }
        if (attempt + 1 >= RESEARCH_MAX_POLLS) {
          finish(placeholderId, { content: TEXT.timeout, isError: true })
        } else {
          pollResearch(researchId, placeholderId, attempt + 1)
        }
      }, RESEARCH_POLL_MS)
    },
    [finish],
  )

  const sendMessage = async (content: string, mode: Mode = "search") => {
    if (isBusy) return
    const placeholderId = uuidv4()

    setIsBusy(true)
    setMessages((prev) => [
      ...prev,
      { id: uuidv4(), role: "user", content, createdAt: new Date() },
      {
        id: placeholderId,
        role: "assistant",
        content: mode === "research" ? TEXT.researching : TEXT.thinking,
        createdAt: new Date(),
        isLoading: true,
        mode,
      },
    ])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Search mode starts a new thread for every question.
        body: JSON.stringify({ message: content, threadId: null, mode }),
      })
      const data: APIResponse = await res.json().catch(() => ({}) as APIResponse)

      if (!res.ok || data.error) {
        finish(placeholderId, { content: data.error || TEXT.generic, isError: true })
      } else if (mode === "research" && data.research_id) {
        pollResearch(data.research_id, placeholderId)
      } else if (data.thread_id) {
        pollThread(data.thread_id, placeholderId)
      } else {
        finish(placeholderId, { content: TEXT.generic, isError: true })
      }
    } catch (error) {
      console.error("Sending the message failed", error)
      finish(placeholderId, { content: TEXT.network, isError: true })
    }
  }

  return (
    <div className="flex h-full flex-col bg-black text-white">
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center">
            <img className="h-10 w-10" src="./newglobe.svg" alt="" />
            <h1 className="mb-3 text-3xl font-semibold">What can I help with?</h1>
            <p className="mb-12 max-w-md text-sm text-zinc-400">
              Use Search for quick answers from the web, or Deep research for a longer report with sources.
            </p>
            <div className="w-full max-w-3xl">
              <MessageInput onSend={sendMessage} isLoading={isBusy} />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div className="mt-4">
              <MessageInput onSend={sendMessage} isLoading={isBusy} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  )
}
