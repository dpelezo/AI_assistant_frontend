import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Assistant",
  description: "Chat with an AI assistant powered by Claude",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-foreground`}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b">
            <div className="container flex justify-between items-center h-16">
              <div className="flex font-bold p-4">
              <img className="h-6 w-6 " src="./logo.svg" alt="" />
                <span className="text-primary text-1xl">Aime</span>
              </div>
              <div className="flex space-x-2">
                <button className="text-sm px-4 py-2 rounded-md border">
                  Sign In
                </button>
                <button className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground">
                  Sign Up
                </button>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}