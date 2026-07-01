import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useListChatMessages, useSendChatMessage, getListChatMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Zap, Shield, Loader2 } from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"en" | "pidgin" | "ha" | "ig">(user?.language || "en");
  
  // Using a hardcoded session ID for the mockup to keep chat history isolated
  const sessionId = "session_default_01";

  const { data: messages, isLoading } = useListChatMessages(
    { sessionId },
    { query: { refetchInterval: 3000 } } // Poll for updates occasionally
  );

  const sendMessageMutation = useSendChatMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    sendMessageMutation.mutate(
      { 
        data: { 
          content: input, 
          sessionId,
          language 
        } 
      },
      {
        onSuccess: () => {
          setInput("");
          queryClient.invalidateQueries({ queryKey: getListChatMessagesQueryKey() });
        }
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[800px] border rounded-xl overflow-hidden shadow-md animate-in fade-in duration-500">
      {/* WhatsApp-style Header */}
      <div className="bg-[#075e54] dark:bg-sidebar text-white p-3 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarFallback className="bg-primary-foreground text-primary">
              <Zap className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-white leading-tight">TaxPay Assistant</h2>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
            <SelectTrigger className="h-8 w-[110px] bg-white/10 border-none text-white focus:ring-0 focus:ring-offset-0 text-xs">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="pidgin">Pidgin</SelectItem>
              <SelectItem value="ha">Hausa</SelectItem>
              <SelectItem value="ig">Igbo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5] dark:bg-background/95 relative space-y-4">
        {/* Background texture matching WhatsApp vibe */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        
        <div className="flex justify-center mb-6">
          <div className="bg-[#d4eaf7] dark:bg-primary/20 text-[#132d3d] dark:text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm flex items-center gap-2">
            <Shield className="h-3 w-3" />
            Messages are private and end-to-end encrypted
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          messages?.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 shadow-sm relative ${
                    isUser 
                      ? "bg-[#dcf8c6] dark:bg-primary text-[#303030] dark:text-primary-foreground rounded-tr-none" 
                      : "bg-white dark:bg-card text-[#303030] dark:text-foreground rounded-tl-none border border-border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <div className={`text-[10px] mt-1 flex justify-end ${isUser ? "text-[#132d3d]/60 dark:text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-card rounded-lg rounded-tl-none p-3 shadow-sm border border-border">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#f0f0f0] dark:bg-card border-t flex items-end gap-2">
        <Textarea 
          placeholder="Ask about your tax calculation, reliefs, or filing..."
          className="min-h-[44px] max-h-32 resize-none rounded-2xl bg-white dark:bg-background py-3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sendMessageMutation.isPending}
        />
        <Button 
          size="icon" 
          className="h-11 w-11 rounded-full shrink-0 bg-[#00a884] dark:bg-primary hover:bg-[#008f6f] dark:hover:bg-primary/90 text-white shadow-md"
          onClick={handleSend}
          disabled={!input.trim() || sendMessageMutation.isPending}
        >
          {sendMessageMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-1" />}
        </Button>
      </div>
    </div>
  );
}
