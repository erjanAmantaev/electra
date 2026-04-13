import { Globe, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-24">
      <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-heading font-black tracking-tighter mb-4">ELECTRA</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Precision electronics for the modern era. Curating the future of consumer technology since 2024.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-bold mb-4">SHOP</h4>
            <ul className="flex flex-col gap-3 text-sm text-text-secondary">
              <li><Link to="#" className="hover:text-primary transition-colors">Smartphones</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Laptops & PC</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Audio & Vision</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4">SUPPORT</h4>
            <ul className="flex flex-col gap-3 text-sm text-text-secondary">
              <li><Link to="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Terms & Privacy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4">NEWSLETTER</h4>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-background border border-border px-4 py-2 rounded-l-md w-full text-sm outline-none focus:border-primary"
              />
              <button className="bg-text-primary text-background px-4 py-2 rounded-r-md font-medium text-sm hover:bg-primary transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-border mt-16 pt-8 text-sm text-text-tertiary">
          <p>© 2024 Electra Precision Electronics.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors"><Phone className="w-5 h-5" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Mail className="w-5 h-5" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Globe className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
