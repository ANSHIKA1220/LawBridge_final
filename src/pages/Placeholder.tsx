import { User } from "../App";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  BookOpen, 
  Scale, 
  MessageSquare, 
  AlertCircle
} from "lucide-react";

export default function Placeholder({ user, title }: { user: User, title: string }) {
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
                  link.label === title 
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

      <div className="flex-grow bg-white p-20 rounded-[40px] border border-gray-100 shadow-xl flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-bg-soft rounded-3xl flex items-center justify-center text-accent mb-8">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-3xl font-bold serif mb-4">{title}</h2>
        <p className="text-gray-500 max-w-md leading-relaxed">
          This feature is currently under development for the LawBridge academic prototype. Check back soon for updates!
        </p>
        <Link to="/dashboard" className="mt-10 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
