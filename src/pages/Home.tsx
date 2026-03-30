import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileText, Search, BookOpen, Scale } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="bg-bg-soft">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-8 text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 rounded-full">
              Prototype | Academic Project
            </span>
            <h1 className="text-6xl lg:text-7xl font-bold serif leading-[1.1] mb-8">
              Understand Law.<br />
              <span className="text-accent italic">Act with Confidence.</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-lg mb-12 leading-relaxed">
              An AI-powered legal assistance research platform built to help users understand legal documents, explore relevant case laws, and learn legal procedures in a simplified way.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/roles" className="px-8 py-4 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                Try Document Analyzer (Beta)
              </Link>
              <Link to="/roles" className="px-8 py-4 border border-gray-300 font-bold rounded-lg hover:bg-white transition-colors">
                Try Legal Assistant (Beta)
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://picsum.photos/seed/legal/800/600" 
                alt="Legal Library" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl z-20 max-w-[200px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Extraction Accuracy</span>
              </div>
              <div className="text-3xl font-bold serif">98.4%</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 text-center border-y border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl serif italic text-primary mb-4">
            "The virtue of justice consists in moderation."
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto"></div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Upload", desc: "Upload sample legal documents to see how the AI interprets them." },
            { step: "2", title: "Analyze", desc: "The system extracts clauses, risks, and simplified explanations for learning purposes." },
            { step: "3", title: "Execute", desc: "Generate guidance, summaries, and courtroom preparation suggestions (educational use)." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold mb-8">
                {item.step}
              </div>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Search className="text-accent" />, title: "Case Search", desc: "Instant access to millions of court records and precedents.", color: "bg-white" },
              { icon: <FileText className="text-white" />, title: "Document Analyzer", desc: "Detect hidden clauses and legal risks in seconds.", color: "bg-primary text-white" },
              { icon: <Scale className="text-white" />, title: "Court Scripts", desc: "AI-generated opening and closing statements based on facts.", color: "bg-primary text-white" },
              { icon: <BookOpen className="text-accent" />, title: "Legal Learning", desc: "Understand procedures, etiquette, and required documents before court visits.", color: "bg-white" }
            ].map((feature, idx) => (
              <div key={idx} className={`${feature.color} p-8 rounded-xl border border-gray-100 shadow-sm`}>
                <div className="mb-6">{feature.icon}</div>
                <h4 className="font-bold mb-3">{feature.title}</h4>
                <p className={`text-xs leading-relaxed ${feature.color.includes('primary') ? 'text-gray-300' : 'text-gray-500'}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-4xl font-bold serif mb-6">
              AI Legal Understanding Engine<br />
              <span className="text-accent italic">(Student Research Project)</span>
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Our platform doesn't just store documents; it understands them. By leveraging specialized LLMs trained on legal corpora, LawBridge provides insights that previously took days of research.
            </p>
            <ul className="space-y-4 mb-12">
              {[
                "Built using NLP and Retrieval-Augmented Generation",
                "Trained on publicly available Indian legal texts",
                "Designed for legal awareness and education",
                "Helps users understand next legal steps"
              ].map((text, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 size={18} className="text-accent" />
                  {text}
                </li>
              ))}
            </ul>
            <button className="px-8 py-4 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              Explore Features <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Capstone Notice */}
      <section className="py-24 px-6 bg-bg-soft text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold serif mb-6">
            Developed as part of a B.Tech CSE (AI/ML) capstone project focused on accessible legal awareness using AI.
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            This prototype demonstrates how AI can assist with legal understanding for educational purposes. It is not a commercial product and does not replace professional legal advice.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-primary text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold serif mb-8">Explore how AI can simplify legal understanding</h2>
          <p className="text-gray-400 mb-12 text-lg">
            Learn about our student research project exploring AI for legal awareness, document analysis, and court preparation guidance.
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/roles" className="px-10 py-4 bg-accent text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
              Try Demo
            </Link>
            <button className="px-10 py-4 border border-white/20 font-bold rounded-lg hover:bg-white/5 transition-colors">
              View Project Details
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
