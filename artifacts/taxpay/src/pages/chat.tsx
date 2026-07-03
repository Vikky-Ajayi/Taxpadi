import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import {
  useListChatMessages,
  useSendChatMessage,
  getListChatMessagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Zap,
  Shield,
  Loader2,
  Mic,
  MicOff,
  Plus,
  Link as LinkIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Language = "en" | "pidgin" | "ha" | "ig";

const LANG_SPEECH_CODES: Record<Language, string> = {
  en: "en-NG",
  pidgin: "en-NG",
  ha: "ha-NG",
  ig: "ig-NG",
};

// ─── Session ID management ────────────────────────────────────────────────────

function getOrCreateSessionId(userId: number): string {
  const key = `taxpay_session_${userId}`;
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const fresh = `sess_${userId}_${Date.now()}`;
  localStorage.setItem(key, fresh);
  return fresh;
}

function createNewSession(userId: number): string {
  const key = `taxpay_session_${userId}`;
  const fresh = `sess_${userId}_${Date.now()}`;
  localStorage.setItem(key, fresh);
  return fresh;
}

// ─── Mono Connect button component ───────────────────────────────────────────

function MonoConnectBanner() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="my-2 rounded-xl border border-[#075e54]/30 bg-white dark:bg-card overflow-hidden shadow-sm">
      <div className="bg-[#075e54]/10 dark:bg-primary/10 px-4 py-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-[#075e54] dark:bg-primary flex items-center justify-center shrink-0">
          <LinkIcon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#075e54] dark:text-primary leading-tight">
            Connect Your Bank Account
          </p>
          <p className="text-xs text-muted-foreground">
            Read-only access · Secured by Mono · 2 minutes
          </p>
        </div>
        <Button
          size="sm"
          className="shrink-0 bg-[#075e54] dark:bg-primary hover:bg-[#054d45] dark:hover:bg-primary/90 text-white text-xs h-8"
          onClick={() => setShowGuide(!showGuide)}
        >
          {showGuide ? "Close" : "Connect"}
        </Button>
      </div>
      {showGuide && (
        <div className="px-4 py-3 text-sm text-foreground space-y-2 border-t border-border">
          <p className="font-medium">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
            <li>Click "Connect" to open the Mono secure bank portal</li>
            <li>Select your Nigerian bank (GTB, Access, Zenith, UBA, etc.)</li>
            <li>Enter your internet banking credentials in Mono's portal</li>
            <li>TaxPay receives <strong>read-only</strong> transaction history — we cannot move money</li>
            <li>Your transactions are automatically classified and your taxes calculated</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded-lg">
            🔒 Mono is regulated by the CBN and uses bank-grade encryption. Your credentials are never stored by TaxPay.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Mono integration requires a MONO_PUBLIC_KEY to be configured. Contact your TaxPay administrator to enable this feature.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: { id: number; role: string; content: string; createdAt: Date | string } }) {
  const isUser = msg.role === "user";

  // Parse [MONO_CONNECT] marker out of assistant messages
  const parts = isUser
    ? [{ type: "text" as const, content: msg.content }]
    : msg.content.split(/(\[MONO_CONNECT\])/g).map((part) =>
        part === "[MONO_CONNECT]"
          ? { type: "mono" as const, content: "" }
          : { type: "text" as const, content: part }
      );

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 shadow-sm relative ${
          isUser
            ? "bg-[#dcf8c6] dark:bg-primary text-[#303030] dark:text-primary-foreground rounded-tr-none"
            : "bg-white dark:bg-card text-[#303030] dark:text-foreground rounded-tl-none border border-border"
        }`}
      >
        {parts.map((part, i) =>
          part.type === "mono" ? (
            <MonoConnectBanner key={i} />
          ) : part.content.trim() ? (
            <p key={i} className="text-sm whitespace-pre-wrap">
              {part.content.trim()}
            </p>
          ) : null
        )}
        <div
          className={`text-[10px] mt-1.5 flex justify-end ${
            isUser
              ? "text-[#132d3d]/60 dark:text-primary-foreground/70"
              : "text-muted-foreground"
          }`}
        >
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Voice note hook ──────────────────────────────────────────────────────────

function useVoiceNote(language: Language) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startRecording = useCallback(
    (onResult: (text: string) => void) => {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new SpeechRecognition() as any;
      recognition.lang = LANG_SPEECH_CODES[language];
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript ?? "";
        if (transcript) onResult(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    },
    [language]
  );

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  return { isRecording, isSupported, startRecording, stopRecording };
}

// ─── Main chat page ───────────────────────────────────────────────────────────

export default function ChatPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<Language>(
    (user?.language as Language) || "en"
  );

  // Session management — unique per user, persisted in localStorage.
  // Initialise with null and resolve in an effect once user is available, so we
  // never permanently bind to a guest ID when the auth context loads asynchronously.
  const [sessionId, setSessionId] = useState<string | null>(
    user ? getOrCreateSessionId(user.id) : null
  );

  useEffect(() => {
    if (user && !sessionId) {
      setSessionId(getOrCreateSessionId(user.id));
    }
  }, [user, sessionId]);

  const { data: messages, isLoading } = useListChatMessages(
    { sessionId: sessionId ?? undefined },
    { query: { refetchInterval: 5000, enabled: !!sessionId } }
  );

  const sendMessageMutation = useSendChatMessage();

  const { isRecording, isSupported, startRecording, stopRecording } =
    useVoiceNote(language);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track language from recent messages so header label stays in sync
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.language && lastMsg.language !== language) {
        setLanguage(lastMsg.language as Language);
      }
    }
  }, [messages]);

  const handleSend = (overrideContent?: string) => {
    const content = overrideContent ?? input;
    if (!content.trim() || !sessionId) return;

    sendMessageMutation.mutate(
      {
        data: {
          content,
          sessionId,
          language,
        },
      },
      {
        onSuccess: (response) => {
          setInput("");
          // Update language if the response changed it
          if (response?.language && response.language !== language) {
            setLanguage(response.language as Language);
          }
          queryClient.invalidateQueries({
            queryKey: getListChatMessagesQueryKey(),
          });
        },
      }
    );
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording((transcript) => {
        setInput(transcript);
      });
    }
  };

  const handleNewSession = () => {
    if (!user) return;
    const newId = createNewSession(user.id);
    setSessionId(newId);
    queryClient.invalidateQueries({ queryKey: getListChatMessagesQueryKey() });
  };

  const LANG_LABELS: Record<Language, string> = {
    en: "EN",
    pidgin: "PID",
    ha: "HA",
    ig: "IG",
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
            <h2 className="font-bold text-white leading-tight">
              TaxPay Assistant
            </h2>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>{" "}
              Online ·{" "}
              <span className="font-medium">{LANG_LABELS[language]}</span>
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/10 text-xs gap-1.5 h-8 px-3"
          onClick={handleNewSession}
          title="Start a new conversation"
        >
          <Plus className="h-3.5 w-3.5" />
          New chat
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#e5ddd5] dark:bg-background/95 relative space-y-4">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
          style={{
            backgroundImage:
              'url("https://www.transparenttextures.com/patterns/cubes.png")',
          }}
        ></div>

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
          messages?.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}

        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-card rounded-lg rounded-tl-none p-3 shadow-sm border border-border">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#075e54]/60 dark:bg-primary/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-[#075e54]/60 dark:bg-primary/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-[#075e54]/60 dark:bg-primary/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice recording indicator */}
      {isRecording && (
        <div className="bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-900 px-4 py-2 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Recording… speak now, then tap mic to stop
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-[#f0f0f0] dark:bg-card border-t flex items-end gap-2">
        {/* Voice note button */}
        {isSupported && (
          <Button
            size="icon"
            variant="ghost"
            className={`h-11 w-11 rounded-full shrink-0 ${
              isRecording
                ? "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-200"
                : "text-muted-foreground hover:bg-muted"
            }`}
            onClick={handleVoiceToggle}
            title={isRecording ? "Stop recording" : "Send a voice note"}
            disabled={sendMessageMutation.isPending}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        )}

        <Textarea
          placeholder={
            isRecording
              ? "Listening…"
              : "Ask anything about your taxes…"
          }
          className="min-h-[44px] max-h-32 resize-none rounded-2xl bg-white dark:bg-background py-3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sendMessageMutation.isPending || isRecording}
        />

        <Button
          size="icon"
          className="h-11 w-11 rounded-full shrink-0 bg-[#00a884] dark:bg-primary hover:bg-[#008f6f] dark:hover:bg-primary/90 text-white shadow-md"
          onClick={() => handleSend()}
          disabled={!input.trim() || sendMessageMutation.isPending}
        >
          {sendMessageMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5 ml-1" />
          )}
        </Button>
      </div>
    </div>
  );
}
