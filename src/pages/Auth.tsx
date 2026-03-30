import { useState } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { User, UserRole, useAuth } from "../App";
import { motion } from "motion/react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Loader2, Chrome } from "lucide-react";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

export default function Auth() {
  const { user, loading: authLoading } = useAuth();
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    barId: "",
    specialization: "",
    experience: ""
  });

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user exists in Firestore
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
      }
      
      if (!userDoc?.exists()) {
        // If new user, save with selected role
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "User",
          role: (role as UserRole) || "Citizen",
          specialization: "",
          experience: "",
          barId: "",
          createdAt: new Date() // Firestore SDK converts JS Date to Timestamp
        };

        try {
          await setDoc(doc(db, "users", firebaseUser.uid), userData);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
        }
      }

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      // If it's the JSON error from handleFirestoreError, we might want to parse it or just show a friendly message
      try {
        const parsed = JSON.parse(err.message);
        setError(`Permission Denied: ${parsed.operationType} on ${parsed.path}`);
      } catch {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        navigate("/dashboard");
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const firebaseUser = userCredential.user;

        await updateProfile(firebaseUser, { displayName: formData.name });

        const userData = {
          uid: firebaseUser.uid,
          email: formData.email,
          name: formData.name,
          role: (role as UserRole) || "Citizen",
          specialization: formData.specialization,
          experience: formData.experience,
          barId: formData.barId,
          createdAt: new Date()
        };

        try {
          await setDoc(doc(db, "users", firebaseUser.uid), userData);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
        }

        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      try {
        const parsed = JSON.parse(err.message);
        setError(`Permission Denied: ${parsed.operationType} on ${parsed.path}`);
      } catch {
        setError(err.message || "An error occurred during authentication");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-xl p-12 rounded-[40px] shadow-xl border border-gray-100"
      >
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-4 block">{role}</span>
          <h2 className="text-4xl font-bold serif text-primary mb-3">Welcome to LawBridge</h2>
          <p className="text-gray-500 text-sm">Sign in or create an account</p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-10">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-primary'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-primary'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white border border-gray-200 text-primary font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 mb-6 shadow-sm"
          >
            <Chrome size={20} className="text-accent" />
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative px-4 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or use email</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 ml-1">Email</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 ml-1">Confirm Password</label>
                <input 
                  type="password" 
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 ml-1">Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="Your full name"
                />
              </div>

              {role === "Advocate" && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 ml-1">Bar Council ID</label>
                    <input 
                      type="text" 
                      required
                      value={formData.barId}
                      onChange={(e) => setFormData({...formData, barId: e.target.value})}
                      className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="MAH/XXX/20XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 ml-1">Specialization</label>
                    <input 
                      type="text" 
                      required
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="e.g., Civil, Criminal"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 ml-1">Experience (years)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                      placeholder="3"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary text-white font-bold rounded-2xl hover:opacity-95 transition-opacity shadow-lg shadow-primary/20 mt-4 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="mt-10 text-center space-y-4">
          <p className="text-accent text-sm font-medium cursor-pointer hover:underline">Bad Request</p>
          <Link to="/roles" className="text-accent text-sm font-medium block hover:underline">Choose a different role</Link>
        </div>
      </motion.div>
    </div>
  );
}
