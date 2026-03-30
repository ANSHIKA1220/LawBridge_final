import { useState, useEffect } from "react";
import { User } from "../App";
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Award, 
  Search, 
  ChevronRight, 
  Sparkles,
  Loader2,
  BookMarked,
  Layout
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";

const MODULES = [
  { id: 1, title: "Constitutional Law Basics", duration: "45 mins", lessons: 12, level: "Beginner", icon: <Layout size={20} /> },
  { id: 2, title: "Indian Penal Code (IPC) Overview", duration: "1.5 hours", lessons: 18, level: "Intermediate", icon: <BookMarked size={20} /> },
  { id: 3, title: "Contract Law Principles", duration: "1 hour", lessons: 15, level: "Beginner", icon: <BookOpen size={20} /> },
  { id: 4, title: "Civil Procedure Code (CPC)", duration: "2 hours", lessons: 22, level: "Advanced", icon: <Layout size={20} /> },
  { id: 5, title: "Environmental Law in India", duration: "50 mins", lessons: 10, level: "Intermediate", icon: <BookOpen size={20} /> },
  { id: 6, title: "Intellectual Property Rights", duration: "1.2 hours", lessons: 14, level: "Intermediate", icon: <BookMarked size={20} /> },
];

export default function LearningHub({ user }: { user: User }) {
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const startLesson = async (moduleTitle: string) => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3.1-pro-preview";
      const prompt = `Create a comprehensive learning module for a law student on the topic: "${moduleTitle}". 
      Include:
      1. Introduction to the topic.
      2. Key legal concepts and definitions.
      3. Important sections or articles of the relevant Indian Act.
      4. A brief case study example.
      5. A summary of key takeaways.
      
      Format with clear headings, bullet points, and an educational tone.`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });

      setLessonContent(response.text);
    } catch (error) {
      console.error("Lesson Generation Error:", error);
      setLessonContent("Failed to generate lesson content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold serif text-primary">Learning Hub</h1>
          <p className="text-gray-500 mt-2">AI-powered legal education tailored for Indian law students.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-accent/5 text-accent text-xs font-bold rounded-lg border border-accent/10">
          <Sparkles size={14} />
          AI Learning
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedModule ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {MODULES.map((module, idx) => (
              <div 
                key={module.id}
                className="bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all p-10 flex flex-col group cursor-pointer"
                onClick={() => {
                  setSelectedModule(module);
                  startLesson(module.title);
                }}
              >
                <div className="w-14 h-14 bg-bg-soft rounded-2xl flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform">
                  {module.icon}
                </div>
                <h3 className="text-xl font-bold text-primary serif mb-4 group-hover:text-accent transition-colors">
                  {module.title}
                </h3>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Clock size={12} />
                    {module.duration}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <BookOpen size={12} />
                    {module.lessons} Lessons
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest">
                    <Award size={12} />
                    {module.level}
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">Available</span>
                  </div>
                  <button className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Play size={16} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="lesson"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden"
          >
            <div className="p-10 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => {
                    setSelectedModule(null);
                    setLessonContent(null);
                  }}
                  className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronRight size={24} className="rotate-180" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold serif">{selectedModule.title}</h2>
                  <p className="text-white/60 text-xs mt-1">Module • {selectedModule.level} • AI-Powered Learning</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Progress</p>
                  <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-accent rounded-full" />
                  </div>
                </div>
                <button className="px-6 py-3 bg-accent text-white font-bold rounded-xl text-xs shadow-lg shadow-accent/20">
                  Mark Complete
                </button>
              </div>
            </div>

            <div className="p-12">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <Loader2 className="animate-spin text-accent mb-6" size={48} />
                  <h3 className="text-xl font-bold text-primary serif mb-2">Generating Learning Module...</h3>
                  <p className="text-gray-400 max-w-sm">Our AI is structuring a comprehensive lesson on {selectedModule.title} for you.</p>
                </div>
              ) : lessonContent ? (
                <div className="max-w-4xl mx-auto">
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:serif prose-headings:text-accent prose-headings:mt-12 prose-headings:mb-6 prose-li:text-gray-600">
                    <ReactMarkdown>{lessonContent}</ReactMarkdown>
                  </div>
                  <div className="mt-20 p-10 bg-bg-soft rounded-[32px] border border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-primary mb-2">Ready for the next step?</h4>
                      <p className="text-xs text-gray-400">Take a quick quiz to test your knowledge on this module.</p>
                    </div>
                    <button className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-opacity">
                      Take Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-400 py-20">Failed to load lesson content.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
