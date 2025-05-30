"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Globe, FileSearch, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  onSend: (message: string, mode: 'search' | 'research') => void
  isLoading: boolean
}

export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<'search' | 'research'>('search')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSend(input, mode)
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const toggleMode = (newMode: 'search' | 'research') => {
    setMode(newMode)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          placeholder="Ask anything"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-12 resize-none rounded-full bg-zinc-800/70 border-zinc-700 text-zinc-200 pl-12 pr-12 py-3"
          disabled={isLoading}
        />
        
        <div className="absolute left-3 top-3">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-full bg-zinc-700/50 text-zinc-400"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add attachment</span>
          </Button>
        </div>
        
        <div className="absolute right-3 bottom-6">
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={isLoading || !input.trim()}
            className="h-8 w-8 rounded-full bg-white text-black hover:bg-gray-200"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
      
      <div className="flex justify-center mt-2 space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "text-xs bg-zinc-800/70 rounded-full px-4",
            mode === 'search' 
              ? "text-blue-400 border border-blue-500/30" 
              : "text-zinc-400 hover:text-blue-400"
          )}
          onClick={() => toggleMode('search')}
        >
          <Globe className="h-3 w-3 mr-1" /> 
          Search
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "text-xs bg-zinc-800/70 rounded-full px-4",
            mode === 'research' 
              ? "text-blue-400 border border-blue-500/30" 
              : "text-zinc-400 hover:text-blue-400"
          )}
          onClick={() => toggleMode('research')}
        >
          <FileSearch className="h-3 w-3 mr-1" />
          Deep research
        </Button>
      </div>
    </div>
  )
}