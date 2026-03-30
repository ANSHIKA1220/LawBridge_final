import { useState, useRef, useEffect } from "react";
import { User } from "../App";
import { Send, Search, BookOpen, Scale, AlertCircle, Loader2, ChevronRight, LayoutDashboard, FileText, MessageSquare } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import { collection, addDoc, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

interface Message {
  role: "user" | "model";
  text: string;
  cases?: { title: string; url: string }[];
  status?: string;
}

export default function LegalQA({ user }: { user: User }) {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Ask your legal question. I'll search Indian Case Law and analyze relevant statutes for you." }
  ]);
  const [history, setHistory] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    if (location.state?.initialQuestion) {
      setInput(location.state.initialQuestion);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "legal_qa"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(historyData);
      } catch (error) {
        console.error("Error fetching history:", error);
        handleFirestoreError(error, OperationType.LIST, "legal_qa");
      }
    };
    fetchHistory();
  }, [user.uid]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsThinking(true);

    try {
      // 1. Research Step
      setThinkingStatus("Searching Indian Kanoon for relevant cases...");
      const researchRes = await axios.post("/api/research", { query: userMessage });
      const cases = researchRes.data.cases || [];
      const caseContext = cases.map((c: any) => `Title: ${c.title}\nSnippet: ${c.snippet}`).join("\n\n");

      // 2. Synthesis Step
      setThinkingStatus("Analyzing BNS/BNSS and synthesizing answer...");
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3-flash-preview";
      
      const systemInstruction = `You are a Senior Legal-Tech Specialist for "Law Bridge". 
      Your goal is to provide accurate legal information based on Indian Law (IPC, CrPC, and the new BNS/BNSS).
      
      Context from Indian Kanoon (Relevant Cases):
      ${caseContext}
      
      Guidelines:
      - Prioritize Indian Law.
      - Mention specific sections of BNS/BNSS if applicable.
      - Include a standard legal disclaimer: "Disclaimer: This is for informational purposes and not professional legal advice."
      - Be concise and professional.`;

      const stream = await ai.models.generateContentStream({
        model,
        contents: [
          { role: "user", parts: [{ text: userMessage }] }
        ],
        config: { systemInstruction },
      });

      let fullText = "";
      setMessages(prev => [...prev, { role: "model", text: "" }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullText += chunkText;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            ...newMessages[newMessages.length - 1], 
            text: fullText 
          };
          return newMessages;
        });
      }

      const caseResults = cases.map((c: any) => ({ title: c.title, url: c.url }));
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          ...newMessages[newMessages.length - 1], 
          cases: caseResults 
        };
        return newMessages;
      });

      // Save to Firestore
      try {
        await addDoc(collection(db, "legal_qa"), {
          uid: user.uid,
          query: userMessage,
          response: fullText,
          cases: caseResults,
          createdAt: new Date()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, "legal_qa");
      }

    } catch (error) {
      console.error("Legal QA Error:", error);
      setMessages(prev => [...prev, { 
        role: "model", 
        text: "Sorry, the Legal Agent is having trouble thinking right now. Please try again." 
      }]);
    } finally {
      setIsThinking(false);
      setThinkingStatus("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">
      {/* Sidebar (Same as Dashboard) */}
      <aside className="w-72 flex-shrink-0 hidden lg:block">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sticky top-32">
          <div className="flex items-center gap-4 mb-10 pb-8 border-b border-gray-100">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-primary">{user.name}</h3>
              <p className="text-xs text-gray-400">{user.role} Portal</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { icon: <LayoutDashboard size={18} />, label: "Dashboard", path: "/dashboard" },
              { icon: <FileText size={18} />, label: "Document Analyzer", path: "/document-auditor" },
              { icon: <Search size={18} />, label: "Legal Q&A", path: "/legal-qa" },
              { icon: <Search size={18} />, label: "Case Explorer", path: "/case-explorer" },
              { icon: <MessageSquare size={18} />, label: "Advocate Connect", path: "/advocate-connect" },
            ].map((link, idx) => (
              <Link
                key={idx}
                to={link.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-medium transition-all ${
                  link.path === "/legal-qa" 
                    ? "bg-accent/10 text-primary" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-12 p-6 bg-bg-soft rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Support</p>
            <p className="text-xs font-bold text-primary mb-4">help@lawbridge.in</p>
            <button className="w-full py-3 text-xs font-bold border border-gray-200 rounded-lg hover:bg-white transition-colors">
              Read Disclaimer
            </button>
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex-grow flex flex-col h-[700px] bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="font-bold text-primary serif">Legal Research Agent</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Online & Researching</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-primary transition-colors">
              <AlertCircle size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] ${msg.role === "user" ? "bg-accent text-white rounded-2xl rounded-tr-none" : "bg-bg-soft text-primary rounded-2xl rounded-tl-none"} p-6 shadow-sm`}>
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:serif prose-headings:text-primary">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                
                {msg.cases && msg.cases.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200/50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Relevant Case Law</p>
                    <div className="space-y-2">
                      {msg.cases.map((c, cIdx) => (
                        <a 
                          key={cIdx} 
                          href={c.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100 hover:border-accent transition-all group"
                        >
                          <span className="text-xs font-bold text-primary truncate pr-4">{c.title}</span>
                          <ChevronRight size={14} className="text-gray-300 group-hover:text-accent transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          <AnimatePresence>
            {isThinking && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-bg-soft p-6 rounded-2xl rounded-tl-none flex items-center gap-4">
                  <Loader2 className="animate-spin text-accent" size={18} />
                  <span className="text-sm font-medium text-gray-500 italic">{thinkingStatus}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-100">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about property laws, contracts, or criminal statutes..."
              className="w-full pl-6 pr-16 py-5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
            />
            <button 
              type="submit"
              disabled={isThinking || !input.trim()}
              className="absolute right-3 top-3 w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest font-bold">
            AI can make mistakes. Verify important legal information.
          </p>
        </div>
      </div>
    </div>
  );
}
