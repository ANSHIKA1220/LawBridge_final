/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { handleFirestoreError, OperationType } from "./lib/firestore-errors";
import Home from "./pages/Home";
import RoleSelection from "./pages/RoleSelection";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import LegalQA from "./pages/LegalQA";
import DocumentAuditor from "./pages/DocumentAuditor";
import Understanding from "./pages/Understanding";
import CaseExplorer from "./pages/CaseExplorer";
import CourtPrep from "./pages/CourtPrep";
import AdvocateConnect from "./pages/AdvocateConnect";
import MockCaseSimulator from "./pages/MockCaseSimulator";
import CaseStudiesLibrary from "./pages/CaseStudiesLibrary";
import LearningHub from "./pages/LearningHub";
import PracticeQuestions from "./pages/PracticeQuestions";
import Placeholder from "./pages/Placeholder";
import Layout from "./components/Layout";

// New Pages
import UserManagement from "./pages/admin/UserManagement";
import AdvocateVerification from "./pages/admin/AdvocateVerification";
import SystemLogs from "./pages/admin/SystemLogs";
import Analytics from "./pages/admin/Analytics";
import ClientRequests from "./pages/advocate/ClientRequests";
import CaseWorkspace from "./pages/advocate/CaseWorkspace";
import AIDrafting from "./pages/advocate/AIDrafting";

export type UserRole = "Citizen" | "Student" | "Advocate" | "Admin";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Suspended' | 'Pending Verification';
  createdAt: any;
  specialization?: string;
  experience?: string;
  barId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        unsubscribeSnapshot = onSnapshot(doc(db, "users", firebaseUser.uid), (doc) => {
          if (doc.exists()) {
            setUser(doc.data() as User);
          } else {
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-soft">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout: handleLogout }}>
      <Router>
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roles" element={<RoleSelection />} />
            <Route path="/auth/:role" element={<Auth />} />
            
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  <Dashboard user={user} />
                ) : auth.currentUser ? (
                  <div className="min-h-screen flex items-center justify-center bg-bg-soft">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Navigate to="/roles" />
                )
              } 
            />
            <Route 
              path="/legal-qa" 
              element={user ? <LegalQA user={user} /> : <Navigate to="/roles" />} 
            />
            <Route 
              path="/document-auditor" 
              element={user ? <DocumentAuditor user={user} /> : <Navigate to="/roles" />} 
            />
            <Route 
              path="/understanding" 
              element={user ? <Understanding user={user} /> : <Navigate to="/roles" />} 
            />
            <Route 
              path="/case-explorer" 
              element={user ? <CaseExplorer user={user} /> : <Navigate to="/roles" />} 
            />
            <Route 
              path="/court-prep" 
              element={user ? <CourtPrep user={user} /> : <Navigate to="/roles" />} 
            />
            <Route 
              path="/advocate-connect" 
              element={user ? <AdvocateConnect user={user} /> : <Navigate to="/roles" />} 
            />
            <Route 
              path="/mock-case" 
              element={user ? <MockCaseSimulator user={user} /> : <Navigate to="/roles" />} 
            />
            <Route 
              path="/case-studies" 
              element={user ? <CaseStudiesLibrary user={user} /> : <Navigate to="/roles" />} 
            />
            <Route 
              path="/learning-hub" 
              element={user ? <LearningHub user={user} /> : <Navigate to="/roles" />} 
            />
            <Route 
              path="/practice" 
              element={user ? <PracticeQuestions user={user} /> : <Navigate to="/roles" />} 
            />
            
            {/* Admin Routes */}
            <Route path="/admin/users" element={user?.role === "Admin" ? <UserManagement user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/verifications" element={user?.role === "Admin" ? <AdvocateVerification user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/logs" element={user?.role === "Admin" ? <SystemLogs user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/reports" element={user?.role === "Admin" ? <Analytics user={user} /> : <Navigate to="/dashboard" />} />

            {/* Advocate Routes */}
            <Route path="/client-requests" element={user?.role === "Advocate" ? <ClientRequests user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/case-workspace" element={user ? <CaseWorkspace user={user} /> : <Navigate to="/roles" />} />
            <Route path="/advocate/drafting" element={user?.role === "Advocate" ? <AIDrafting user={user} /> : <Navigate to="/dashboard" />} />

            {/* Placeholder Routes */}
            <Route path="/templates" element={user ? <Placeholder user={user} title="Templates" /> : <Navigate to="/roles" />} />
            <Route path="/profile" element={user ? <Placeholder user={user} title="Profile" /> : <Navigate to="/roles" />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthContext.Provider>
  );
}
