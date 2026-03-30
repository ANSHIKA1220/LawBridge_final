import { useState, useEffect } from "react";
import { User } from "../App";
import { 
  Search, 
  FileText, 
  LayoutDashboard, 
  BookOpen, 
  Scale, 
  MessageSquare, 
  ExternalLink,
  Loader2,
  History,
  TrendingUp,
  Filter
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { collection, addDoc, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

interface CaseResult {
  title: string;
  url: string;
  snippet: string;
}

export default function CaseExplorer({ user }: { user: User }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<CaseResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "case_searches"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        setHistory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "case_searches");
      }
    };
    fetchHistory();
  }, [user.uid]);

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSearch = overrideQuery !== undefined ? overrideQuery : searchQuery;
    if (!queryToSearch.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const response = await axios.post("/api/research", { query: queryToSearch });
      setResults(response.data.cases);

      // Save to Firestore
      await addDoc(collection(db, "case_searches"), {
        uid: user.uid,
        query: queryToSearch,
        resultCount: response.data.cases.length,
        createdAt: new Date()
      });
      
      // Refresh history
      const q = query(
        collection(db, "case_searches"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      setHistory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const quickFilters = [
    { label: "Title", prefix: "title: " },
    { label: "Act", prefix: "act: " },
    { label: "Topic", prefix: "" },
  ];

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
                  link.path === "/case-explorer" 
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
            <h1 className="text-4xl font-bold serif text-primary">Case Explorer</h1>
            <p className="text-gray-500 mt-2">Search through millions of Indian court cases and precedents.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-accent/5 text-accent text-xs font-bold rounded-lg border border-accent/10">
            <TrendingUp size={14} />
            Powered by Indian Kanoon
          </div>
        </div>

        {/* Search Bar */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text" 
              placeholder="Search by case name, act, or legal topic (e.g., 'Section 302 IPC', 'Kesavananda Bharati')..."
              className="w-full h-20 pl-20 pr-8 bg-white border-2 border-gray-100 rounded-[30px] text-lg focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-xl shadow-gray-100/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={24} />
            <button 
              type="submit"
              disabled={isSearching}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="animate-spin" size={20} /> : "Search"}
            </button>
          </form>
          
          <div className="flex items-center gap-3 px-4">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Quick Search:</span>
            {quickFilters.map((f, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setSearchQuery(f.prefix);
                  // Focus input? (Optional)
                }}
                className="px-4 py-1.5 bg-white border border-gray-100 rounded-full text-xs font-medium text-gray-500 hover:border-accent hover:text-accent transition-all"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Results Area */}
          <div className="lg:col-span-2 space-y-6">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="animate-spin text-accent mb-4" size={40} />
                <p className="text-gray-500 font-medium">Searching Indian Kanoon database...</p>
              </div>
            ) : results.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {results.map((c, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors serif leading-tight">
                        {c.title}
                      </h3>
                      <a 
                        href={c.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-accent hover:bg-accent/5 transition-all"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                    <div 
                      className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: c.snippet }}
                    />
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-bg-soft text-[10px] font-bold uppercase tracking-wider text-gray-400 rounded-md">
                        Supreme Court / High Court
                      </span>
                      <span className="text-[10px] text-gray-300 font-bold">•</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Precedent
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : searchQuery && !isSearching ? (
              <div className="bg-white p-20 rounded-[40px] border border-gray-100 text-center">
                <p className="text-gray-400 font-medium">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="bg-white p-20 rounded-[40px] border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-bg-soft rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-primary serif mb-2">Start your research</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  Enter a case name or legal topic to find relevant precedents and judgments.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* History */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <History className="text-accent" size={20} />
                <h3 className="font-bold text-primary serif">Recent Searches</h3>
              </div>
              <div className="space-y-4">
                {history.length > 0 ? history.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setSearchQuery(item.query);
                      handleSearch(undefined, item.query);
                    }}
                    className="w-full text-left p-4 rounded-2xl hover:bg-bg-soft transition-colors group"
                  >
                    <p className="text-sm font-bold text-primary group-hover:text-accent transition-colors truncate">
                      {item.query}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {item.resultCount} results found
                    </p>
                  </button>
                )) : (
                  <p className="text-xs text-gray-400 text-center py-4 italic">No recent searches</p>
                )}
              </div>
            </div>

            {/* Filters Mock */}
            <div className="bg-primary text-white p-8 rounded-[32px] shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="text-accent" size={20} />
                <h3 className="font-bold serif">Advanced Filters</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Court Type</p>
                  <div className="flex flex-wrap gap-2">
                    {['Supreme Court', 'High Courts', 'District Courts'].map((t, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-white/20 transition-colors">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Year Range</p>
                  <div className="h-1 w-full bg-white/10 rounded-full relative">
                    <div className="absolute left-0 top-0 h-full w-2/3 bg-accent rounded-full" />
                    <div className="absolute left-0 -top-1.5 w-4 h-4 bg-white rounded-full shadow-lg" />
                    <div className="absolute left-2/3 -top-1.5 w-4 h-4 bg-white rounded-full shadow-lg" />
                  </div>
                  <div className="flex justify-between mt-3 text-[10px] font-bold text-white/60">
                    <span>1950</span>
                    <span>2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
