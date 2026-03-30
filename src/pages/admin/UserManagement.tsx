import { useState, useEffect } from "react";
import { User } from "../../App";
import { 
  Search, 
  User as UserIcon, 
  Shield, 
  ShieldAlert, 
  MoreVertical, 
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, getDocs, updateDoc, doc, orderBy, where } from "firebase/firestore";
import { db } from "../../firebase";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";
import { format } from "date-fns";

export default function UserManagement({ user: adminUser }: { user: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const userData = querySnapshot.docs.map(doc => doc.data() as User);
      setUsers(userData);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { status: newStatus });
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, status: newStatus as any } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesStatus = statusFilter === "All" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold serif text-primary">User Management</h1>
          <p className="text-gray-500 mt-2">Manage all registered users, roles, and account statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUsers}
            className="px-6 py-3 bg-bg-soft text-primary font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 relative group">
          <input 
            type="text" 
            placeholder="Search by name or email..."
            className="w-full h-14 pl-12 pr-6 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={18} />
        </div>
        <select 
          className="h-14 px-6 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:border-accent transition-all outline-none cursor-pointer"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="Citizen">Citizen</option>
          <option value="Student">Student</option>
          <option value="Advocate">Advocate</option>
          <option value="Admin">Admin</option>
        </select>
        <select 
          className="h-14 px-6 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:border-accent transition-all outline-none cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending Verification">Pending Verification</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-soft border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">User</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Role</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Joined</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-accent mx-auto mb-4" size={32} />
                    <p className="text-gray-500 font-medium">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-primary text-sm">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'Admin' ? 'bg-purple-100 text-purple-600' :
                        u.role === 'Advocate' ? 'bg-blue-100 text-blue-600' :
                        u.role === 'Student' ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          u.status === 'Active' ? 'bg-green-500' :
                          u.status === 'Suspended' ? 'bg-red-500' :
                          'bg-orange-500'
                        }`} />
                        <span className="text-xs font-medium text-primary">{u.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-gray-500">
                        {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "N/A"}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {u.status === 'Active' ? (
                          <button 
                            onClick={() => handleUpdateStatus(u.uid, 'Suspended')}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Suspend User"
                          >
                            <XCircle size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(u.uid, 'Active')}
                            className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                            title="Activate User"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-bg-soft rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                      <UserIcon size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">No users found matching your criteria.</p>
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
