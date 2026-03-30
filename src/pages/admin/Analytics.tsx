import { useState, useEffect } from "react";
import { User } from "../../App";
import { 
  TrendingUp, 
  Users, 
  Scale, 
  MessageSquare, 
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  PieChart as PieIcon,
  BarChart as BarIcon,
  LineChart as LineIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, getDocs, orderBy, where, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from "date-fns";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

export default function Analytics({ user: adminUser }: { user: User }) {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeConsultations: 0,
    aiQueries: 0,
    platformGrowth: [] as any[],
    userDistribution: [] as any[],
    popularTopics: [] as any[]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch total users
      const userSnap = await getDocs(collection(db, "users"));
      const totalUsers = userSnap.size;

      // User Distribution
      const roles = ['Citizen', 'Student', 'Advocate', 'Admin'];
      const distribution = roles.map(role => ({
        name: role,
        value: userSnap.docs.filter(d => d.data().role === role).length
      }));

      // Fetch AI Queries (Legal QA)
      const qaSnap = await getDocs(collection(db, "legal_qa"));
      const aiQueries = qaSnap.size;

      // Fetch Consultations
      const consultSnap = await getDocs(collection(db, "consultation_requests"));
      const activeConsultations = consultSnap.docs.filter(d => d.data().status === 'Accepted').length;

      // Generate Growth Data (Mocking daily data for now based on actual counts)
      const days = timeRange === "7d" ? 7 : 30;
      const growthData = eachDayOfInterval({
        start: subDays(new Date(), days - 1),
        end: new Date()
      }).map(date => ({
        date: format(date, "MMM d"),
        users: Math.floor(Math.random() * 10) + 1, // Mock daily new users
        queries: Math.floor(Math.random() * 50) + 10 // Mock daily queries
      }));

      // Popular Topics (Mocking from QA data)
      const topics = [
        { name: "Property Law", value: 45 },
        { name: "Family Law", value: 32 },
        { name: "Criminal Law", value: 28 },
        { name: "Corporate Law", value: 24 },
        { name: "Taxation", value: 18 }
      ];

      setStats({
        totalUsers,
        activeConsultations,
        aiQueries,
        platformGrowth: growthData,
        userDistribution: distribution,
        popularTopics: topics
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#F27D26', '#141414', '#8E9299', '#E4E3E0'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold serif text-primary">Advanced Analytics</h1>
          <p className="text-gray-500 mt-2">Deep insights into platform performance, user behavior, and growth metrics.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-bg-soft p-1 rounded-xl border border-gray-100">
            {["7d", "30d", "90d"].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-primary'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {[
          { label: "Total Users", value: stats.totalUsers, change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "AI Consultations", value: stats.aiQueries, change: "+24%", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Active Cases", value: stats.activeConsultations, change: "+8%", icon: Scale, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={28} />
              </div>
              <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
                <ArrowUpRight size={16} />
                {stat.change}
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
            <p className="text-4xl font-bold text-primary">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Growth Chart */}
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold serif text-primary flex items-center gap-3">
              <TrendingUp className="text-accent" size={24} />
              Platform Growth
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">New Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">AI Queries</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-accent" size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.platformGrowth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F27D26" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#8E9299', fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#8E9299', fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#F27D26" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="queries" stroke="#141414" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold serif text-primary flex items-center gap-3 mb-10">
            <PieIcon className="text-accent" size={24} />
            User Distribution
          </h3>
          <div className="h-[300px] w-full flex items-center">
            {isLoading ? (
              <div className="w-full flex items-center justify-center">
                <Loader2 className="animate-spin text-accent" size={32} />
              </div>
            ) : (
              <>
                <div className="flex-1 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.userDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {stats.userDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-48 space-y-4">
                  {stats.userDistribution.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-xs font-bold text-gray-500">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-primary">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Popular Topics */}
      <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold serif text-primary flex items-center gap-3 mb-10">
          <BarIcon className="text-accent" size={24} />
          Popular Legal Topics
        </h3>
        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.popularTopics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F5F5F5" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#141414', fontWeight: 600 }}
                  width={120}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#F27D26" radius={[0, 10, 10, 0]} barSize={32}>
                  {stats.popularTopics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#F27D26' : '#141414'} opacity={1 - index * 0.15} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
