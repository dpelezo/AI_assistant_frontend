import { NextResponse } from 'next/server';

// Define the types for our requests and responses
type ChatRequestBody = {
  message: string;
  threadId?: string | null;
  mode: 'search' | 'research';
};

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { message, threadId, mode = 'search' } = await request.json() as ChatRequestBody;
    console.log(`Processing ${mode} request for message: ${message}`);
    
    // Get the API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Handle based on mode
    if (mode === 'research') {
      // For research mode, start the research process
      console.log("Starting deep research process");
      const requestBody = {
        query: message,
        iteration_limit: 3
      };
      
      // Make API call to start research
      const response = await fetch(`${apiUrl}/api/research/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Research API request failed with status ${response.status}`);
      }
      
      // Get the research ID
      const initialResponse = await response.json();
      console.log(`Research started with ID: ${initialResponse.research_id}`);
      
      // Return the research ID and a temporary message
      return NextResponse.json({
        thread_id: initialResponse.research_id, // Use research_id as thread_id
        research_id: initialResponse.research_id,
        status: 'in_progress',
        progress: 0,
        total_iterations: 3, // Match iteration_limit
        messages: [
          {
            role: "assistant",
            content: "I'm researching that for you. This may take a minute...",
            tool_calls: [
              {
                name: "deep_research",
                args: { query: message },
                id: initialResponse.research_id
              }
            ]
          }
        ]
      });
      
    } else {
      // Regular chat with search mode
      console.log("Processing regular chat with search");
      const requestBody = {
        content: message,
        thread_id: threadId || null
      };
      
      // Call the chat API
      console.log(`Calling API at ${apiUrl}/api/query`);
      console.log(`Request body: ${JSON.stringify(requestBody)}`);
      
      const response = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Chat API request failed with status ${response.status}`);
      }
      
      // Get the response
      const data = await response.json();
      console.log(`Received response from chat API: ${JSON.stringify(data)}`);
      
      // Ensure the 'ai' role is changed to 'assistant' for consistency
      if (data.messages) {
        data.messages = data.messages.map((msg: any) => {
          if (msg.role === "ai") {
            return { ...msg, role: "assistant" };
          }
          return msg;
        });
      }
      
      // Return the chat response directly
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

// GET endpoint to check research status and get final result
export async function GET(request: Request) {
  try {
    // Get the research_id or thread_id from the query string
    const { searchParams } = new URL(request.url);
    const researchId = searchParams.get('research_id');
    const threadId = searchParams.get('thread_id');
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Handle research status check
    if (researchId) {
      console.log(`Checking status for research ID: ${researchId}`);
      
      // First check research status
      const statusResponse = await fetch(`${apiUrl}/api/research/status/${researchId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Failed to check research status: ${statusResponse.status}`);
      }
      
      const statusData = await statusResponse.json();
      console.log(`Research status: ${statusData.status}`);
      
      if (statusData.status === 'completed') {
        // Research is complete, fetch the result
        console.log(`Research complete, fetching result`);
        const resultResponse = await fetch(`${apiUrl}/api/research/result/${researchId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!resultResponse.ok) {
          throw new Error(`Failed to fetch research result: ${resultResponse.status}`);
        }
        
        const researchData = await resultResponse.json();
        console.log(`Received research result with length: ${researchData.report?.length || 0}`);
        
        // Debug the full research data if report is missing
        if (!researchData.report) {
          console.error('No report found in research data');
          console.log('Full research data:', JSON.stringify(researchData));
          
          return NextResponse.json({
            thread_id: researchId,
            status: 'error',
            error: 'Research completed but no report was generated',
            messages: [
              {
                role: "assistant",
                content: "Research completed but encountered an issue generating the report. Please try again with a more specific query.",
                isError: true
              }
            ]
          });
        }
        
        // Return the raw research data without any formatting
        // Just pass it through to the frontend with the appropriate structure
        return NextResponse.json({
          thread_id: researchId,
          status: 'completed',
          messages: [
            {
              role: "assistant",
              content: researchData.report,
              tool_calls: [
                {
                  name: "deep_research",
                  args: { query: researchData.query },
                  id: researchId
                }
              ]
            }
          ],
          research_data: {
            search_queries: researchData.search_queries || [],
            iterations: researchData.iterations || 0,
            contexts: researchData.contexts || []
          }
        });
      } else if (statusData.status === 'error') {
        // Handle research errors
        return NextResponse.json({
          thread_id: researchId,
          status: 'error',
          error: 'Research failed to complete',
          messages: [
            {
              role: "assistant",
              content: "Sorry, I encountered an error while researching that topic.",
              isError: true
            }
          ]
        });
      } else {
        // Research is still in progress
        return NextResponse.json({
          thread_id: researchId,
          research_id: researchId,
          status: 'in_progress',
          progress: statusData.progress || 0, 
          total_iterations: statusData.total_iterations || 3,
          messages: [
            {
              role: "assistant",
              content: `Researching... (${statusData.progress || 0}/${statusData.total_iterations || 3})`,
              isLoading: true
            }
          ]
        });
      }
    } 
    // Handle thread messages fetch
    else if (threadId) {
      console.log(`Fetching thread messages for thread ID: ${threadId}`);
      
      const response = await fetch(`${apiUrl}/api/thread/${threadId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch thread messages: ${response.status}`);
      }
      
      const threadData = await response.json();
      console.log(`Received thread data with ${threadData.messages?.length || 0} messages`);
      
      // Fix the "ai" vs "assistant" role inconsistency
      if (threadData.messages) {
        threadData.messages = threadData.messages.map((msg: any) => {
          // Backend uses "ai", frontend expects "assistant"
          if (msg.role === "ai") {
            return { ...msg, role: "assistant" };
          }
          return msg;
        });
      }
      
      // Return the thread data
      return NextResponse.json(threadData);
    } 
    else {
      return NextResponse.json(
        { error: 'Missing research_id or thread_id parameter' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error handling GET request:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}