import { useState, useEffect } from "react";
import { User } from "../../App";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User as UserIcon, 
  MessageSquare, 
  Calendar,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, getDocs, updateDoc, doc, orderBy, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";
import { format } from "date-fns";

interface ConsultationRequest {
  id: string;
  uid: string;
  advocateId: string;
  advocateName?: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: any;
  userName?: string;
  userEmail?: string;
  query?: string;
}

export default function ClientRequests({ user: advocateUser }: { user: User }) {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "consultation_requests"), 
        where("advocateId", "==", advocateUser.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const requestData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConsultationRequest));
      
      // Fetch user details for each request
      const enrichedRequests = await Promise.all(requestData.map(async (req) => {
        const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", req.uid)));
        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data();
          return { ...req, userName: userData.name, userEmail: userData.email };
        }
        return req;
      }));

      setRequests(enrichedRequests);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "consultation_requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (requestId: string, clientId: string, status: 'Accepted' | 'Rejected') => {
    try {
      await updateDoc(doc(db, "consultation_requests", requestId), { 
        status,
        updatedAt: serverTimestamp() 
      });

      // If accepted, create a Case Workspace
      if (status === 'Accepted') {
        const workspaceData = {
          advocateId: advocateUser.uid,
          clientId: clientId,
          title: `Consultation with ${advocateUser.name}`,
          status: 'Active',
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "case_workspaces"), workspaceData);
      }

      // Create notification for client
      await addDoc(collection(db, "notifications"), {
        uid: clientId,
        title: `Consultation ${status}`,
        message: status === 'Accepted' 
          ? `Advocate ${advocateUser.name} has accepted your consultation request. A case workspace has been created.`
          : `Advocate ${advocateUser.name} has declined your consultation request.`,
        type: status === 'Accepted' ? 'Success' : 'Error',
        read: false,
        createdAt: serverTimestamp()
      });

      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `consultation_requests/${requestId}`);
    }
  };

  const filteredRequests = requests.filter(r => {
    return statusFilter === "All" || r.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold serif text-primary">Client Requests</h1>
          <p className="text-gray-500 mt-2">Manage incoming consultation requests and start new case collaborations.</p>
        </div>
        <button 
          onClick={fetchRequests}
          className="px-6 py-3 bg-bg-soft text-primary font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          Refresh Requests
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex bg-bg-soft p-1 rounded-xl border border-gray-100">
          {["All", "Pending", "Accepted", "Rejected"].map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === status ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-primary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="animate-spin text-accent mx-auto mb-4" size={32} />
            <p className="text-gray-500 font-medium">Loading client requests...</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <motion.div 
              key={req.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent font-bold text-lg">
                    {req.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-lg">{req.userName}</h3>
                    <p className="text-sm text-gray-400">{req.userEmail}</p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  req.status === 'Accepted' ? 'bg-green-100 text-green-600' :
                  req.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {req.status}
                </span>
              </div>

              {req.query && (
                <div className="p-6 bg-bg-soft rounded-2xl mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Case Summary / Query</p>
                  <p className="text-sm text-primary leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                    {req.query}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar size={14} />
                  {req.createdAt ? (
                    (() => {
                      try {
                        const date = req.createdAt.seconds 
                          ? new Date(req.createdAt.seconds * 1000) 
                          : new Date(req.createdAt);
                        return isNaN(date.getTime()) ? "N/A" : format(date, "MMM d, yyyy");
                      } catch (e) {
                        return "N/A";
                      }
                    })()
                  ) : "N/A"}
                </div>
                {req.status === 'Pending' ? (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleAction(req.id, req.uid, 'Rejected')}
                      className="px-6 py-2.5 text-red-600 font-bold text-sm hover:bg-red-50 rounded-xl transition-all"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, req.uid, 'Accepted')}
                      className="px-8 py-2.5 bg-accent text-white font-bold text-sm rounded-xl hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all"
                    >
                      Accept Request
                    </button>
                  </div>
                ) : req.status === 'Accepted' ? (
                  <button className="flex items-center gap-2 text-accent font-bold text-sm hover:gap-3 transition-all">
                    Go to Workspace
                    <ArrowRight size={16} />
                  </button>
                ) : null}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-gray-100">
            <div className="w-16 h-16 bg-bg-soft rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
              <MessageSquare size={32} />
            </div>
            <p className="text-gray-500 font-medium">No consultation requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
