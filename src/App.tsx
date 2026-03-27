import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, MessageSquare, X, ChevronRight, RefreshCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getChatResponse } from "./services/gemini";
import { cn } from "./lib/utils";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "What is OmniBot?",
  "How do I install it?",
  "Is it free?",
  "Can I customize it?",
  "Does it support multiple languages?"
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "model",
      text: "Hello! I'm OmniBot, your friendly FAQ assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const responseText = await getChatResponse(text, history);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: responseText || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: "Oops! Something went wrong. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "1",
        role: "model",
        text: "Hello! I'm OmniBot, your friendly FAQ assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">OmniBot</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={resetChat}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-100"
            title="Reset Chat"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex w-full",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex gap-3 max-w-[85%] md:max-w-[70%]",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm",
                      message.role === "user" ? "bg-indigo-100 text-indigo-600" : "bg-white border border-neutral-200 text-neutral-600"
                    )}>
                      {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl shadow-sm",
                      message.role === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-none" 
                        : "bg-white border border-neutral-200 text-neutral-800 rounded-tl-none"
                    )}>
                      <div className="prose prose-sm max-w-none prose-neutral dark:prose-invert">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                      <div className={cn(
                        "text-[10px] mt-1.5 opacity-60 font-medium",
                        message.role === "user" ? "text-right" : "text-left"
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-neutral-200 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">OmniBot is thinking</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick Questions */}
        {messages.length < 5 && (
          <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50/50">
            <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto no-scrollbar py-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium text-neutral-600 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2 group"
                >
                  {q}
                  <ChevronRight size={14} className="text-neutral-300 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-neutral-200">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything..."
              className="w-full bg-neutral-100 border-none rounded-2xl px-5 py-4 pr-14 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none text-neutral-800 placeholder:text-neutral-400 font-medium shadow-inner"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={cn(
                "absolute right-2 top-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md",
                input.trim() && !isLoading 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95" 
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              )}
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-center text-[10px] text-neutral-400 mt-3 font-medium uppercase tracking-widest">
            Powered by Gemini AI • OmniBot v1.0
          </p>
        </div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
