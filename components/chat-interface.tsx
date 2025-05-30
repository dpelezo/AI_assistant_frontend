"use client"

import { useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { ChatMessage } from "@/components/chat-message"
import { MessageInput } from "@/components/message-input"
import type { ChatState, Message } from "@/lib/types"

export function ChatInterface() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    threadId: null,
    isLoading: false,
    error: null,
  })
  
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [researchId, setResearchId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Debug state changes
  useEffect(() => {
    console.log("ChatState updated:", chatState)
  }, [chatState])
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatState.messages])
  
  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])
  
  // Fetch thread messages for search mode
  const fetchThreadMessages = async (threadId: string, attemptCount = 0, maxAttempts = 20): Promise<boolean> => {
    try {
      console.log(`Fetching thread messages for threadId: ${threadId} (attempt ${attemptCount + 1}/${maxAttempts})`)
      const response = await fetch(`/api/chat?thread_id=${threadId}`)
      
      if (!response.ok) {
        console.error(`Error response from thread fetch: ${response.status}`)
        throw new Error(`Failed to fetch thread messages: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`Thread messages response:`, data)
      
      // Check if we have messages to update
      if (data.messages && data.messages.length > 1) {
        // Look for AI/assistant messages
        const aiMessages = data.messages.filter(
          (msg: any) => msg.role === "ai" || msg.role === "assistant"
        )
        
        if (aiMessages.length > 0) {
          console.log(`Found ${aiMessages.length} AI messages`)
          const latestAiMessage = aiMessages[aiMessages.length - 1]
          
          // Find the loading message to replace
          const loadingIndex = chatState.messages.findIndex(
            msg => msg.role === "assistant" && msg.isLoading === true
          )
          
          if (loadingIndex !== -1) {
            console.log(`Replacing loading message at index ${loadingIndex}`)
            // Replace the loading message but maintain its position
            setChatState(prev => {
              const updatedMessages = [...prev.messages]
              updatedMessages[loadingIndex] = {
                ...updatedMessages[loadingIndex],
                id: uuidv4(), // Force re-render
                content: latestAiMessage.content,
                createdAt: new Date(),
                isLoading: false,
                toolCalls: latestAiMessage.tool_calls,
                mode: 'search'
              }
              
              return {
                ...prev,
                messages: updatedMessages,
                isLoading: false
              }
            })
          } else {
            console.log(`Adding new AI message`)
            // Add new AI message
            const newMessage: Message = {
              id: uuidv4(),
              role: "assistant",
              content: latestAiMessage.content,
              createdAt: new Date(),
              toolCalls: latestAiMessage.tool_calls,
              mode: 'search'
            }
            
            setChatState(prev => ({
              ...prev,
              messages: [...prev.messages, newMessage],
              isLoading: false
            }))
          }
          
          return true // Success - found AI message
        }
      }
      
      // If we didn't find an AI message and haven't reached max attempts
      if (attemptCount < maxAttempts - 1) {
        // Wait and try again
        return new Promise(resolve => {
          setTimeout(async () => {
            const result = await fetchThreadMessages(threadId, attemptCount + 1, maxAttempts)
            resolve(result)
          }, 1000) // 1 second interval
        })
      } else {
        console.log(`Reached max attempts (${maxAttempts}) for thread ${threadId}`)
        
        // Handle timeout - find the loading message
        const loadingIndex = chatState.messages.findIndex(
          msg => msg.role === "assistant" && msg.isLoading === true
        )
        
        if (loadingIndex !== -1) {
          // Replace with timeout message but maintain its position
          setChatState(prev => {
            const updatedMessages = [...prev.messages]
            updatedMessages[loadingIndex] = {
              ...updatedMessages[loadingIndex],
              id: uuidv4(),
              content: "Sorry, the response is taking longer than expected. Please try again.",
              createdAt: new Date(),
              isLoading: false,
              isError: true
            }
            
            return {
              ...prev,
              messages: updatedMessages,
              isLoading: false,
              error: "Response timeout"
            }
          })
        }
        
        return false // Failed to get AI message
      }
    } catch (error: any) {
      console.error("Error fetching thread messages:", error)
      
      // Only show error if we've reached max attempts
      if (attemptCount >= maxAttempts - 1) {
        // Find the loading message
        const loadingIndex = chatState.messages.findIndex(
          msg => msg.role === "assistant" && msg.isLoading === true
        )
        
        if (loadingIndex !== -1) {
          // Replace with error message but maintain its position
          setChatState(prev => {
            const updatedMessages = [...prev.messages]
            updatedMessages[loadingIndex] = {
              ...updatedMessages[loadingIndex],
              id: uuidv4(),
              content: `Error fetching response: ${error.message}`,
              createdAt: new Date(),
              isLoading: false,
              isError: true
            }
            
            return {
              ...prev,
              messages: updatedMessages,
              isLoading: false,
              error: error.message
            }
          })
        }
        
        return false // Failed with error
      }
      
      // Try again if we haven't reached max attempts
      return new Promise(resolve => {
        setTimeout(async () => {
          const result = await fetchThreadMessages(threadId, attemptCount + 1, maxAttempts)
          resolve(result)
        }, 1000)
      })
    }
  }
  
  // Start polling for research results
  const startPollingResearch = (id: string) => {
    console.log(`Starting polling for research ID: ${id}`)
    
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }
    
    setResearchId(id)
    
    // Set up polling every 2 seconds
    const interval = setInterval(async () => {
      try {
        console.log(`Polling for research ID: ${id}`)
        const response = await fetch(`/api/chat?research_id=${id}`)
        
        if (!response.ok) {
          console.error(`Error response from polling: ${response.status}`)
          throw new Error(`Failed to check research status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log(`Research poll response:`, data)
        
        if (data.status === 'completed') {
          // Research is complete, stop polling
          console.log("Research complete, stopping polling")
          clearInterval(interval)
          setPollingInterval(null)
          setResearchId(null)
          
          // Check if we have a valid report
          if (!data.messages || !data.messages[0] || !data.messages[0].content) {
            console.error("No valid research content found in response:", data)
          } else {
            console.log(`Research content length: ${data.messages[0].content.length}`)
          }
          
          // Find the assistant message index to update
          const assistantIndex = chatState.messages.findIndex(
            msg => msg.role === "assistant" && msg.isLoading === true
          )
          
          // Process the research data
          let formattedContent = "";
          
          // If content is a fallback content (has Key Findings and Context headers)
          if (
            data.messages && 
            data.messages[0] && 
            data.messages[0].content &&
            typeof data.messages[0].content === 'string' &&
            data.messages[0].content.includes("# Research Report") &&
            data.messages[0].content.includes("## Key Findings") &&
            data.messages[0].content.includes("### Context")
          ) {
            // We received the fallback report format - Let's create our own formatted content
            console.log("Creating nicely formatted research report from raw data")
            formattedContent = formatResearchReport(data.research_data, data.messages[0].content)
          } else if (data.messages && data.messages[0] && data.messages[0].content) {
            // Use the content directly if it's a proper report
            formattedContent = data.messages[0].content;
          } else {
            formattedContent = "Research completed but no report was generated.";
          }
          
          if (assistantIndex !== -1) {
            console.log(`Updating existing message at index ${assistantIndex}`)
            // Update the existing message with the research result
            setChatState(prev => {
              const updatedMessages = [...prev.messages]
              updatedMessages[assistantIndex] = {
                ...updatedMessages[assistantIndex],
                id: uuidv4(), // Generate a new ID to force re-render
                content: formattedContent,
                createdAt: new Date(),
                isLoading: false,
                toolCalls: data.messages && data.messages[0] ? data.messages[0].tool_calls : null,
                mode: 'research',
                researchData: data.research_data
              }
              
              return {
                ...prev,
                messages: updatedMessages,
                isLoading: false,
                threadId: data.thread_id
              }
            })
          } else {
            console.log(`Adding new message with research results`)
            // Add a new message with the research result
            const newMessage: Message = {
              id: uuidv4(),
              role: "assistant",
              content: formattedContent,
              createdAt: new Date(),
              toolCalls: data.messages && data.messages[0] ? data.messages[0].tool_calls : null,
              mode: 'research',
              researchData: data.research_data
            }
            
            setChatState(prev => ({
              ...prev,
              messages: [...prev.messages, newMessage],
              isLoading: false,
              threadId: data.thread_id
            }))
          }
        } else if (data.status === 'error') {
          // Research failed, stop polling and show error
          console.error("Research failed")
          clearInterval(interval)
          setPollingInterval(null)
          setResearchId(null)
          
          // Find the loading message to replace
          const loadingIndex = chatState.messages.findIndex(
            msg => msg.role === "assistant" && msg.isLoading === true
          )
          
          if (loadingIndex !== -1) {
            // Replace the loading message with an error message
            setChatState(prev => {
              const updatedMessages = [...prev.messages]
              updatedMessages[loadingIndex] = {
                ...updatedMessages[loadingIndex],
                id: uuidv4(),
                content: "Sorry, there was an error processing your research request.",
                createdAt: new Date(),
                isLoading: false,
                isError: true
              }
              
              return {
                ...prev,
                messages: updatedMessages,
                isLoading: false,
                error: "Research failed"
              }
            })
          } else {
            // Add a new error message
            const errorMessage: Message = {
              id: uuidv4(),
              role: "assistant",
              content: "Sorry, there was an error processing your research request.",
              createdAt: new Date(),
              isError: true
            }
            
            setChatState(prev => ({
              ...prev,
              messages: [...prev.messages, errorMessage],
              isLoading: false,
              error: "Research failed"
            }))
          }
        } else if (data.status === 'in_progress') {
          // Update the loading message with progress if available
          const assistantIndex = chatState.messages.findIndex(
            msg => msg.role === "assistant" && msg.isLoading === true
          )
          
          if (assistantIndex !== -1 && (data.progress || data.total_iterations)) {
            setChatState(prev => {
              const updatedMessages = [...prev.messages]
              updatedMessages[assistantIndex] = {
                ...updatedMessages[assistantIndex],
                content: `Researching... (${data.progress || 0}/${data.total_iterations || 3})`,
              }
              
              return {
                ...prev,
                messages: updatedMessages
              }
            })
          }
        }
      } catch (error: any) {
        console.error("Error checking research status:", error)
        // Don't stop polling on temporary network errors
      }
    }, 2000)
    
    setPollingInterval(interval)
  }
  
  // Helper function to format research data into a nice report
  const formatResearchReport = (researchData: any, originalReport: string): string => {
    if (!researchData) return originalReport || "No research data available.";
    
    const query = researchData.query || "this topic";
    const searchQueries = researchData.search_queries || [];
    const contexts = researchData.contexts || [];
    const iterations = researchData.iterations || 0;
    
    // Create a nicely formatted report
    let formattedReport = `# Research Report: ${query}\n\n`;
    
    // Include search approach section with queries used
    if (searchQueries.length > 0) {
      formattedReport += `## Research Approach\n\n`;
      formattedReport += `I conducted research over ${iterations} iterations using the following search queries:\n\n`;
      
      searchQueries.forEach((query: string) => {
        formattedReport += `- ${query}\n`;
      });
      
      formattedReport += `\n`;
    }
    
    // Include findings from contexts - but filter out useless ones
    if (contexts.length > 0) {
      formattedReport += `## Key Findings\n\n`;
      
      // Filter out contexts that are too short or are UI elements
      const usefulContexts = contexts.filter((context: string) => {
        return (
          context && 
          typeof context === 'string' && 
          context.length > 50 && 
          !context.includes("[About]") && 
          !context.includes("[Press]") && 
          !context.includes("[iframe]")
        );
      });
      
      // Limit to a reasonable number of contexts to avoid overwhelming the report
      const displayContexts = usefulContexts.slice(0, 8);
      
      // Add each context as a bullet point
      displayContexts.forEach((context: string) => {
        formattedReport += `- ${context}\n\n`;
      });
    }
    
    // Add summary
    formattedReport += `## Summary\n\n`;
    formattedReport += `This research on "${query}" was conducted using ${searchQueries.length} search queries over ${iterations} iterations. `;
    formattedReport += `A total of ${contexts.length} relevant information sources were analyzed to compile this report.`;
    
    return formattedReport;
  }
  
  const sendMessage = async (content: string, mode: 'search' | 'research' = 'search') => {
    console.log(`Sending message in ${mode} mode: ${content}`)
    
    // Add user message to chat
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      createdAt: new Date(),
    }
    
    // Add the user message first
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }))
    
    try {
      // For search mode, always use a new thread ID to ensure fresh context
      const useThreadId = mode === 'search' ? null : chatState.threadId;
      
      // Call API with the selected mode
      console.log(`Calling API with mode: ${mode}, threadId: ${useThreadId}`)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          threadId: useThreadId,
          mode, // Send the selected mode to the API
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("API Response:", data)
      
      // Check for errors in the response
      if (data.error) {
        throw new Error(data.error)
      }
      
      if (mode === 'research' && data.status === 'in_progress' && data.research_id) {
        console.log(`Research in progress, research_id: ${data.research_id}`)
        // For research mode in progress, add a loading message
        const loadingMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: data.messages && data.messages[0] ? data.messages[0].content : "Researching your query...",
          createdAt: new Date(),
          isLoading: true,
          mode: 'research'
        }
        
        // Add the loading message after the user message
        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, loadingMessage],
          threadId: data.thread_id,
          // Keep isLoading: true while researching
        }))
        
        // Start polling for the research result
        startPollingResearch(data.research_id)
      } else if (mode === 'search') {
        // For search mode - add a loading message and start recursive fetch
        console.log("Processing search response, thread ID:", data.thread_id)
        
        // Store the thread ID and set up a loading message
        const loadingMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: "Thinking...",
          createdAt: new Date(),
          isLoading: true,
          mode: 'search'
        }
        
        // Add the loading message after the user message
        setChatState((prev) => ({
          ...prev,
          threadId: data.thread_id,
          isLoading: true,
          messages: [...prev.messages, loadingMessage],
        }))
        
        // Start recursive fetching instead of polling
        fetchThreadMessages(data.thread_id)
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      
      // Add error message to chat
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `Sorry, an error occurred: ${error.message}`,
        createdAt: new Date(),
        isError: true
      }
      
      // Add the error message after the user message
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
        messages: [...prev.messages, errorMessage],
      }))
    }
  }
  
  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Empty Messages Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {chatState.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center">
            <img className="h-10 w-10" src="./newglobe.svg" alt="" />
            <h1 className="text-3xl font-semibold mb-16">What can I help with?</h1>
            <div className="w-full max-w-3xl">
              <MessageInput onSend={sendMessage} isLoading={chatState.isLoading} />
            </div>
          </div>
        ) : (
          <>
            <div className="w-full max-w-3xl space-y-4">
              {chatState.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {chatState.isLoading && !researchId && (
                <div className="flex justify-center py-4">
                  <div className="animate-pulse flex space-x-2">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <MessageInput onSend={sendMessage} isLoading={chatState.isLoading || !!researchId} />
              </div>
            </div>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}