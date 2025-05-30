/**
 * Types for the chat functionality
 */

export type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt?: Date;
    toolCalls?: ToolCall[];
    mode?: 'search' | 'research'; // Which mode was used
    researchData?: ResearchData; // For research mode responses
    isError?: boolean; // For error messages
    isLoading?: boolean; // For in-progress research
  };
  
  export type ToolCall = {
    id: string;
    type: string;
    name: string;
    args: Record<string, any>;
  };
  
  export type ResearchData = {
    search_queries: string[];
    iterations: number;
    contexts: number;
  };
  
  export type ChatState = {
    messages: Message[];
    threadId: string | null;
    isLoading: boolean;
    error: string | null;
  };
  
  export type APIResponse = {
    thread_id: string;
    messages: {
      role: string;
      content: string;
      tool_calls?: ToolCall[];
    }[];
    research_data?: ResearchData;
    status?: 'in_progress' | 'completed' | 'error';
    research_id?: string;
    progress?: number;
    total_iterations?: number;
  };
  
  export type ChatSettings = {
    searchEnabled: boolean;
    model: string;
    temperature: number;
  };