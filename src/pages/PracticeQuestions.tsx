import { useState, useEffect } from "react";
import { User } from "../App";
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RotateCcw, 
  Trophy, 
  Loader2, 
  Sparkles,
  BookOpen,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function PracticeQuestions({ user }: { user: User }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState("Constitutional Law");

  const generateQuestions = async (selectedTopic: string) => {
    setIsGenerating(true);
    setQuestions([]);
    setCurrentQuestionIdx(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3.1-pro-preview";
      const prompt = `Generate 5 multiple-choice questions for a law student on the topic: "${selectedTopic}". 
      Each question should have 4 options and a clear explanation for the correct answer. 
      The questions should be challenging and relevant to Indian law.`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
                explanation: { type: Type.STRING }
              },
              required: ["id", "question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });

      const generatedQuestions = JSON.parse(response.text);
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error("Question Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQuestions(topic);
  }, []);

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === questions[currentQuestionIdx].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCurrentQuestionIdx(questions.length); // End state
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold serif text-primary">Practice Questions</h1>
          <p className="text-gray-500 mt-2">Test your legal knowledge with AI-generated quizzes.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-accent/5 text-accent text-xs font-bold rounded-lg border border-accent/10">
          <HelpCircle size={14} />
          Quiz Mode
        </div>
      </div>

      {/* Topic Selector */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-bg-soft rounded-xl flex items-center justify-center text-accent">
            <Filter size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Current Topic</p>
            <p className="font-bold text-primary">{topic}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['Constitutional Law', 'Criminal Law', 'Contract Law'].map((t, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setTopic(t);
                generateQuestions(t);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                topic === t 
                  ? "bg-accent text-white shadow-lg shadow-accent/20" 
                  : "bg-bg-soft text-gray-500 hover:bg-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-20 rounded-[40px] border border-gray-100 shadow-xl flex flex-col items-center justify-center text-center"
          >
            <Loader2 className="animate-spin text-accent mb-6" size={48} />
            <h3 className="text-xl font-bold text-primary serif mb-2">Generating Quiz...</h3>
            <p className="text-gray-400 max-w-sm">Our AI is crafting challenging questions on {topic} for you.</p>
          </motion.div>
        ) : questions.length > 0 && currentQuestionIdx < questions.length ? (
          <motion.div 
            key={currentQuestionIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-xl"
          >
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-xl font-bold text-primary serif">Question {currentQuestionIdx + 1} of {questions.length}</h2>
              </div>
              <div className="px-4 py-2 bg-bg-soft rounded-full text-xs font-bold text-gray-400">
                Score: {score}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-primary serif mb-10 leading-tight">
              {questions[currentQuestionIdx].question}
            </h3>

            <div className="space-y-4 mb-10">
              {questions[currentQuestionIdx].options.map((option, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                    isAnswered 
                      ? idx === questions[currentQuestionIdx].correctAnswer 
                        ? "bg-green-50 border-green-500 text-green-700" 
                        : selectedOption === idx 
                          ? "bg-red-50 border-red-500 text-red-700" 
                          : "bg-white border-gray-50 opacity-50"
                      : "bg-white border-gray-50 hover:border-accent hover:bg-accent/5 text-primary"
                  }`}
                >
                  <span className="font-medium text-sm">{option}</span>
                  {isAnswered && idx === questions[currentQuestionIdx].correctAnswer && <CheckCircle2 size={20} />}
                  {isAnswered && selectedOption === idx && idx !== questions[currentQuestionIdx].correctAnswer && <XCircle size={20} />}
                </button>
              ))}
            </div>

            {isAnswered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-soft p-8 rounded-3xl border border-gray-100 mb-10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen size={18} className="text-accent" />
                  <h4 className="font-bold text-primary text-sm">Explanation</h4>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {questions[currentQuestionIdx].explanation}
                </p>
              </motion.div>
            )}

            {isAnswered && (
              <button 
                onClick={nextQuestion}
                className="w-full py-5 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
              >
                {currentQuestionIdx === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                <ChevronRight size={20} />
              </button>
            )}
          </motion.div>
        ) : currentQuestionIdx === questions.length ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-2xl text-center"
          >
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-8">
              <Trophy size={48} />
            </div>
            <h2 className="text-3xl font-bold text-primary serif mb-2">Quiz Complete!</h2>
            <p className="text-gray-400 mb-10">You've finished the {topic} practice session.</p>

            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-bg-soft p-8 rounded-3xl border border-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Final Score</p>
                <p className="text-4xl font-bold text-primary serif">{score} / {questions.length}</p>
              </div>
              <div className="bg-bg-soft p-8 rounded-3xl border border-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Accuracy</p>
                <p className="text-4xl font-bold text-accent serif">{(score / questions.length) * 100}%</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => generateQuestions(topic)}
                className="flex-grow py-5 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3"
              >
                <RotateCcw size={20} />
                Retake Quiz
              </button>
              <button 
                onClick={() => generateQuestions(topic)} // In real app, maybe pick next topic
                className="flex-grow py-5 bg-bg-soft text-primary font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
              >
                Next Topic
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
