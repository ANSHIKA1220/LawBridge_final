import { useState, useEffect } from "react";
import { User } from "../../App";
import { 
  Scale, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Send, 
  Paperclip, 
  MoreVertical, 
  ArrowLeft,
  Loader2,
  Calendar,
  User as UserIcon,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, getDocs, updateDoc, doc, orderBy, where, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";
import { format } from "date-fns";

interface Workspace {
  id: string;
  advocateId: string;
  clientId: string;
  title: string;
  status: 'Active' | 'Closed' | 'Archived';
  milestones?: { title: string; completed: boolean }[];
  createdAt: any;
  clientName?: string;
  advocateName?: string;
}

interface Message {
  id: string;
  workspaceId: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export default function CaseWorkspace({ user }: { user: User }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      const q = query(
        collection(db, `case_workspaces/${selectedWorkspace.id}/messages`),
        orderBy("createdAt", "asc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        setMessages(msgData);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `case_workspaces/${selectedWorkspace.id}/messages`);
      });
      return () => unsubscribe();
    }
  }, [selectedWorkspace]);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    try {
      const field = user.role === 'Advocate' ? 'advocateId' : 'clientId';
      const q = query(
        collection(db, "case_workspaces"), 
        where(field, "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const workspaceData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
      
      // Enrich with names
      const enriched = await Promise.all(workspaceData.map(async (ws) => {
        const otherId = user.role === 'Advocate' ? ws.clientId : ws.advocateId;
        const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", otherId)));
        if (!userSnap.empty) {
          const uData = userSnap.docs[0].data();
          return { 
            ...ws, 
            clientName: user.role === 'Advocate' ? uData.name : user.name,
            advocateName: user.role === 'Advocate' ? user.name : uData.name
          };
        }
        return ws;
      }));

      setWorkspaces(enriched);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "case_workspaces");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedWorkspace || isSending) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, `case_workspaces/${selectedWorkspace.id}/messages`), {
        workspaceId: selectedWorkspace.id,
        senderId: user.uid,
        text: newMessage,
        createdAt: serverTimestamp()
      });
      setNewMessage("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `case_workspaces/${selectedWorkspace.id}/messages`);
    } finally {
      setIsSending(false);
    }
  };

  if (selectedWorkspace) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 h-[calc(100vh-100px)] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setSelectedWorkspace(null)}
            className="p-3 bg-bg-soft text-primary rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 font-bold"
          >
            <ArrowLeft size={20} />
            Back to Workspaces
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <h2 className="text-xl font-bold serif text-primary">{selectedWorkspace.title}</h2>
              <p className="text-xs text-gray-400">
                With {user.role === 'Advocate' ? selectedWorkspace.clientName : selectedWorkspace.advocateName}
              </p>
            </div>
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent font-bold">
              {(user.role === 'Advocate' ? selectedWorkspace.clientName : selectedWorkspace.advocateName)?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden">
          {/* Main Chat Area */}
          <div className="lg:col-span-3 flex flex-col bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex-1 p-8 overflow-y-auto space-y-6">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] p-5 rounded-[24px] ${
                    msg.senderId === user.uid 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-bg-soft text-primary rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-2 ${msg.senderId === user.uid ? 'text-white/50' : 'text-gray-400'}`}>
                      {msg.createdAt ? (
                        (() => {
                          try {
                            const date = msg.createdAt.seconds 
                              ? new Date(msg.createdAt.seconds * 1000) 
                              : new Date(msg.createdAt);
                            return isNaN(date.getTime()) ? "..." : format(date, "HH:mm");
                          } catch (e) {
                            return "...";
                          }
                        })()
                      ) : "..."}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-6 bg-bg-soft border-t border-gray-100">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Type your message here..."
                  className="w-full h-16 pl-6 pr-32 bg-white border-2 border-transparent rounded-2xl text-sm focus:border-accent transition-all outline-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button type="button" className="p-3 text-gray-400 hover:text-primary transition-all">
                    <Paperclip size={20} />
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSending}
                    className="p-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar: Case Details & Milestones */}
          <div className="space-y-6 overflow-y-auto pr-2">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Case Milestones</h3>
              <div className="space-y-4">
                {selectedWorkspace.milestones?.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      m.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200'
                    }`}>
                      {m.completed && <CheckCircle2 size={12} />}
                    </div>
                    <span className={`text-sm ${m.completed ? 'text-gray-400 line-through' : 'text-primary font-medium'}`}>
                      {m.title}
                    </span>
                  </div>
                )) || (
                  <p className="text-xs text-gray-400 italic">No milestones defined yet.</p>
                )}
                {user.role === 'Advocate' && (
                  <button className="w-full py-3 mt-4 border-2 border-dashed border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2">
                    <Plus size={14} />
                    Add Milestone
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Shared Documents</h3>
              <div className="space-y-3">
                <div className="p-4 bg-bg-soft rounded-2xl flex items-center gap-3 group cursor-pointer hover:bg-gray-100 transition-all">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-primary truncate">Initial_Case_Summary.pdf</p>
                    <p className="text-[10px] text-gray-400">Shared on Mar 28</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold serif text-primary">Case Workspaces</h1>
          <p className="text-gray-500 mt-2">Secure collaborative spaces for active legal consultations.</p>
        </div>
        <button 
          onClick={fetchWorkspaces}
          className="px-6 py-3 bg-bg-soft text-primary font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          Refresh Workspaces
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="animate-spin text-accent mx-auto mb-4" size={32} />
            <p className="text-gray-500 font-medium">Loading workspaces...</p>
          </div>
        ) : workspaces.length > 0 ? (
          workspaces.map((ws) => (
            <motion.div 
              key={ws.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => setSelectedWorkspace(ws)}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                  <Scale size={28} />
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  ws.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {ws.status}
                </span>
              </div>

              <h3 className="text-xl font-bold serif text-primary mb-2 group-hover:text-accent transition-colors">
                {ws.title}
              </h3>
              <p className="text-sm text-gray-400 mb-8">
                With {user.role === 'Advocate' ? ws.clientName : ws.advocateName}
              </p>

              <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar size={14} />
                  {ws.createdAt ? (
                    (() => {
                      try {
                        const date = ws.createdAt.seconds 
                          ? new Date(ws.createdAt.seconds * 1000) 
                          : new Date(ws.createdAt);
                        return isNaN(date.getTime()) ? "N/A" : format(date, "MMM d, yyyy");
                      } catch (e) {
                        return "N/A";
                      }
                    })()
                  ) : "N/A"}
                </div>
                <div className="flex items-center gap-2 text-accent font-bold text-sm">
                  Open Workspace
                  <ArrowLeft className="rotate-180" size={16} />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-gray-100">
            <div className="w-16 h-16 bg-bg-soft rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
              <Scale size={32} />
            </div>
            <p className="text-gray-500 font-medium">No active workspaces found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
