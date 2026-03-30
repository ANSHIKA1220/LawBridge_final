import { Link, Navigate } from "react-router-dom";
import { User, GraduationCap, Scale, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../App";

const roles = [
  {
    id: "Citizen",
    title: "Citizen",
    desc: "Access document analysis, legal Q&A, and case explorer.",
    icon: <User className="text-purple-600" />,
    bg: "bg-purple-50"
  },
  {
    id: "Advocate",
    title: "Advocate",
    desc: "Manage client requests, case workspaces, and AI drafting.",
    icon: <Scale className="text-orange-600" />,
    bg: "bg-orange-50"
  },
  {
    id: "Admin",
    title: "Admin",
    desc: "Invite-only access for system management and verification.",
    icon: <Settings className="text-gray-600" />,
    bg: "bg-gray-50"
  }
];

export default function RoleSelection() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-[80vh] bg-bg-soft flex flex-col items-center justify-center px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold serif mb-6 text-primary">Choose your role</h1>
        <p className="text-gray-500 text-lg">Select a role to continue to login or registration</p>
      </motion.div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {roles.map((role, idx) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link 
              to={`/auth/${role.id}`}
              className="group block bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-accent/20 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 ${role.bg} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                  {role.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-primary group-hover:text-accent transition-colors">{role.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{role.desc}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
