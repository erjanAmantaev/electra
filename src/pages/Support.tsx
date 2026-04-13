import { motion } from 'framer-motion';
import { Search, Mail, MessageSquare, Truck, PenTool, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Support() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Search Section */}
      <section className="bg-surface border-b border-border py-24 px-8 md:px-16 lg:px-24">
         <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <motion.div variants={fadeUp} className="w-16 h-16 bg-background rounded-2xl border border-border flex items-center justify-center mb-8 shadow-sm">
               <Search className="w-8 h-8 text-primary" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-heading font-black tracking-tighter mb-6">How can we help you?</motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-text-secondary leading-relaxed mb-12 max-w-2xl">
               Search our knowledge base for instant answers or explore categories to resolve your queries with luminous ease.
            </motion.p>
            <motion.div variants={fadeUp} className="w-full max-w-3xl relative">
               <input type="text" placeholder="Search for FAQs, orders, or technical terms..." className="w-full bg-background border border-border p-6 pr-32 rounded-full text-lg outline-none focus:border-primary focus:ring-4 ring-primary/10 transition-all shadow-sm" />
               <button onClick={() => toast('Searching knowledge base...')} className="absolute right-3 top-3 bottom-3 bg-text-primary text-background px-8 rounded-full font-bold tracking-widest uppercase hover:bg-primary transition-colors">
                  Search
               </button>
            </motion.div>
         </motion.div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 lg:px-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
         
         {/* Categories Grid (Asymmetric) */}
         <section className="col-span-1 lg:col-span-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Shipping */}
               <motion.div variants={fadeUp} className="bg-surface border border-border p-8 rounded-3xl hover:shadow-lg transition-shadow cursor-pointer">
                  <Truck className="w-8 h-8 text-primary mb-6" />
                  <h3 className="text-2xl font-heading font-bold mb-3">Shipping</h3>
                  <p className="text-text-secondary mb-8 leading-relaxed">
                     Track your deliveries, learn about international transit, and understand our sustainable packaging standards.
                  </p>
                  <ul className="flex flex-col gap-3 font-bold text-sm">
                     <li className="hover:text-primary transition-colors flex items-center gap-2">Track my package</li>
                     <li className="hover:text-primary transition-colors flex items-center gap-2">Delivery timelines & zones</li>
                  </ul>
               </motion.div>

               {/* Returns */}
               <motion.div variants={fadeUp} className="bg-surface border border-border p-8 rounded-3xl hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between">
                  <div>
                     <PenTool className="w-8 h-8 text-primary mb-6" />
                     <h3 className="text-2xl font-heading font-bold mb-3">Returns</h3>
                     <p className="text-text-secondary mb-8 leading-relaxed">
                        Start a return process or check the status of your refund. 30-day hassle-free guarantee.
                     </p>
                  </div>
                  <button onClick={() => toast('Initiating return procedure...')} className="bg-background border border-border text-text-primary px-6 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:text-primary hover:border-primary transition-colors self-start">
                     Initiate Return
                  </button>
               </motion.div>

               {/* Warranty */}
               <motion.div variants={fadeUp} className="bg-surface border border-border p-8 rounded-3xl hover:shadow-lg transition-shadow cursor-pointer md:col-span-2 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                  <div className="max-w-md">
                     <ShieldCheck className="w-8 h-8 text-primary mb-4" />
                     <h3 className="text-2xl font-heading font-bold mb-2">Warranty</h3>
                     <p className="text-text-secondary leading-relaxed mb-6">
                        Register your Electra device or file a claim. Every product includes a 2-year premium warranty.
                     </p>
                     <div className="flex gap-4 font-bold text-sm">
                        <span className="hover:text-primary transition-colors border-b border-text-primary hover:border-primary">What's covered?</span>
                        <span className="hover:text-primary transition-colors border-b border-text-primary hover:border-primary">Register a device</span>
                     </div>
                  </div>
                  <div className="w-32 h-32 bg-[url('https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=200&auto=format&fit=crop')] bg-cover bg-center rounded-2xl shrink-0 opacity-80 mix-blend-luminosity"></div>
               </motion.div>

               {/* Account */}
               <motion.div variants={fadeUp} className="bg-text-primary text-background border border-border p-8 rounded-3xl hover:shadow-lg transition-shadow cursor-pointer md:col-span-2 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                  <div className="max-w-md">
                     <User className="w-8 h-8 text-border-hover mb-4" />
                     <h3 className="text-2xl font-heading font-bold mb-2">Account Settings</h3>
                     <p className="text-border-hover/80 leading-relaxed mb-6">
                        Manage your subscriptions, update security settings, and view your entire luminous order history.
                     </p>
                     <button onClick={() => toast.info('Redirecting to Profile')} className="bg-background text-text-primary px-6 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-primary hover:text-white transition-colors">
                        Manage Settings
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         </section>

         {/* Sidebar: Popular Topics & Contact */}
         <aside className="col-span-1 lg:col-span-4 flex flex-col gap-10">
            {/* Soft List */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
               <h2 className="text-2xl font-heading font-bold mb-6">Commonly Searched</h2>
               <div className="flex flex-col gap-4">
                  {[
                     "Setting up your Electra Hub for the first time",
                     "Compatible devices and ecosystem integration",
                     "Changing your payment method and billing cycle",
                     "Troubleshooting connectivity and signal drops"
                  ].map((topic, i) => (
                     <div key={i} onClick={() => toast(`Loading article: ${topic}`)} className="p-4 bg-surface border border-border rounded-2xl hover:bg-surface-hover cursor-pointer transition-colors text-sm font-medium leading-relaxed">
                        {topic}
                     </div>
                  ))}
               </div>
            </motion.div>

            {/* Contact Section (Glassmorphism & Floating) */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
               
               <div className="relative z-10">
                  <h2 className="text-2xl font-heading font-bold mb-2">Still need help?</h2>
                  <p className="text-text-secondary mb-8 leading-relaxed text-sm">
                     Our support team is available 24/7 to ensure your experience remains nothing short of luminous.
                  </p>
                  
                  <div className="flex flex-col gap-4 mb-8">
                     <button onClick={() => toast.success('Connecting to Live Chat agent...')} className="w-full bg-text-primary text-background py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition-colors">
                        <MessageSquare className="w-4 h-4" /> Live Chat
                     </button>
                     <button onClick={() => toast.info('Opening email client...')} className="w-full bg-background border border-border text-text-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-hover transition-colors">
                        <Mail className="w-4 h-4" /> Email Us
                     </button>
                  </div>

                  <div className="bg-background/80 backdrop-blur-sm border border-border rounded-2xl p-4 flex items-center justify-between">
                     <div>
                        <p className="text-xs font-bold tracking-widest text-text-tertiary uppercase mb-1">Wait Times</p>
                        <p className="text-xs text-text-secondary">Current estimated wait time for live chat:</p>
                     </div>
                     <div className="flex flex-col items-end shrink-0">
                        <span className="font-heading font-bold text-xl">2 Mins</span>
                        <span className="flex items-center gap-1 text-[10px] text-success font-bold tracking-widest uppercase">
                           <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div> Live Now
                        </span>
                     </div>
                  </div>
               </div>
            </motion.div>
         </aside>

      </div>
    </div>
  );
}
