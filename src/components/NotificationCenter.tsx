import { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Clock,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "../App";
import { format } from "date-fns";

interface Notification {
  id: string;
  uid: string;
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  read: boolean;
  createdAt: any;
}

export default function NotificationCenter({ user }: { user: User }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "notifications"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        setNotifications(notifData);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Success': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'Warning': return <AlertCircle className="text-orange-500" size={18} />;
      case 'Error': return <XCircle className="text-red-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-bg-soft text-primary rounded-xl hover:bg-gray-100 transition-all relative group"
      >
        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-white rounded-[32px] border border-gray-100 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-bg-soft/50">
                <h3 className="font-bold text-primary text-sm uppercase tracking-widest">Notifications</h3>
                <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-full">
                  {unreadCount} New
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-6 hover:bg-gray-50 transition-colors relative group ${!n.read ? 'bg-accent/5' : ''}`}
                        onClick={() => !n.read && markAsRead(n.id)}
                      >
                        <div className="flex gap-4">
                          <div className="mt-1">{getIcon(n.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold text-primary mb-1 ${!n.read ? 'pr-6' : ''}`}>{n.title}</p>
                            <p className="text-xs text-gray-500 leading-relaxed mb-2">{n.message}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <Clock size={12} />
                              {n.createdAt ? (
                                (() => {
                                  try {
                                    const date = n.createdAt.seconds 
                                      ? new Date(n.createdAt.seconds * 1000) 
                                      : new Date(n.createdAt);
                                    return isNaN(date.getTime()) ? "..." : format(date, "HH:mm, MMM d");
                                  } catch (e) {
                                    return "...";
                                  }
                                })()
                              ) : "..."}
                            </div>
                          </div>
                        </div>
                        
                        <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          {!n.read && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                              className="p-1.5 bg-white text-green-500 rounded-lg shadow-sm hover:bg-green-50 transition-all"
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                            className="p-1.5 bg-white text-red-500 rounded-lg shadow-sm hover:bg-red-50 transition-all"
                            title="Delete"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-bg-soft rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                      <Bell size={24} />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">All caught up!</p>
                    <p className="text-xs text-gray-400 mt-1">No new notifications for you.</p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-bg-soft/50 border-t border-gray-50 text-center">
                  <button className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-all">
                    View All Activity
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
