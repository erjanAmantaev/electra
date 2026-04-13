import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getProducts, type Product } from '../lib/storeApi';

export default function Home() {
  const [openSpec, setOpenSpec] = useState<number | null>(0);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadTrending = async () => {
      try {
        const products = await getProducts({ ordering: 'featured' });
        if (!mounted) return;
        setTrendingProducts(products.slice(0, 4));
      } catch {
        if (!mounted) return;
        setTrendingProducts([]);
      }
    };

    loadTrending();

    return () => {
      mounted = false;
    };
  }, []);

  const specs = [
    {
      title: "Ultra Retina XDR Display",
      desc: "The most advanced display ever. Featuring 1600 nits peak brightness, 1,000,000:1 contrast ratio, and ProMotion technology with adaptive refresh rates up to 120Hz for incredibly smooth scrolling and responsive feel."
    },
    {
       title: "Optical Fusion Lens Tech",
       desc: "Next-generation camera array capturing 45% more light. Ideal for professional cinematography with zero shutter lag."
    },
    {
       title: "Neural Core Architecture",
       desc: "Machine learning operations boosted by 60%. Execute billions of operations in background instantly without battery drain."
    }
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-b from-surface-hover to-background">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 text-center">
          <motion.p variants={fadeUp} className="text-primary font-bold tracking-widest text-sm mb-6 uppercase">
            Engineered for Excellence
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-heading font-black mb-6 tracking-tighter text-text-primary max-w-4xl mx-auto leading-tight">
            MacBook<br />Pro M3 Max.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            The world's most advanced chips for personal computers. Now with hardware-accelerated ray tracing.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
              onClick={() => toast.success('Pre-order secured! We will email you further instructions.')}
              className="bg-text-primary text-background px-8 py-4 rounded-full font-bold text-lg hover:bg-primary transition-colors hover:shadow-xl w-full sm:w-auto transform hover:scale-105 active:scale-95">
              Pre-order Now
            </button>
            <button 
              onClick={() => toast.info('Loading full brochure...')}
              className="bg-transparent text-text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-surface-hover transition-colors flex items-center gap-2 border border-border w-full sm:w-auto justify-center">
              Learn More <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
          
          <motion.div variants={fadeUp} className="mt-20 mx-auto max-w-5xl relative">
            <div className="aspect-[16/9] bg-border rounded-2xl overflow-hidden shadow-2xl relative group cursor-pointer border border-border">
              <div className="absolute inset-0 bg-gradient-to-tr from-surface-hover to-transparent z-10 opacity-60"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Section - Categories Bento Grid */}
      <section className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="flex justify-between items-end mb-10">
          <div>
            <motion.p variants={fadeUp} className="text-primary font-bold tracking-widest text-xs mb-2 uppercase">Collections</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-heading font-black tracking-tight">Browse Categories</motion.h2>
          </div>
          <motion.button variants={fadeUp} onClick={() => toast('Redirecting to catalog...')} className="hidden sm:flex text-text-secondary hover:text-primary transition-colors items-center gap-2 font-medium">
            View All Departments <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={fadeUp} onClick={() => toast('Browsing Mobile Phones')} className="bg-surface border border-border rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer row-span-2 group relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-bold text-text-tertiary mb-2 uppercase tracking-wide">Mobile</p>
              <h3 className="text-3xl font-heading font-bold mb-8">Phones</h3>
            </div>
            <div className="aspect-square bg-surface-hover rounded-xl mb-4 group-hover:scale-105 group-hover:rotate-1 transition-transform duration-500 bg-[url('https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center"></div>
          </motion.div>
          <motion.div variants={fadeUp} onClick={() => toast('Browsing Laptops')} className="bg-surface border border-border rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer group">
            <p className="text-xs font-bold text-text-tertiary mb-2 uppercase tracking-wide">Computing</p>
            <h3 className="text-3xl font-heading font-bold mb-4">Laptops</h3>
          </motion.div>
          <motion.div variants={fadeUp} onClick={() => toast('Browsing Audio')} className="bg-surface border border-border rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer group">
            <p className="text-xs font-bold text-text-tertiary mb-2 uppercase tracking-wide">Audio</p>
            <h3 className="text-3xl font-heading font-bold mb-4">Headphones</h3>
          </motion.div>
          
          <motion.div variants={fadeUp} className="md:col-span-2 bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
             <div className="mb-6 md:mb-0 max-w-sm">
                <p className="text-white/80 font-bold mb-2 uppercase tracking-widest text-xs">Editorial Team Pick</p>
                <p className="text-xl font-medium leading-relaxed italic">
                  "The Electra collection represents the absolute peak of modern industrial design."
                </p>
             </div>
             <div className="bg-white/10 backdrop-blur border border-white/20 p-6 rounded-xl flex flex-col items-center">
                 <h3 className="text-4xl font-heading font-black mb-4">Summer Sale Event.</h3>
                 <button onClick={() => toast.success('Applying Summer Discount Code!')} className="bg-white text-primary px-6 py-3 rounded-full font-bold w-full hover:bg-surface-hover transition-all transform hover:scale-105 active:scale-95">
                   Shop The Collection
                 </button>
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Section - Trending Product Grid */}
      <section className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-10">
          <p className="text-primary font-bold tracking-widest text-xs mb-2 uppercase">New Arrivals</p>
          <h2 className="text-4xl font-heading font-black tracking-tight">Trending Now</h2>
        </motion.div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(trendingProducts.length
            ? trendingProducts.map(product => ({
                slug: product.slug,
                brand: product.brand,
                name: product.name,
                price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(product.price)),
                img: product.image_url,
              }))
            : [
                { slug: 'fallback-1', brand: 'SAMSUNG', name: 'Galaxy S24 Ultra', price: '$1,299.00', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop' },
                { slug: 'fallback-2', brand: 'SONY', name: 'WH-1000XM5', price: '$399.00', img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop' },
                { slug: 'fallback-3', brand: 'APPLE', name: 'MacBook Air M2', price: '$1,099.00', img: 'https://images.unsplash.com/photo-1602080858428-57174f9431cf?q=80&w=600&auto=format&fit=crop' },
                { slug: 'fallback-4', brand: 'BOSE', name: 'QC Ultra', price: '$429.00', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop' },
              ]).map((prod, i) => (
            <motion.div variants={fadeUp} key={`${prod.slug}-${i}`} className="group">
              <Link to={prod.slug.startsWith('fallback') ? '/catalog' : `/product/${prod.slug}`}>
              <div className="aspect-[4/5] bg-surface-hover border border-border rounded-2xl mb-4 overflow-hidden relative" style={{ backgroundImage: `url(${prod.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <button onClick={(e) => { e.stopPropagation(); toast.success(`${prod.name} added to cart!`); }} className="absolute bottom-4 right-4 bg-background/90 backdrop-blur border border-border p-3 rounded-full hover:bg-primary hover:text-white transition-all transform opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-bold text-text-tertiary mb-1">{prod.brand}</p>
              <h3 className="font-heading font-bold text-lg">{prod.name}</h3>
              <p className="text-text-secondary mt-1">{prod.price}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Section - Spec Accordion */}
      <section className="bg-surface border-y border-border py-24 mt-12 w-full">
        <div className="max-w-4xl mx-auto px-8 md:px-16 lg:px-24">
           <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
              <p className="text-primary font-bold tracking-widest text-xs mb-2 uppercase">Technical Superiority</p>
              <h2 className="text-4xl font-heading font-black tracking-tight">The Precision Edge</h2>
           </motion.div>
           
           <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="flex flex-col gap-4">
              {specs.map((spec, i) => (
                <motion.div variants={fadeUp} key={i} className={`border border-border rounded-xl p-6 transition-colors shadow-sm overflow-hidden ${openSpec === i ? 'bg-background' : 'bg-surface hover:bg-surface-hover cursor-pointer'}`} onClick={() => setOpenSpec(openSpec === i ? null : i)}>
                   <div className="flex justify-between items-center mb-0">
                      <h4 className={`font-bold text-lg ${openSpec === i ? '' : 'text-text-secondary'}`}>{spec.title}</h4>
                      <motion.div animate={{ rotate: openSpec === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown className={`w-5 h-5 ${openSpec === i ? 'text-primary' : 'text-text-tertiary'}`} />
                      </motion.div>
                   </div>
                   <AnimatePresence>
                     {openSpec === i && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0, marginTop: 0 }}
                         animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                         exit={{ height: 0, opacity: 0, marginTop: 0 }}
                         transition={{ duration: 0.3 }}
                       >
                         <p className="text-text-secondary leading-relaxed border-t border-border pt-4">
                           {spec.desc}
                         </p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </motion.div>
              ))}
           </motion.div>
        </div>
      </section>
      
      {/* Section - Partners */}
      <section className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 mt-8 pb-12">
        <div className="rounded-2xl border border-border bg-surface py-8 px-6 md:px-10">
          <p className="text-center text-sm font-bold text-text-secondary tracking-widest uppercase mb-8">World-Class Partners</p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 md:gap-x-16 font-heading font-black text-2xl text-text-secondary">
             <span className="hover:text-primary transition-colors cursor-default">APPLE</span>
             <span className="hover:text-primary transition-colors cursor-default">SONY</span>
             <span className="hover:text-primary transition-colors cursor-default">SAMSUNG</span>
             <span className="hover:text-primary transition-colors cursor-default">BOSE</span>
             <span className="hover:text-primary transition-colors cursor-default">DELL</span>
             <span className="hover:text-primary transition-colors cursor-default">LG</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
