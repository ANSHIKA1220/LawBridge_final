import { useState, useEffect } from "react";
import { User } from "../App";
import { 
  BookOpen, 
  Search, 
  Filter, 
  ChevronRight, 
  ExternalLink, 
  Bookmark, 
  TrendingUp,
  FileText,
  Sparkles,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";

const LANDMARK_CASES = [
  { id: 1, title: "Kesavananda Bharati v. State of Kerala", year: 1973, category: "Constitutional Law", summary: "Established the 'Basic Structure Doctrine' of the Constitution." },
  { id: 2, title: "Maneka Gandhi v. Union of India", year: 1978, category: "Fundamental Rights", summary: "Expanded the scope of Article 21 (Right to Life and Personal Liberty)." },
  { id: 3, title: "Vishaka v. State of Rajasthan", year: 1997, category: "Women's Rights", summary: "Guidelines for preventing sexual harassment at the workplace." },
  { id: 4, title: "Navtej Singh Johar v. Union of India", year: 2018, category: "LGBTQ+ Rights", summary: "Decriminalized consensual homosexual acts (Section 377 IPC)." },
  { id: 5, title: "Justice K.S. Puttaswamy v. Union of India", year: 2017, category: "Privacy", summary: "Declared Right to Privacy as a fundamental right under the Constitution." },
  { id: 6, title: "Shayara Bano v. Union of India", year: 2017, category: "Personal Law", summary: "Declared the practice of Triple Talaq as unconstitutional." },
];

export default function CaseStudiesLibrary({ user }: { user: User }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredCases = LANDMARK_CASES.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAnalyzeCase = async (caseTitle: string) => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3.1-pro-preview";
      const prompt = `Provide a detailed legal analysis of the landmark Indian case: "${caseTitle}". 
      Include:
      1. Facts of the case.
      2. Key legal issues involved.
      3. The Supreme Court's judgment.
      4. The long-term impact on Indian jurisprudence.
      5. Key takeaways for law students.
      
      Format with clear headings and professional legal tone.`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });

      setAiAnalysis(response.text);
    } catch (error) {
      console.error("Analysis Error:", error);
      setAiAnalysis("Failed to generate analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold serif text-primary">Case Studies Library</h1>
          <p className="text-gray-500 mt-2">Explore landmark judgments that shaped Indian law.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
          <TrendingUp size={14} />
          Landmark Judgments
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Search & List */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="relative group mb-6">
              <input 
                type="text" 
                placeholder="Search cases..."
                className="w-full h-14 pl-12 pr-6 bg-bg-soft border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl text-sm transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={18} />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Categories</p>
              {['All', 'Constitutional Law', 'Fundamental Rights', 'Women\'s Rights', 'Privacy', 'Personal Law'].map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat 
                      ? "bg-accent text-white shadow-lg shadow-accent/20" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCases.map((c, idx) => (
              <button 
                key={c.id}
                onClick={() => {
                  setSelectedCase(c);
                  setAiAnalysis(null);
                  handleAnalyzeCase(c.title);
                }}
                className={`w-full text-left p-6 rounded-[24px] border transition-all group ${
                  selectedCase?.id === c.id 
                    ? "bg-primary text-white border-primary shadow-xl" 
                    : "bg-white border-gray-100 hover:border-accent hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest ${
                    selectedCase?.id === c.id ? "bg-white/10 text-white" : "bg-bg-soft text-gray-400"
                  }`}>
                    {c.year}
                  </span>
                  <Bookmark size={14} className={selectedCase?.id === c.id ? "text-accent" : "text-gray-200"} />
                </div>
                <h3 className={`font-bold text-sm mb-2 serif leading-tight ${selectedCase?.id === c.id ? "text-white" : "text-primary group-hover:text-accent"}`}>
                  {c.title}
                </h3>
                <p className={`text-[10px] leading-relaxed ${selectedCase?.id === c.id ? "text-white/60" : "text-gray-400"}`}>
                  {c.summary}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Case Details & AI Analysis */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedCase ? (
              <motion.div 
                key={selectedCase.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden"
              >
                <div className="p-10 bg-bg-soft border-b border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-1.5 bg-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {selectedCase.category}
                    </span>
                    <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-accent transition-colors">
                      <ExternalLink size={14} />
                      View Full Judgment
                    </button>
                  </div>
                  <h2 className="text-3xl font-bold text-primary serif leading-tight mb-4">
                    {selectedCase.title}
                  </h2>
                  <div className="flex items-center gap-6 text-xs text-gray-400 font-bold">
                    <div className="flex items-center gap-2">
                      <FileText size={14} />
                      Supreme Court of India
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark size={14} />
                      Citation: {selectedCase.year} (SC)
                    </div>
                  </div>
                </div>

                <div className="p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                      <Sparkles size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-primary serif">AI Case Analysis</h3>
                  </div>

                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Loader2 className="animate-spin text-accent mb-4" size={40} />
                      <p className="text-gray-500 font-medium">Analyzing judgment and legal implications...</p>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:serif prose-headings:text-accent prose-headings:mt-10 prose-headings:mb-6">
                      <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-bg-soft rounded-3xl border border-dashed border-gray-200">
                      <p className="text-gray-400 text-sm">Select a case to view its detailed AI analysis.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white h-full min-h-[600px] rounded-[40px] border border-gray-100 border-dashed flex flex-col items-center justify-center text-center p-20">
                <div className="w-24 h-24 bg-bg-soft rounded-full flex items-center justify-center text-gray-200 mb-8">
                  <BookOpen size={48} />
                </div>
                <h3 className="text-2xl font-bold text-primary serif mb-4">Select a Landmark Case</h3>
                <p className="text-gray-400 max-w-md leading-relaxed">
                  Choose a case from the library to explore its background, judgment, and legal significance through our AI-powered analysis.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
