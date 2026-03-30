import { useState, useEffect } from "react";
import { User } from "../../App";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  FileText, 
  ShieldCheck,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, getDocs, updateDoc, doc, orderBy, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";
import { format } from "date-fns";

interface VerificationRequest {
  id: string;
  uid: string;
  barId: string;
  certificateUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminFeedback?: string;
  createdAt: any;
  userName?: string;
  userEmail?: string;
}

export default function AdvocateVerification({ user: adminUser }: { user: User }) {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "advocate_verifications"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const requestData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VerificationRequest));
      
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
      handleFirestoreError(error, OperationType.LIST, "advocate_verifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (requestId: string, uid: string, status: 'Approved' | 'Rejected') => {
    try {
      await updateDoc(doc(db, "advocate_verifications", requestId), { 
        status, 
        adminFeedback: feedback,
        updatedAt: serverTimestamp() 
      });

      // If approved, update user status and role
      if (status === 'Approved') {
        await updateDoc(doc(db, "users", uid), { 
          status: 'Active',
          role: 'Advocate' 
        });
      }

      // Create notification for user
      await addDoc(collection(db, "notifications"), {
        uid,
        title: `Verification ${status}`,
        message: status === 'Approved' 
          ? "Congratulations! Your advocate profile has been verified. You can now accept client requests."
          : `Your verification request was rejected. Feedback: ${feedback}`,
        type: status === 'Approved' ? 'Success' : 'Error',
        read: false,
        createdAt: serverTimestamp()
      });

      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, adminFeedback: feedback } : r));
      setSelectedRequest(null);
      setFeedback("");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `advocate_verifications/${requestId}`);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = (r.userName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                          (r.barId?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold serif text-primary">Advocate Verification</h1>
          <p className="text-gray-500 mt-2">Review and verify credentials for new advocate registrations.</p>
        </div>
        <button 
          onClick={fetchRequests}
          className="px-6 py-3 bg-bg-soft text-primary font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          Refresh Requests
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 relative group">
          <input 
            type="text" 
            placeholder="Search by name or Bar ID..."
            className="w-full h-14 pl-12 pr-6 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={18} />
        </div>
        <select 
          className="h-14 px-6 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:border-accent transition-all outline-none cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="animate-spin text-accent mx-auto mb-4" size={32} />
            <p className="text-gray-500 font-medium">Loading verification requests...</p>
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
                  req.status === 'Approved' ? 'bg-green-100 text-green-600' :
                  req.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {req.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-bg-soft rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Bar Council ID</p>
                  <p className="font-bold text-primary font-mono">{req.barId}</p>
                </div>
                <div className="p-4 bg-bg-soft rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Submitted On</p>
                  <p className="font-bold text-primary">
                    {req.createdAt ? format(new Date(req.createdAt.seconds * 1000), "MMM d, yyyy") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a 
                  href={req.certificateUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 h-12 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                >
                  <FileText size={18} />
                  View Certificate
                  <ExternalLink size={14} />
                </a>
                {req.status === 'Pending' && (
                  <button 
                    onClick={() => setSelectedRequest(req)}
                    className="h-12 px-6 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all"
                  >
                    Take Action
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-gray-100">
            <div className="w-16 h-16 bg-bg-soft rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <p className="text-gray-500 font-medium">No verification requests found.</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] p-10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold serif text-primary mb-2">Review Request</h2>
              <p className="text-gray-500 mb-8">Review the credentials for <span className="font-bold text-primary">{selectedRequest.userName}</span>.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Admin Feedback (Optional)</label>
                  <textarea 
                    className="w-full h-32 p-5 bg-bg-soft border-2 border-transparent rounded-2xl text-sm focus:border-accent transition-all outline-none resize-none"
                    placeholder="Provide feedback for the advocate..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleAction(selectedRequest.id, selectedRequest.uid, 'Rejected')}
                    className="h-14 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAction(selectedRequest.id, selectedRequest.uid, 'Approved')}
                    className="h-14 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    Approve
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
