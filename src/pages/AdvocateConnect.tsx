import { useState, useEffect } from "react";
import { User } from "../App";
import { 
  Search, 
  FileText, 
  LayoutDashboard, 
  BookOpen, 
  Scale, 
  MessageSquare, 
  Loader2,
  MapPin,
  Star,
  Award,
  Calendar,
  Filter,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

const MOCK_ADVOCATES = [
  { id: 1, name: "Adv. Rajesh Sharma", specialization: "Criminal Law", experience: "15+ Years", location: "New Delhi", rating: 4.9, reviews: 124, image: "https://picsum.photos/seed/adv1/200/200" },
  { id: 2, name: "Adv. Priya Iyer", specialization: "Family Law", experience: "10+ Years", location: "Mumbai", rating: 4.8, reviews: 89, image: "https://picsum.photos/seed/adv2/200/200" },
  { id: 3, name: "Adv. Vikram Singh", specialization: "Property Law", experience: "20+ Years", location: "Chandigarh", rating: 5.0, reviews: 210, image: "https://picsum.photos/seed/adv3/200/200" },
  { id: 4, name: "Adv. Ananya Reddy", specialization: "Corporate Law", experience: "8+ Years", location: "Hyderabad", rating: 4.7, reviews: 56, image: "https://picsum.photos/seed/adv4/200/200" },
  { id: 5, name: "Adv. Sameer Khan", specialization: "Civil Litigation", experience: "12+ Years", location: "Lucknow", rating: 4.6, reviews: 78, image: "https://picsum.photos/seed/adv5/200/200" },
  { id: 6, name: "Adv. Meera Joshi", specialization: "Intellectual Property", experience: "18+ Years", location: "Bangalore", rating: 4.9, reviews: 145, image: "https://picsum.photos/seed/adv6/200/200" },
];

export default function AdvocateConnect({ user }: { user: User }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const [isRequesting, setIsRequesting] = useState<number | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<number | null>(null);

  const filteredAdvocates = MOCK_ADVOCATES.filter(adv => {
    const matchesSearch = adv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          adv.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = selectedSpecialization === "All" || adv.specialization === selectedSpecialization;
    return matchesSearch && matchesSpec;
  });

  const handleRequestConsultation = async (advId: number) => {
    setIsRequesting(advId);
    try {
      // Save consultation request to Firestore
      await addDoc(collection(db, "consultation_requests"), {
        uid: user.uid,
        advocateId: advId,
        advocateName: MOCK_ADVOCATES.find(a => a.id === advId)?.name,
        status: "Pending",
        createdAt: new Date()
      });
      setRequestSuccess(advId);
      setTimeout(() => setRequestSuccess(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "consultation_requests");
    } finally {
      setIsRequesting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">
      {/* Sidebar */}
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
                  link.path === "/advocate-connect" 
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

      {/* Main Content */}
      <div className="flex-grow space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold serif text-primary">Advocate Connect</h1>
            <p className="text-gray-500 mt-2">Find and connect with verified legal experts across India.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
            <ShieldCheck size={14} />
            Verified Experts
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow group">
            <input 
              type="text" 
              placeholder="Search by name or city..."
              className="w-full h-16 pl-14 pr-8 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={20} />
          </div>
          <div className="relative min-w-[200px]">
            <select 
              className="w-full h-16 px-6 bg-white border-2 border-gray-100 rounded-2xl text-sm focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-sm appearance-none cursor-pointer"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              <option value="All">All Specializations</option>
              <option value="Criminal Law">Criminal Law</option>
              <option value="Family Law">Family Law</option>
              <option value="Property Law">Property Law</option>
              <option value="Corporate Law">Corporate Law</option>
              <option value="Civil Litigation">Civil Litigation</option>
              <option value="Intellectual Property">Intellectual Property</option>
            </select>
            <Filter className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
          </div>
        </div>

        {/* Advocate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAdvocates.map((adv, idx) => (
              <motion.div 
                key={adv.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img 
                      src={adv.image} 
                      alt={adv.name} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-50"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-lg leading-tight group-hover:text-accent transition-colors">{adv.name}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={12} />
                      {adv.location}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-grow">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Specialization</span>
                    <span className="text-primary font-bold">{adv.specialization}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Experience</span>
                    <span className="text-primary font-bold">{adv.experience}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Rating</span>
                    <div className="flex items-center gap-1 text-orange-500 font-bold">
                      <Star size={12} fill="currentColor" />
                      {adv.rating}
                      <span className="text-gray-300 font-normal">({adv.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="py-3 bg-bg-soft text-primary font-bold rounded-xl text-xs hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                    <Phone size={14} />
                    Call
                  </button>
                  <button 
                    onClick={() => handleRequestConsultation(adv.id)}
                    disabled={isRequesting === adv.id || requestSuccess === adv.id}
                    className={`py-3 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                      requestSuccess === adv.id 
                        ? "bg-green-500 text-white shadow-green-200" 
                        : "bg-primary text-white shadow-primary/10 hover:opacity-90"
                    }`}
                  >
                    {isRequesting === adv.id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : requestSuccess === adv.id ? (
                      <>
                        <CheckCircle2 size={14} />
                        Requested
                      </>
                    ) : (
                      <>
                        <Calendar size={14} />
                        Consult
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAdvocates.length === 0 && (
          <div className="bg-white p-20 rounded-[40px] border border-gray-100 text-center">
            <div className="w-20 h-20 bg-bg-soft rounded-3xl mx-auto flex items-center justify-center text-gray-300 mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-primary serif mb-2">No advocates found</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Try adjusting your search query or specialization filter.
            </p>
          </div>
        )}

        {/* Trust Banner */}
        <div className="bg-bg-soft rounded-[40px] p-10 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-accent">
              <Award size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary serif">Verified Legal Network</h3>
              <p className="text-sm text-gray-500 max-w-md">
                All advocates on Law Bridge are verified through their Bar Council IDs and have been vetted for their experience and track record.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://picsum.photos/seed/face${i}/100/100`} className="w-12 h-12 rounded-full border-4 border-white object-cover" />
              ))}
            </div>
            <p className="text-xs font-bold text-primary">Join 5,000+ experts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
