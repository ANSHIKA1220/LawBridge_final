import { Link, useNavigate } from "react-router-dom";
import { User } from "../App";
import { LogOut, Search, FileText, LayoutDashboard, Bell } from "lucide-react";
import NotificationCenter from "./NotificationCenter";

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold serif tracking-tight">
              LawBridge<span className="text-accent">.</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
              <Link to="/#how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
              <Link to="/#features" className="hover:text-primary transition-colors">Features</Link>
              <Link to="/#about" className="hover:text-primary transition-colors">About</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <NotificationCenter user={user} />
                <Link 
                  to="/document-auditor" 
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText size={16} />
                  Upload Document
                </Link>
                <Link 
                  to="/legal-qa" 
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Search size={16} />
                  Ask AI
                </Link>
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    onLogout();
                    navigate("/");
                  }}
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/roles" className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Login</Link>
                <Link to="/roles" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold serif mb-6">LawBridge.</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Academic prototype demonstrating AI-assisted legal understanding. Developed for student research and public legal awareness.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/legal-qa" className="hover:text-white transition-colors">Case Search</Link></li>
              <li><Link to="/document-auditor" className="hover:text-white transition-colors">Doc Analysis</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Script Gen</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Advocate Connect</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/#about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/#privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/#terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-6">Notice</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              This platform provides informational assistance and does not replace professional legal advice. Built for academic and research purposes.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10">
          <div className="bg-white/5 p-6 rounded-xl mb-8">
            <h5 className="text-xs font-bold uppercase tracking-widest text-accent mb-3">AI Limitations & Transparency</h5>
            <p className="text-gray-400 text-xs leading-relaxed">
              This system uses machine learning models trained on publicly available legal information. Outputs may be incomplete or inaccurate and should not be used as a substitute for professional legal advice.
            </p>
          </div>
          <p className="text-gray-500 text-xs">© 2026 LawBridge Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
