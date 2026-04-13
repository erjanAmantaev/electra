import { motion } from 'framer-motion';
import { Quote, Search, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function AboutUs() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-8 md:px-16 lg:px-24 max-w-6xl mx-auto w-full">
         <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <motion.span variants={fadeUp} className="bg-surface-hover text-text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 inline-block">EST. 2024</motion.span>
                      <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-heading font-black tracking-tighter leading-[0.9] mb-8">
                           Smart Tech<br/><span className="text-primary">Made</span><br/>Simple.
                      </motion.h1>
                      <motion.p variants={fadeUp} className="text-xl text-text-secondary leading-relaxed max-w-md">
                         Electra helps you choose reliable electronics without the confusion. We pick products that are easy to use, high quality, and built to last.
                      </motion.p>
            </div>
            <motion.div variants={fadeUp} className="relative aspect-[4/5] w-full max-w-md mx-auto lg:ml-auto">
               <div className="absolute inset-0 bg-gradient-to-tr from-surface-hover to-transparent z-10 opacity-40 mix-blend-overlay"></div>
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605170439002-90845e8c0137?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center rounded-3xl shadow-2xl"></div>
               
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="absolute -bottom-8 -left-8 bg-background border border-border p-6 rounded-2xl shadow-xl flex flex-col gap-1 z-20">
                  <span className="font-heading font-black text-3xl">0.01<span className="text-sm font-sans text-text-tertiary">mm</span></span>
                  <span className="text-[10px] font-bold tracking-widest text-text-tertiary uppercase">QUALITY CHECK LEVEL</span>
               </motion.div>
            </motion.div>
         </motion.div>
      </section>

      {/* Section - Values: Bento Grid Layout */}
      <section className="px-8 md:px-16 lg:px-24 max-w-7xl mx-auto w-full bg-surface py-24 rounded-3xl border border-border">
         <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-16 max-w-2xl">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-4">What We Stand For</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-text-secondary">
               We choose products that are useful, durable, and easy to enjoy every day.
            </motion.p>
         </motion.div>

         <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={fadeUp} className="md:col-span-2 bg-background border border-border rounded-3xl p-10 flex flex-col justify-between hover:shadow-lg transition-shadow group overflow-hidden relative">
               <div className="relative z-10 max-w-sm">
                  <Search className="w-8 h-8 text-primary mb-6" />
                  <h3 className="text-3xl font-heading font-bold mb-4">Careful Product Checks</h3>
                  <p className="text-text-secondary leading-relaxed mb-8">
                     Before a product goes live, we test build quality, performance, and how comfortable it feels in daily use.
                  </p>
                  <button onClick={() => toast('Opening how we test.')} className="font-bold text-sm tracking-widest uppercase hover:text-primary transition-colors border-b border-text-primary hover:border-primary pb-1">
                     How We Test
                  </button>
               </div>
               <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1581092335878-2d9fd86aecf3?q=80&w=800&auto=format&fit=crop')] bg-cover bg-left opacity-20 group-hover:opacity-40 transition-opacity mix-blend-luminosity"></div>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-background border border-border rounded-3xl p-10 flex flex-col justify-between hover:shadow-lg transition-shadow">
               <Zap className="w-8 h-8 text-primary mb-6" />
               <h3 className="text-2xl font-heading font-bold mb-4">The Feel Matters</h3>
               <p className="text-text-secondary leading-relaxed">
                  We care about the small details: button click, screen response, and how natural the product feels in your hand.
               </p>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-background border border-border rounded-3xl p-10 flex flex-col justify-between hover:shadow-lg transition-shadow md:col-start-3">
               <Shield className="w-8 h-8 text-primary mb-6" />
               <h3 className="text-2xl font-heading font-bold mb-4">Built to Last</h3>
               <p className="text-text-secondary leading-relaxed">
                  We focus on products that stay useful for years, not just for one short trend cycle.
               </p>
            </motion.div>
         </motion.div>
      </section>

      {/* Narrative: The Studio Section */}
      <section className="px-8 md:px-16 lg:px-24 max-w-6xl mx-auto w-full">
         <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp} className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative order-2 lg:order-1">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-1000"></div>
            </motion.div>
            <motion.div variants={fadeUp} className="order-1 lg:order-2">
               <p className="text-xs font-bold tracking-widest text-text-tertiary uppercase mb-4">OUR TEAM</p>
               <h2 className="text-5xl font-heading font-black tracking-tight mb-8">Built by people<br/>who care.</h2>
               <div className="flex flex-col gap-6 text-lg text-text-secondary leading-relaxed mb-8">
                 <p>
                    Our team works together in one place where designers and engineers solve real user problems side by side.
                 </p>
                 <p>
                    We remove extra complexity and keep what matters: strong materials, clean design, and smooth everyday use.
                 </p>
               </div>
               <button onClick={() => toast.success('Workshop tour request sent.')} className="bg-text-primary text-background px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-primary transition-colors">
                  See How We Work
               </button>
            </motion.div>
         </motion.div>
      </section>

      {/* Asymmetric Quote Section */}
      <section className="px-8 md:px-16 lg:px-24 max-w-5xl mx-auto w-full py-24 mb-12">
         <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="col-span-1 md:col-span-5">
               <motion.h3 initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-heading font-bold leading-tight">
                  "Good technology should make life easier."
               </motion.h3>
            </div>
            
            <div className="col-span-1 hidden md:flex justify-center">
               <div className="w-[1px] h-full bg-border min-h-[160px]"></div>
            </div>

            <div className="col-span-1 md:col-span-6 relative">
               <Quote className="absolute -top-6 -left-6 w-12 h-12 text-surface-hover/50 -z-10" />
               <motion.p initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-lg text-text-secondary leading-relaxed mb-6 italic">
                  "When we started Electra, we saw that many products were powerful but hard to understand. We chose a simpler path. We help people find well-made devices that are easy to use and dependable every day."
               </motion.p>
               <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                  <p className="font-bold">Arthur Vance</p>
                  <p className="text-xs text-text-tertiary tracking-widest uppercase font-bold">FOUNDER</p>
               </motion.div>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-12 lg:px-24 w-full">
         <div className="bg-text-primary text-background rounded-[3rem] p-12 md:p-24 overflow-hidden relative shadow-2xl flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1500&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-text-primary to-transparent z-0 opacity-80"></div>
            
            <div className="relative z-10 max-w-2xl flex flex-col items-center">
               <h2 className="text-5xl md:text-7xl font-heading font-black mb-6 tracking-tighter text-white">Stay in the Loop.</h2>
               <p className="text-xl text-white/70 leading-relaxed mb-10 max-w-lg">
                  Get simple updates about new arrivals, restocks, and special offers.
               </p>
               <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                  <input type="email" placeholder="your@email.com" className="flex-1 bg-white/10 border border-white/20 backdrop-blur rounded-2xl px-6 py-4 outline-none focus:border-white text-white placeholder-white/40 transition-colors" />
                  <button onClick={() => toast.success('Thanks for subscribing.')} className="bg-white text-text-primary px-8 py-4 rounded-2xl font-bold tracking-widest uppercase hover:bg-surface-hover transition-colors">
                     Subscribe
                  </button>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
