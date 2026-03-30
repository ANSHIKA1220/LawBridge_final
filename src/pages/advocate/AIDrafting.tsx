import { useState } from "react";
import { User } from "../../App";
import { 
  FileText, 
  Cpu, 
  Send, 
  Copy, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  History,
  Save,
  Scale
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const DRAFT_TYPES = [
  { id: "legal_notice", label: "Legal Notice", icon: FileText, prompt: "Draft a formal legal notice for..." },
  { id: "petition", label: "Writ Petition", icon: Scale, prompt: "Draft a writ petition for..." },
  { id: "affidavit", label: "Affidavit", icon: FileText, prompt: "Draft an affidavit for..." },
  { id: "contract", label: "Contract Agreement", icon: FileText, prompt: "Draft a contract agreement for..." },
  { id: "reply", label: "Reply to Notice", icon: FileText, prompt: "Draft a reply to a legal notice for..." },
];

export default function AIDrafting({ user }: { user: User }) {
  const [selectedType, setSelectedType] = useState(DRAFT_TYPES[0]);
  const [context, setContext] = useState("");
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    if (!context.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert Indian legal drafting assistant. 
        Draft a professional ${selectedType.label} based on the following context:
        
        Context: ${context}
        
        Requirements:
        - Use formal legal language.
        - Follow standard Indian court formats.
        - Include placeholders for names, dates, and specific details in [BRACKETS].
        - Ensure the draft is legally sound and comprehensive.`,
        config: {
          systemInstruction: "You are a professional legal drafting assistant for Indian advocates. Provide high-quality, formal, and structured legal drafts.",
        }
      });

      const response = await model;
      setDraft(response.text);

      // Log the action
      await addDoc(collection(db, "system_logs"), {
        uid: user.uid,
        action: "AI_DRAFT_GENERATE",
        details: `Generated ${selectedType.label} draft`,
        createdAt: serverTimestamp()
      });

    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold serif text-primary">AI Drafting Assistant</h1>
          <p className="text-gray-500 mt-2">Generate professional legal drafts, notices, and petitions in seconds.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-bg-soft text-primary rounded-xl hover:bg-gray-100 transition-all">
            <History size={20} />
          </button>
          <button className="p-3 bg-bg-soft text-primary rounded-xl hover:bg-gray-100 transition-all">
            <Save size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Input Controls */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Select Draft Type</h3>
            <div className="space-y-3">
              {DRAFT_TYPES.map((type) => (
                <button 
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between group transition-all ${
                    selectedType.id === type.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-bg-soft text-primary hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <type.icon size={18} />
                    <span className="text-sm font-bold">{type.label}</span>
                  </div>
                  <ChevronRight size={16} className={selectedType.id === type.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-all'} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Case Context</h3>
            <textarea 
              className="w-full h-64 p-6 bg-bg-soft border-2 border-transparent rounded-[32px] text-sm focus:border-accent transition-all outline-none resize-none leading-relaxed"
              placeholder="Enter the facts, parties involved, and specific requirements for the draft..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
            <button 
              onClick={handleGenerate}
              disabled={!context.trim() || isGenerating}
              className="w-full h-16 mt-6 bg-accent text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-accent/90 shadow-xl shadow-accent/20 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Sparkles size={20} />
              )}
              {isGenerating ? 'Generating Draft...' : 'Generate Legal Draft'}
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-2">
          <div className="bg-white h-full min-h-[600px] rounded-[48px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between bg-bg-soft/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">{selectedType.label}</p>
                  <p className="text-[10px] text-gray-400">AI-Generated Draft</p>
                </div>
              </div>
              {draft && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopy}
                    className="p-3 bg-white text-primary rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
                  >
                    {isCopied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                    {isCopied ? 'Copied!' : 'Copy Text'}
                  </button>
                  <button className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-xs font-bold">
                    <Download size={16} />
                    Export PDF
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 p-12 overflow-y-auto prose prose-slate max-w-none">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent animate-pulse">
                    <Cpu size={32} />
                  </div>
                  <p className="text-gray-500 font-medium italic">AI is analyzing your context and drafting the document...</p>
                </div>
              ) : draft ? (
                <ReactMarkdown>{draft}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                  <FileText size={64} className="text-gray-300" />
                  <div className="max-w-xs">
                    <p className="text-lg font-bold text-primary mb-2">Ready to Draft</p>
                    <p className="text-sm text-gray-500">Select a draft type and provide case context to generate a professional legal document.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
