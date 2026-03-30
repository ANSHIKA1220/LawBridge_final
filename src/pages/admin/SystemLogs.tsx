import { useState, useEffect } from "react";
import { User } from "../../App";
import { 
  Activity, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  User as UserIcon, 
  Shield, 
  AlertCircle,
  Loader2,
  Terminal,
  Database,
  Cpu,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, getDocs, orderBy, limit, where } from "firebase/firestore";
import { db } from "../../firebase";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";
import { format } from "date-fns";

interface SystemLog {
  id: string;
  uid?: string;
  action: string;
  details: string;
  ip?: string;
  createdAt: any;
  userName?: string;
}

export default function SystemLogs({ user: adminUser }: { user: User }) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "system_logs"), orderBy("createdAt", "desc"), limit(100));
      const querySnapshot = await getDocs(q);
      const logData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SystemLog));
      
      // Fetch user details for logs with uid
      const enrichedLogs = await Promise.all(logData.map(async (log) => {
        if (log.uid) {
          const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", log.uid)));
          if (!userSnap.empty) {
            const userData = userSnap.docs[0].data();
            return { ...log, userName: userData.name };
          }
        }
        return log;
      }));

      setLogs(enrichedLogs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "system_logs");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (l.userName?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "All" || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = ["All", ...new Set(logs.map(l => l.action))];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold serif text-primary">System Logs</h1>
          <p className="text-gray-500 mt-2">Real-time audit trail of all critical system events and user actions.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Monitoring Active
          </div>
          <button 
            onClick={fetchLogs}
            className="px-6 py-3 bg-bg-soft text-primary font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Events", value: logs.length, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "AI API Calls", value: logs.filter(l => l.action.includes("AI")).length, icon: Cpu, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Security Events", value: logs.filter(l => l.action.includes("Auth") || l.action.includes("Security")).length, icon: Shield, color: "text-red-600", bg: "bg-red-50" },
          { label: "Database Ops", value: logs.filter(l => l.action.includes("Write") || l.action.includes("Update")).length, icon: Database, color: "text-green-600", bg: "bg-green-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 relative group">
          <input 
            type="text" 
            placeholder="Search logs by action, details, or user..."
            className="w-full h-14 pl-12 pr-6 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={18} />
        </div>
        <select 
          className="h-14 px-6 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:border-accent transition-all outline-none cursor-pointer"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          {uniqueActions.map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-soft border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Action</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">User</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Details</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-accent mx-auto mb-4" size={32} />
                    <p className="text-gray-500 font-medium">Loading system logs...</p>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} />
                        {log.createdAt ? (
                          (() => {
                            try {
                              const date = log.createdAt.seconds 
                                ? new Date(log.createdAt.seconds * 1000) 
                                : new Date(log.createdAt);
                              return isNaN(date.getTime()) ? "N/A" : format(date, "HH:mm:ss, MMM d");
                            } catch (e) {
                              return "N/A";
                            }
                          })()
                        ) : "N/A"}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.action.includes('AI') ? 'bg-purple-100 text-purple-600' :
                        log.action.includes('Auth') ? 'bg-red-100 text-red-600' :
                        log.action.includes('Write') ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <UserIcon size={14} className="text-gray-300" />
                        <span className="text-xs font-medium text-primary">{log.userName || "System"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-gray-500 max-w-xs truncate group-hover:max-w-none group-hover:whitespace-normal transition-all">
                        {log.details}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Globe size={14} />
                        {log.ip || "127.0.0.1"}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-bg-soft rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                      <Terminal size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">No logs found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
