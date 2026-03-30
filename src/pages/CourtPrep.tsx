import { useState } from "react";
import { User } from "../App";
import { 
  Search, 
  FileText, 
  LayoutDashboard, 
  BookOpen, 
  Scale, 
  MessageSquare, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  UserCheck,
  ClipboardList,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";

export default function CourtPrep({ user }: { user: User }) {
  const [caseDescription, setCaseDescription] = useState("");
  const [prepPlan, setPrepPlan] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePrep = async () => {
    if (!caseDescription.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3.1-pro-preview";
      const prompt = `I am preparing for a court appearance in India. 
      Case Description: "${caseDescription}"
      
      Please provide a comprehensive preparation guide including:
      1. A checklist of documents I should carry.
      2. Common questions the judge or opposing counsel might ask.
      3. Tips for courtroom behavior and etiquette in Indian courts.
      4. How to dress and what to expect during the hearing.
      5. Key legal points I should be aware of.
      
      Format with clear headings, bullet points, and a supportive tone.`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });

      setPrepPlan(response.text);
    } catch (error) {
      console.error("Prep Error:", error);
      setPrepPlan("Failed to generate preparation plan. Please try again.");
    } finally {
      setIsGenerating(false);
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
                  link.path === "/court-prep" 
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
            <h1 className="text-4xl font-bold serif text-primary">Court Prep</h1>
            <p className="text-gray-500 mt-2">Personalized AI-driven preparation for your court hearing.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg border border-orange-100">
            <Calendar size={14} />
            Hearing Ready
          </div>
        </div>

        {!prepPlan ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                <ClipboardList size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary serif">Start Your Preparation</h2>
                <p className="text-gray-400 text-sm">Tell us about your case to generate a custom prep guide.</p>
              </div>
            </div>

            <div className="space-y-6">
              <textarea 
                placeholder="Describe your case or the purpose of your court appearance (e.g., 'I have a hearing for a property dispute next week', 'I am a witness in a traffic violation case')..."
                className="w-full h-48 p-8 bg-bg-soft border-2 border-transparent focus:border-accent focus:bg-white rounded-[30px] text-lg transition-all outline-none resize-none"
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
              />
              <button 
                onClick={handleGeneratePrep}
                disabled={isGenerating || !caseDescription.trim()}
                className="w-full py-6 bg-primary text-white font-bold rounded-[30px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Generating Your Prep Guide...
                  </>
                ) : (
                  <>
                    <Sparkles size={24} />
                    Generate Custom Prep Guide
                  </>
                )}
              </button>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <UserCheck className="text-blue-500" />, title: "Etiquette", desc: "Learn how to address the judge and behave in court." },
                { icon: <FileText className="text-orange-500" />, title: "Documents", desc: "A checklist of everything you need to bring." },
                { icon: <AlertCircle className="text-red-500" />, title: "Risks", desc: "Be prepared for tough questions and scenarios." },
              ].map((item, idx) => (
                <div key={idx} className="p-6 bg-bg-soft rounded-3xl border border-gray-50">
                  <div className="mb-4">{item.icon}</div>
                  <h4 className="font-bold text-primary mb-2">{item.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setPrepPlan(null)}
                className="text-sm font-bold text-accent hover:underline flex items-center gap-2"
              >
                <ArrowRight size={16} className="rotate-180" />
                Back to Case Details
              </button>
              <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-primary/10">
                <FileText size={16} />
                Download Guide
              </button>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-10 pb-8 border-b border-gray-50">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary serif">Your Custom Prep Guide</h2>
                  <p className="text-xs text-gray-400">Generated specifically for your case description.</p>
                </div>
              </div>

              <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:serif prose-headings:text-accent prose-headings:mt-10 prose-headings:mb-6 prose-li:text-gray-600">
                <ReactMarkdown>{prepPlan}</ReactMarkdown>
              </div>

              <div className="mt-16 p-8 bg-bg-soft rounded-[32px] border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-primary">Ready to go?</p>
                    <p className="text-xs text-gray-400">Review this guide once more before your hearing.</p>
                  </div>
                </div>
                <Link to="/advocate-connect" className="px-8 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-colors">
                  Find an Advocate
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
