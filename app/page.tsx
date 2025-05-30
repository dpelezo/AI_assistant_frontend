import { ChatInterface } from "@/components/chat-interface";

export default function Home() {
  return (
    <main className="flex h-screen flex-col">
      <div className="flex flex-col flex-1 max-w-6xl mx-auto w-full">
        <ChatInterface />
      </div>
    </main>
  );
}