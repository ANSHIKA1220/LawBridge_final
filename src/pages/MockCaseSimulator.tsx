import { useState, useEffect, useRef } from "react";
import { User } from "../App";
import { 
  Scale, 
  MessageSquare, 
  UserCheck, 
  AlertCircle, 
  ChevronRight, 
  Play, 
  RotateCcw, 
  Trophy,
  Loader2,
  Sparkles,
  Gavel
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";

interface SimulationState {
  stage: "intro" | "scenario" | "interaction" | "verdict";
  scenario: string;
  history: { role: "system" | "user" | "judge"; content: string }[];
  score: number;
  feedback: string;
}

export default function MockCaseSimulator({ user }: { user: User }) {
  const [state, setState] = useState<SimulationState>({
    stage: "intro",
    scenario: "",
    history: [],
    score: 0,
    feedback: ""
  });
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.history]);

  const startSimulation = async () => {
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3.1-pro-preview";
      const prompt = `Generate a realistic legal scenario for a law student in India. 
      The scenario should involve a common legal issue (e.g., property dispute, contract breach, or minor criminal offense).
      Provide:
      1. Case Title
      2. Background Facts
      3. The student's role (e.g., Defense Counsel or Prosecution)
      4. The specific legal question at hand.
      
      Keep it concise and engaging.`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });

      setState({
        ...state,
        stage: "scenario",
        scenario: response.text,
        history: [{ role: "system", content: response.text }]
      });
    } catch (error) {
      console.error("Simulation Start Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    const newHistory = [...state.history, { role: "user" as const, content: userInput }];
    setState({ ...state, history: newHistory });
    setUserInput("");
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3.1-pro-preview";
      
      // If it's the 5th interaction, end with a verdict
      const isEnding = newHistory.filter(h => h.role === "user").length >= 3;

      const prompt = isEnding 
        ? `Based on the following legal simulation history, provide a final verdict as a Judge. 
           Evaluate the student's arguments, point out legal flaws or strengths, and give a final score out of 100.
           History: ${JSON.stringify(newHistory)}`
        : `You are a Judge in an Indian courtroom. Respond to the student's argument. 
           Be professional, ask a follow-up question to test their legal knowledge, and maintain the courtroom atmosphere.
           History: ${JSON.stringify(newHistory)}`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });

      if (isEnding) {
        // Extract score from AI response if possible, otherwise mock it
        const scoreMatch = response.text.match(/(\d+)\/100/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;
        
        setState({
          ...state,
          stage: "verdict",
          history: [...newHistory, { role: "judge", content: response.text }],
          score,
          feedback: response.text
        });
      } else {
        setState({
          ...state,
          history: [...newHistory, { role: "judge", content: response.text }]
        });
      }
    } catch (error) {
      console.error("Interaction Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold serif text-primary">Mock Case Simulator</h1>
          <p className="text-gray-500 mt-2">Practice your courtroom arguments with our AI Judge.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-accent/5 text-accent text-xs font-bold rounded-lg border border-accent/10">
          <Gavel size={14} />
          Courtroom Mode
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state.stage === "intro" && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-xl text-center flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mb-8">
              <Scale size={40} />
            </div>
            <h2 className="text-3xl font-bold text-primary serif mb-4">Ready to step into the courtroom?</h2>
            <p className="text-gray-500 max-w-lg mb-10 leading-relaxed">
              Test your legal reasoning, advocacy skills, and knowledge of Indian law in a simulated environment. 
              Our AI Judge will challenge your arguments and provide detailed feedback.
            </p>
            <button 
              onClick={startSimulation}
              disabled={isProcessing}
              className="px-12 py-5 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : <Play size={20} />}
              Start New Simulation
            </button>
          </motion.div>
        )}

        {state.stage === "scenario" && (
          <motion.div 
            key="scenario"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-50">
              <Sparkles className="text-accent" size={24} />
              <h2 className="text-2xl font-bold text-primary serif">Case Briefing</h2>
            </div>
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:serif prose-headings:text-accent mb-10">
              <ReactMarkdown>{state.scenario}</ReactMarkdown>
            </div>
            <button 
              onClick={() => setState({ ...state, stage: "interaction" })}
              className="w-full py-5 bg-accent text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3"
            >
              Enter Courtroom <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {state.stage === "interaction" && (
          <motion.div 
            key="interaction"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]"
          >
            {/* Sidebar: Case Info */}
            <div className="bg-primary text-white p-8 rounded-[40px] shadow-xl overflow-y-auto hidden lg:block">
              <h3 className="font-bold serif text-xl mb-6 flex items-center gap-2">
                <AlertCircle size={20} className="text-accent" />
                Case Reference
              </h3>
              <div className="text-xs text-white/70 leading-relaxed space-y-4">
                <ReactMarkdown>{state.scenario}</ReactMarkdown>
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 flex flex-col bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-bg-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                    <Gavel size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">Hon'ble Judge</p>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Session</p>
                  </div>
                </div>
              </div>

              <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6">
                {state.history.filter(h => h.role !== "system").map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-6 rounded-3xl text-sm ${
                      msg.role === "user" 
                        ? "bg-accent text-white rounded-tr-none" 
                        : "bg-bg-soft text-primary rounded-tl-none border border-gray-100"
                    }`}>
                      <p className="font-bold text-[10px] uppercase tracking-widest mb-2 opacity-50">
                        {msg.role === "user" ? "Your Argument" : "Judge's Response"}
                      </p>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-bg-soft p-6 rounded-3xl rounded-tl-none border border-gray-100">
                      <Loader2 className="animate-spin text-accent" size={20} />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleInteraction} className="p-6 bg-white border-t border-gray-50 flex gap-4">
                <input 
                  type="text" 
                  placeholder="Present your argument to the Judge..."
                  className="flex-grow h-14 px-6 bg-bg-soft rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isProcessing}
                />
                <button 
                  type="submit"
                  disabled={isProcessing || !userInput.trim()}
                  className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <MessageSquare size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {state.stage === "verdict" && (
          <motion.div 
            key="verdict"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-2xl max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-6">
                <Trophy size={48} />
              </div>
              <h2 className="text-4xl font-bold text-primary serif mb-2">Final Verdict</h2>
              <p className="text-gray-400">Simulation Complete • Performance Analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-bg-soft p-8 rounded-3xl text-center border border-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Legal Accuracy</p>
                <p className="text-4xl font-bold text-primary serif">{state.score}%</p>
              </div>
              <div className="bg-bg-soft p-8 rounded-3xl text-center border border-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Advocacy Skills</p>
                <p className="text-4xl font-bold text-accent serif">High</p>
              </div>
              <div className="bg-bg-soft p-8 rounded-3xl text-center border border-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Rank</p>
                <p className="text-4xl font-bold text-primary serif">A+</p>
              </div>
            </div>

            <div className="bg-primary text-white p-10 rounded-[32px] mb-12">
              <h3 className="font-bold serif text-xl mb-6 flex items-center gap-2">
                <UserCheck size={20} className="text-accent" />
                Judge's Feedback
              </h3>
              <div className="prose prose-sm prose-invert max-w-none text-white/80 leading-relaxed">
                <ReactMarkdown>{state.feedback}</ReactMarkdown>
              </div>
            </div>

            <button 
              onClick={() => setState({ stage: "intro", scenario: "", history: [], score: 0, feedback: "" })}
              className="w-full py-6 bg-bg-soft text-primary font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
            >
              <RotateCcw size={20} />
              Try Another Case
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
