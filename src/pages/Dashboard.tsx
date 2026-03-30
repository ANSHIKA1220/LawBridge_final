import { User } from "../App";
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  BookOpen, 
  Scale, 
  MessageSquare, 
  UserCircle,
  HelpCircle,
  ChevronRight,
  Clock,
  AlertCircle,
  Sparkles,
  Users,
  ShieldCheck,
  Activity,
  BarChart3
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const location = useLocation();

  const getSidebarLinks = () => {
    switch (user.role) {
      case "Citizen":
        return [
          { icon: <LayoutDashboard size={18} />, label: "Dashboard", path: "/dashboard" },
          { icon: <FileText size={18} />, label: "Document Analyzer", path: "/document-auditor" },
          { icon: <BookOpen size={18} />, label: "Understanding", path: "/understanding" },
          { icon: <Search size={18} />, label: "Legal Q&A", path: "/legal-qa" },
          { icon: <Search size={18} />, label: "Case Explorer", path: "/case-explorer" },
          { icon: <Scale size={18} />, label: "Court Prep", path: "/court-prep" },
          { icon: <MessageSquare size={18} />, label: "Advocate Connect", path: "/advocate-connect" },
        ];
      case "Student":
        return [
          { icon: <LayoutDashboard size={18} />, label: "Dashboard", path: "/dashboard" },
          { icon: <Scale size={18} />, label: "Mock Case Simulator", path: "/mock-case" },
          { icon: <BookOpen size={18} />, label: "Case Studies Library", path: "/case-studies" },
          { icon: <BookOpen size={18} />, label: "Learning Hub", path: "/learning-hub" },
          { icon: <HelpCircle size={18} />, label: "Practice Questions", path: "/practice" },
        ];
      case "Advocate":
        return [
          { icon: <LayoutDashboard size={18} />, label: "Dashboard", path: "/dashboard" },
          { icon: <MessageSquare size={18} />, label: "Client Requests", path: "/client-requests" },
          { icon: <FileText size={18} />, label: "Case Workspace", path: "/case-workspace" },
          { icon: <Search size={18} />, label: "Legal Research", path: "/case-explorer" },
          { icon: <FileText size={18} />, label: "AI Drafting", path: "/advocate/drafting" },
          { icon: <UserCircle size={18} />, label: "Profile", path: "/profile" },
        ];
      case "Admin":
        return [
          { icon: <LayoutDashboard size={18} />, label: "Dashboard", path: "/dashboard" },
          { icon: <UserCircle size={18} />, label: "User Management", path: "/admin/users" },
          { icon: <Scale size={18} />, label: "Advocate Verification", path: "/admin/verifications" },
          { icon: <FileText size={18} />, label: "System Logs", path: "/admin/logs" },
          { icon: <AlertCircle size={18} />, label: "Reports", path: "/admin/reports" },
        ];
      default:
        return [];
    }
  };

  const getDashboardCards = () => {
    switch (user.role) {
      case "Student":
        return [
          { title: "Mock Case", desc: "Test your skills in a simulated courtroom.", icon: <Scale />, path: "/mock-case" },
          { title: "Case Studies", desc: "Analyze landmark Indian legal judgments.", icon: <BookOpen />, path: "/case-studies" },
          { title: "Learning Hub", desc: "AI-powered legal education modules.", icon: <Sparkles />, path: "/learning-hub" },
          { title: "Practice", desc: "AI-generated quizzes on legal topics.", icon: <HelpCircle />, path: "/practice" }
        ];
      case "Advocate":
        return [
          { title: "Client Requests", desc: "Manage incoming consultation requests.", icon: <MessageSquare />, path: "/client-requests" },
          { title: "Case Workspace", desc: "Collaborate with clients on active cases.", icon: <FileText />, path: "/case-workspace" },
          { title: "AI Drafting", desc: "Generate legal documents with AI.", icon: <Sparkles />, path: "/advocate/drafting" },
          { title: "Legal Research", desc: "Search Indian Kanoon for precedents.", icon: <Search />, path: "/case-explorer" }
        ];
      case "Admin":
        return [
          { title: "User Management", desc: "Manage all platform users and roles.", icon: <UserCircle />, path: "/admin/users" },
          { title: "Verifications", desc: "Review advocate bar ID submissions.", icon: <Scale />, path: "/admin/verifications" },
          { title: "System Health", desc: "Monitor API usage and server logs.", icon: <AlertCircle />, path: "/admin/logs" },
          { title: "Analytics", desc: "Platform growth and usage reports.", icon: <LayoutDashboard />, path: "/admin/reports" }
        ];
      default:
        return [
          { title: "Legal Q&A", desc: "Ask our AI agent about Indian law precedents.", icon: <Search />, path: "/legal-qa" },
          { title: "Doc Auditor", desc: "Upload contracts for instant risk assessment.", icon: <FileText />, path: "/document-auditor" },
          { title: "Advocate Connect", desc: "Consult with verified legal professionals.", icon: <MessageSquare />, path: "/advocate-connect" }
        ];
    }
  };

  const getRecentActivity = () => {
    if (user.role === "Student") {
      return [
        { title: "Constitutional Law Quiz", desc: "Completed with 80% accuracy • 1 hour ago", icon: <HelpCircle /> },
        { title: "Mock Case: Property Dispute", desc: "Verdict: A+ • Yesterday", icon: <Scale /> },
        { title: "Kesavananda Bharati Analysis", desc: "Read 2 days ago", icon: <BookOpen /> }
      ];
    }
    if (user.role === "Advocate") {
      return [
        { title: "New Request: Property Dispute", desc: "From: Anjali Sharma • 30 mins ago", icon: <MessageSquare /> },
        { title: "Draft Ready: Bail Application", desc: "Case #4421 • 2 hours ago", icon: <FileText /> },
        { title: "Research Saved: Section 498A", desc: "3 precedents added to workspace", icon: <Search /> }
      ];
    }
    if (user.role === "Admin") {
      return [
        { title: "New Advocate Signup", desc: "Adv. Vikram Singh • Pending Verification", icon: <UserCircle /> },
        { title: "System Alert: API Limit", desc: "Indian Kanoon API at 85% capacity", icon: <AlertCircle /> },
        { title: "Report Generated", desc: "Weekly platform usage summary", icon: <FileText /> }
      ];
    }
    return [
      { title: "Welcome to LawBridge", desc: "Start exploring legal resources", icon: <Sparkles /> },
      { title: "Profile Setup", desc: "Complete your profile information", icon: <UserCircle /> }
    ];
  };

  const links = getSidebarLinks();
  const cards = getDashboardCards();
  const renderDashboardContent = () => {
    switch (user.role) {
      case "Advocate":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold serif">Pending Client Requests</h2>
                  <Link to="/client-requests" className="text-accent text-sm font-bold hover:underline">View All</Link>
                </div>
                <div className="space-y-4">
                  {[
                    { name: "Anjali Sharma", type: "Property Dispute", time: "30 mins ago", status: "New" },
                    { name: "Rahul Verma", type: "Contract Review", time: "2 hours ago", status: "Urgent" },
                    { name: "Suresh Gupta", type: "Bail Application", time: "Yesterday", status: "Pending" }
                  ].map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-bg-soft rounded-2xl border border-gray-100 hover:border-accent/20 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary font-bold shadow-sm">
                          {req.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{req.name}</h4>
                          <p className="text-xs text-gray-400">{req.type} • {req.time}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'Urgent' ? 'bg-red-100 text-red-600' : 
                        req.status === 'New' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary text-white p-10 rounded-3xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <ShieldCheck size={24} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-bold serif mb-4">Verification Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Bar ID Status</span>
                      <span className="text-green-400 font-bold">Verified</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Profile Completion</span>
                      <span className="text-accent font-bold">85%</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:opacity-90 transition-opacity mt-8">
                  Update Profile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: "Active Cases", value: "12", icon: <Scale />, color: "text-blue-600" },
                { title: "Consultations", value: "48", icon: <MessageSquare />, color: "text-green-600" },
                { title: "Documents", value: "156", icon: <FileText />, color: "text-purple-600" },
                { title: "Research", value: "32", icon: <Search />, color: "text-orange-600" }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-bg-soft flex items-center justify-center ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
                    <p className="text-xl font-bold text-primary">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "Admin":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: "Total Users", value: "1,284", icon: <Users />, color: "text-blue-600" },
                { title: "Active Advocates", value: "156", icon: <ShieldCheck />, color: "text-green-600" },
                { title: "API Usage", value: "72%", icon: <Activity />, color: "text-orange-600" },
                { title: "Reports", value: "12", icon: <AlertCircle />, color: "text-red-600" }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-bg-soft flex items-center justify-center ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
                    <p className="text-xl font-bold text-primary">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold serif">Pending Verifications</h2>
                  <Link to="/admin/verifications" className="text-accent text-sm font-bold hover:underline">Review All</Link>
                </div>
                <div className="space-y-4">
                  {[
                    { name: "Adv. Vikram Singh", barId: "MAH/123/2020", date: "2 hours ago" },
                    { name: "Adv. Meera Reddy", barId: "KA/456/2018", date: "5 hours ago" },
                    { name: "Adv. Amit Shah", barId: "DL/789/2022", date: "Yesterday" }
                  ].map((adv, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-bg-soft rounded-2xl border border-gray-100 hover:border-accent/20 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary font-bold shadow-sm">
                          {adv.name.charAt(5)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{adv.name}</h4>
                          <p className="text-xs text-gray-400">Bar ID: {adv.barId} • {adv.date}</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-accent transition-colors">
                        Verify
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold serif mb-6">System Health</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span>Database Load</span>
                      <span className="text-green-600">Optimal</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[24%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span>AI API Capacity</span>
                      <span className="text-orange-600">High Usage</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-[78%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span>Server Latency</span>
                      <span className="text-green-600">124ms</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[12%]" />
                    </div>
                  </div>
                </div>
                <div className="mt-10 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                  <div className="flex items-center gap-3 text-accent mb-2">
                    <Activity size={16} />
                    <span className="text-xs font-bold">Live Monitoring</span>
                  </div>
                  <p className="text-[10px] text-gray-500">All systems operational. No critical issues detected in the last 24 hours.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold serif mb-6">Recent Activity</h2>
                <div className="space-y-6">
                  {activities.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                          {activity.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{activity.title}</h4>
                          <p className="text-xs text-gray-400">{activity.desc}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-accent transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary text-white p-10 rounded-3xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <AlertCircle size={24} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-bold serif mb-4">Legal Alert</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    New amendments to the BNS (Bharatiya Nyaya Sanhita) have been notified. Check how they affect your pending cases.
                  </p>
                </div>
                <button className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:opacity-90 transition-opacity mt-8">
                  View Updates
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cards.map((card, idx) => (
                <Link 
                  key={idx} 
                  to={card.path}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-bg-soft rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <h3 className="font-bold mb-2">{card.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        );
    }
  };

  const activities = getRecentActivity();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sticky top-32">
          <div className="flex items-center gap-4 mb-10 pb-8 border-b border-gray-100">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h3 className="font-bold text-primary">{user.name || "User"}</h3>
              <p className="text-xs text-gray-400">{user.role || "Guest"} Portal</p>
            </div>
          </div>

          <nav className="space-y-2">
            {links.map((link, idx) => (
              <Link
                key={idx}
                to={link.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === link.path 
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

      {/* Main Dashboard Content */}
      <div className="flex-grow space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold serif text-primary">Welcome back, {(user.name || "User").split(' ')[0]}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock size={16} />
            Last active: Just now
          </div>
        </div>

        {renderDashboardContent()}
      </div>
    </div>
  );
}
