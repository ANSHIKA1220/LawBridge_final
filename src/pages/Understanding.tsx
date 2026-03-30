import { useState, useEffect } from "react";
import { User } from "../App";
import { 
  Search, 
  FileText, 
  LayoutDashboard, 
  BookOpen, 
  Scale, 
  MessageSquare, 
  Loader2,
  Lightbulb,
  BookMarked,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";

const COMMON_TERMS = [
  { term: "Bail", definition: "Temporary release of an accused person awaiting trial." },
  { term: "FIR", definition: "First Information Report - the initial document filed with the police." },
  { term: "Writ", definition: "A formal written order issued by a court." },
  { term: "Affidavit", definition: "A written statement confirmed by oath or affirmation." },
  { term: "Summons", definition: "An order to appear before a judge or magistrate." },
  { term: "Plea Bargaining", definition: "An agreement in a criminal case between the prosecutor and defendant." }
];

export default function Understanding({ user }: { user: User }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const handleExplain = async (term: string) => {
    setSearchQuery(term);
    setIsExplaining(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3.1-pro-preview";
      const prompt = `Explain the legal term or concept "${term}" in the context of Indian Law. 
      Use simple, plain English that a non-lawyer can understand. 
      Include:
      1. A simple definition.
      2. Why it's important.
      3. A real-world example.
      4. Any common misconceptions.
      
      Format with clear headings and bullet points.`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });

      setExplanation(response.text);
    } catch (error) {
      console.error("Explanation Error:", error);
      setExplanation("Failed to generate explanation. Please try again.");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">
      {/* Sidebar */}
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
              { icon: <BookOpen size={18} />, label: "Understanding", path: "/understanding" },
              { icon: <Search size={18} />, label: "Legal Q&A", path: "/legal-qa" },
              { icon: <Search size={18} />, label: "Case Explorer", path: "/case-explorer" },
              { icon: <Scale size={18} />, label: "Court Prep", path: "/court-prep" },
              { icon: <MessageSquare size={18} />, label: "Advocate Connect", path: "/advocate-connect" },
            ].map((link, idx) => (
              <Link
                key={idx}
                to={link.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-medium transition-all ${
                  link.path === "/understanding" 
                    ? "bg-accent/10 text-primary" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold serif text-primary">Legal Understanding</h1>
            <p className="text-gray-500 mt-2">Demystifying legal jargon and complex concepts in plain English.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
            <Lightbulb size={14} />
            Plain English Mode
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Enter a legal term or concept (e.g., 'Anticipatory Bail', 'Power of Attorney')..."
            className="w-full h-20 pl-20 pr-8 bg-white border-2 border-gray-100 rounded-[30px] text-lg focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-xl shadow-gray-100/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExplain(searchQuery)}
          />
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={24} />
          <button 
            onClick={() => handleExplain(searchQuery)}
            disabled={isExplaining}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isExplaining ? <Loader2 className="animate-spin" size={20} /> : "Explain"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Explanation Area */}
          <div className="lg:col-span-2 space-y-6">
            {isExplaining ? (
              <div className="bg-white p-20 rounded-[40px] border border-gray-100 flex flex-col items-center justify-center text-center">
                <Loader2 className="animate-spin text-accent mb-4" size={40} />
                <p className="text-gray-500 font-medium">Simplifying legal concepts for you...</p>
              </div>
            ) : explanation ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-50">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-primary serif">AI Explanation</h2>
                </div>
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:serif prose-headings:text-accent prose-headings:mt-8 prose-headings:mb-4">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white p-20 rounded-[40px] border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-bg-soft rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                  <BookMarked size={32} />
                </div>
                <h3 className="text-xl font-bold text-primary serif mb-2">Knowledge Base</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  Search for any legal term or select from the common terms to get a simplified explanation.
                </p>
              </div>
            )}
          </div>

          {/* Common Terms Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <BookMarked className="text-accent" size={20} />
                <h3 className="font-bold text-primary serif">Common Terms</h3>
              </div>
              <div className="space-y-4">
                {COMMON_TERMS.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleExplain(item.term)}
                    className="w-full text-left p-5 rounded-2xl hover:bg-bg-soft transition-all group border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-primary group-hover:text-accent transition-colors">
                        {item.term}
                      </p>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-accent transition-all group-hover:translate-x-1" />
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-1">
                      {item.definition}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-accent text-white p-8 rounded-[32px] shadow-xl">
              <h3 className="font-bold serif mb-4">Did you know?</h3>
              <p className="text-xs text-white/80 leading-relaxed mb-6">
                Indian law is primarily based on the British Common Law system, but it has evolved significantly with unique statutes like the Indian Penal Code (IPC) and the Code of Criminal Procedure (CrPC).
              </p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
                Learn More History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
