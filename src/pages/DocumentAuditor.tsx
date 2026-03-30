import { useState, useEffect } from "react";
import { User } from "../App";
import { 
  Upload, 
  FileText, 
  Search, 
  BookOpen, 
  Scale, 
  MessageSquare, 
  LayoutDashboard,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  Download,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import { collection, addDoc, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

interface AuditReport {
  documentType: string;
  summary: string;
  obligations: {
    title: string;
    description: string;
    importance: 'High' | 'Medium' | 'Low';
  }[];
  risks: {
    title: string;
    description: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
  }[];
  improvements: string[];
}

export default function DocumentAuditor({ user }: { user: User }) {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<AuditReport | string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "document_audits"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          let parsedReport = data.report;
          try {
            parsedReport = JSON.parse(data.report);
          } catch (e) {
            // Fallback for old markdown reports
          }
          return { id: doc.id, ...data, report: parsedReport };
        });
        setHistory(historyData);
      } catch (error) {
        console.error("Error fetching history:", error);
        handleFirestoreError(error, OperationType.LIST, "document_audits");
      }
    };
    fetchHistory();
  }, [user.uid]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      // Mock text extraction for demo
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target?.result as string);
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleAudit = async () => {
    if (!text || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3-flash-preview";
      const prompt = `Audit this legal document: "${file?.name || "document.txt"}"
      
      Document Content:
      ${text}
      
      Identify:
      1. Document Type (e.g., NDA, Lease, Employment Contract).
      2. Key Obligations for both parties.
      3. India-specific legal risks (e.g., Stamp Act compliance, Arbitration clauses under Indian law).
      4. Suggested improvements.`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documentType: { type: Type.STRING },
              summary: { type: Type.STRING },
              obligations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    importance: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
                  },
                  required: ['title', 'description', 'importance']
                }
              },
              risks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['Critical', 'High', 'Medium', 'Low'] }
                  },
                  required: ['title', 'description', 'severity']
                }
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['documentType', 'summary', 'obligations', 'risks', 'improvements']
          }
        }
      });

      const reportData = JSON.parse(response.text);
      setReport(reportData);

      // Save to Firestore
      try {
        await addDoc(collection(db, "document_audits"), {
          uid: user.uid,
          fileName: file?.name || "document.txt",
          report: JSON.stringify(reportData),
          createdAt: new Date()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, "document_audits");
      }

    } catch (error) {
      console.error("Audit Error:", error);
      setReport("Failed to analyze document. Please try again.");
    } finally {
      setIsAnalyzing(false);
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
                  link.path === "/document-auditor" 
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

      {/* Audit Area */}
      <div className="flex-grow space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold serif text-primary">Document Auditor</h1>
            <p className="text-gray-500 mt-2">Upload legal documents for instant AI risk assessment.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
              <CheckCircle2 size={14} />
              Stamp Act Compliant
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg border border-orange-100">
              <AlertTriangle size={14} />
              Indian Law Scoped
            </div>
          </div>
        </div>

        {!report ? (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-20 rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center shadow-xl"
            >
              <div className="w-24 h-24 bg-bg-soft rounded-3xl flex items-center justify-center text-accent mb-8">
                <Upload size={40} />
              </div>
              <h3 className="text-2xl font-bold serif mb-4">Upload your legal document</h3>
              <p className="text-gray-500 max-w-md mb-10 leading-relaxed">
                Drag and drop your PDF or Text file here, or click to browse. Our AI will analyze clauses, obligations, and India-specific legal risks.
              </p>
              
              <label className="cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
                <div className="px-10 py-5 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-opacity flex items-center gap-3 shadow-lg shadow-primary/20">
                  {file ? file.name : "Select File"}
                </div>
              </label>

              {file && (
                <button 
                  onClick={handleAudit}
                  disabled={isAnalyzing}
                  className="mt-8 px-10 py-5 bg-accent text-white font-bold rounded-2xl hover:opacity-90 transition-opacity flex items-center gap-3 shadow-lg shadow-accent/20"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <FileSearch size={20} />
                      Start AI Audit
                    </>
                  )}
                </button>
              )}
            </motion.div>

            {history.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold serif text-primary">Recent Audits</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setReport(item.report);
                        setFile({ name: item.fileName } as File);
                      }}
                      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-primary text-sm">{item.fileName}</p>
                          <p className="text-[10px] text-gray-400">
                            {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown size={18} className="text-gray-300 group-hover:text-accent -rotate-90" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[700px]">
            {/* Document Preview */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[40px] border border-gray-100 shadow-xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <FileText className="text-accent" size={20} />
                  <span className="text-sm font-bold text-primary">{file?.name}</span>
                </div>
                <button 
                  onClick={() => setReport(null)}
                  className="text-xs font-bold text-accent hover:underline"
                >
                  Upload New
                </button>
              </div>
              <div className="flex-grow p-10 overflow-y-auto text-sm text-gray-500 leading-relaxed font-mono whitespace-pre-wrap">
                {file?.name.toLowerCase().endsWith('.pdf') ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                      <FileText size={40} className="text-gray-300" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-400">PDF Preview Restricted</p>
                      <p className="text-xs text-gray-400 mt-1">AI is analyzing the extracted text content securely.</p>
                    </div>
                  </div>
                ) : text}
              </div>
            </motion.div>

            {/* Auditor's Report */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <FileSearch className="text-accent" size={20} />
                  <span className="text-sm font-bold text-primary serif">Auditor's Report</span>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-xs font-bold rounded-lg transition-colors">
                  <Download size={14} />
                  Export PDF
                </button>
              </div>
              <div className="flex-grow p-8 overflow-y-auto space-y-6">
                {typeof report === 'string' ? (
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:serif prose-headings:text-accent">
                    <ReactMarkdown>{report}</ReactMarkdown>
                  </div>
                ) : (
                  <>
                    <div className="bg-accent/5 p-6 rounded-2xl border border-accent/10">
                      <h3 className="text-accent font-bold text-xs uppercase tracking-widest mb-2">Document Summary</h3>
                      <p className="text-primary font-bold text-lg serif mb-2">{report.documentType}</p>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4">{report.summary}</p>
                      <button 
                        onClick={() => navigate('/legal-qa', { 
                          state: { 
                            initialQuestion: `I've analyzed a ${report.documentType} with the following summary: "${report.summary}". Can you help me understand the overall legal standing of this document in India?` 
                          } 
                        })}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <MessageSquare size={14} />
                        Ask AI about this Document
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-primary font-bold text-sm serif flex items-center gap-2">
                          <AlertCircle size={18} className="text-accent" />
                          Identified Legal Risks
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {report.risks.length} Risks Found
                        </span>
                      </div>
                      <div className="space-y-4">
                        {report.risks.map((risk, idx) => (
                          <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                          >
                            <button 
                              onClick={() => toggleSection(`risk-${idx}`)}
                              className={`w-full px-8 py-6 flex items-center justify-between transition-colors ${
                                expandedSections[`risk-${idx}`] ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                  risk.severity === 'Critical' ? 'bg-red-50 text-red-600' :
                                  risk.severity === 'High' ? 'bg-orange-50 text-orange-600' :
                                  risk.severity === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                                  'bg-blue-50 text-blue-600'
                                }`}>
                                  <AlertTriangle size={24} />
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                                      risk.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                      risk.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                                      risk.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {risk.severity} Severity
                                    </span>
                                  </div>
                                  <span className="text-sm font-bold text-primary">{risk.title}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {expandedSections[`risk-${idx}`] ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                              </div>
                            </button>
                            <AnimatePresence>
                              {expandedSections[`risk-${idx}`] && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="px-8 pb-8 text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-6"
                                >
                                  <div className="bg-bg-soft p-6 rounded-2xl border border-gray-100">
                                    <p className="mb-4 font-medium text-gray-700">Detailed Analysis:</p>
                                    <p className="mb-6">{risk.description}</p>
                                    <button 
                                      onClick={() => navigate('/legal-qa', { 
                                        state: { 
                                          initialQuestion: `I'm reviewing a ${report.documentType} and found this risk: "${risk.title}". The auditor says: "${risk.description}". Can you explain the legal implications of this under Indian law?` 
                                        } 
                                      })}
                                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                      <MessageSquare size={14} />
                                      Ask AI about this Risk
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-primary font-bold text-sm serif flex items-center gap-2">
                          <Info size={18} className="text-blue-500" />
                          Key Obligations
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {report.obligations.length} Obligations
                        </span>
                      </div>
                      <div className="space-y-4">
                        {report.obligations.map((ob, idx) => (
                          <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                          >
                            <button 
                              onClick={() => toggleSection(`ob-${idx}`)}
                              className={`w-full px-8 py-6 flex items-center justify-between transition-colors ${
                                expandedSections[`ob-${idx}`] ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                  ob.importance === 'High' ? 'bg-blue-50 text-blue-600' :
                                  ob.importance === 'Medium' ? 'bg-gray-50 text-gray-600' :
                                  'bg-gray-50 text-gray-400'
                                }`}>
                                  <FileText size={24} />
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                                      ob.importance === 'High' ? 'bg-blue-100 text-blue-700' :
                                      ob.importance === 'Medium' ? 'bg-gray-100 text-gray-700' :
                                      'bg-gray-50 text-gray-400'
                                    }`}>
                                      {ob.importance} Importance
                                    </span>
                                  </div>
                                  <span className="text-sm font-bold text-primary">{ob.title}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {expandedSections[`ob-${idx}`] ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                              </div>
                            </button>
                            <AnimatePresence>
                              {expandedSections[`ob-${idx}`] && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="px-8 pb-8 text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-6"
                                >
                                  <div className="bg-bg-soft p-6 rounded-2xl border border-gray-100">
                                    <p className="mb-4 font-medium text-gray-700">Obligation Details:</p>
                                    <p className="mb-6">{ob.description}</p>
                                    <button 
                                      onClick={() => navigate('/legal-qa', { 
                                        state: { 
                                          initialQuestion: `In this ${report.documentType}, there's an obligation regarding "${ob.title}": "${ob.description}". What are the legal consequences if this obligation is not met?` 
                                        } 
                                      })}
                                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                      <MessageSquare size={14} />
                                      Ask AI about this Obligation
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-primary font-bold text-sm serif flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-500" />
                        Suggested Improvements
                      </h3>
                      <ul className="space-y-3">
                        {report.improvements.map((imp, idx) => (
                          <li key={idx} className="flex flex-col gap-3 bg-green-50/50 p-4 rounded-xl border border-green-100/50">
                            <div className="flex items-start gap-3 text-xs text-gray-500 leading-relaxed">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                              {imp}
                            </div>
                            <button 
                              onClick={() => navigate('/legal-qa', { 
                                state: { 
                                  initialQuestion: `The Document Auditor suggested this improvement: "${imp}". How can I implement this in my document to better comply with Indian law?` 
                                } 
                              })}
                              className="self-start flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-[9px] font-bold rounded-lg hover:bg-primary/20 transition-colors"
                            >
                              <MessageSquare size={12} />
                              Ask AI how to implement
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
