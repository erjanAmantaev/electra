import { motion } from 'framer-motion';
import { CheckCircle, Truck, Package, ChevronRight, Wallet } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

function formatCurrency(value: number) {
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value >= 1000 ? 0 : 2,
   }).format(value);
}

export default function OrderSuccess() {
   const [searchParams] = useSearchParams();

   const orderNumber = searchParams.get('order') ?? 'EL-000000-0000-0000';
   const hasOrderParam = searchParams.has('order');
   const chargedAmount = Number(searchParams.get('amount') ?? 571.32);
   const cardBrand = searchParams.get('brand') ?? 'Card';
   const cardLast4 = searchParams.get('last4') ?? '0000';
   const walletBalance = Number(searchParams.get('wallet') ?? 0);
   const usedWallet = searchParams.get('usedWallet') === '1';
   const deliveryMethod = searchParams.get('delivery') === 'express' ? 'Express Delivery' : 'Standard Shipping';
   const trackOrderPath = hasOrderParam ? `/orders/${encodeURIComponent(orderNumber)}` : '/profile';

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-12 lg:px-24 py-16 flex flex-col items-center">
      {/* Hero Success Section */}
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }} className="mb-8">
         <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center relative">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="w-16 h-16 bg-success rounded-full flex items-center justify-center">
               <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
         </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-4">Thank you for your order!</h1>
        <p className="text-lg text-text-secondary max-w-lg mx-auto">
               Payment simulation completed successfully. We are preparing your order for dispatch.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link to={trackOrderPath} className="bg-text-primary text-background px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-primary transition-colors flex items-center justify-center gap-2">
          <Truck className="w-4 h-4" /> Track Order
        </Link>
        <Link to="/catalog" className="bg-surface border border-border px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-surface-hover transition-colors flex items-center justify-center gap-2">
          Continue Shopping <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Order Details Bento Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Summary Card */}
         <div className="bg-surface border border-border shadow-sm rounded-3xl p-8">
            <h2 className="text-xl font-heading font-black border-b border-border pb-4 mb-6 flex items-center gap-2">
               <Package className="w-5 h-5 text-primary" /> Order Summary
            </h2>
            
                  <div className="flex flex-col gap-4 mb-6">
                     <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                        <div>
                            <h3 className="font-bold">Charged Amount</h3>
                            <p className="text-xs text-text-secondary">Total captured by checkout simulation</p>
                        </div>
                        <p className="font-black text-lg">{formatCurrency(chargedAmount)}</p>
              </div>
                     <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                        <div>
                            <h3 className="font-bold">Payment Source</h3>
                            <p className="text-xs text-text-secondary">
                               {usedWallet ? 'Wallet was used first, card fallback available' : 'Directly charged to linked card'}
                            </p>
                </div>
                        <p className="font-bold text-sm">{cardBrand} ending in {cardLast4}</p>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex flex-col gap-3 text-sm">
               <div className="flex justify-between">
                         <span className="text-text-secondary">Wallet Remaining</span>
                         <span className="font-medium">{formatCurrency(walletBalance)}</span>
               </div>
               <div className="flex justify-between">
                         <span className="text-text-secondary">Delivery</span>
                         <span className="font-medium text-success">{deliveryMethod}</span>
               </div>
               <div className="flex justify-between">
                         <span className="text-text-secondary">Wallet Applied</span>
                         <span className="font-medium">{usedWallet ? 'Yes' : 'No'}</span>
               </div>
               <div className="flex justify-between items-center border-t border-border pt-3 mt-1">
                         <span className="font-bold">Final Charge</span>
                         <span className="font-black text-xl text-primary">{formatCurrency(chargedAmount)}</span>
               </div>
            </div>
         </div>

         {/* Info Column */}
         <div className="flex flex-col gap-6">
            <div className="bg-background border border-border rounded-3xl p-8 shadow-sm">
               <h3 className="text-sm font-bold tracking-widest text-text-tertiary uppercase mb-6">Order Information</h3>
               <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium">ORDER NUMBER</span>
                  <span className="text-sm font-bold font-mono bg-surface px-3 py-1 rounded border border-border">#{orderNumber}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ESTIMATED DELIVERY</span>
                  <span className="text-sm font-bold text-primary">2-5 business days</span>
               </div>
            </div>

            <div className="bg-background border border-border rounded-3xl p-8 shadow-sm">
               <h3 className="text-sm font-bold tracking-widest text-text-tertiary uppercase mb-4">Shipping To</h3>
               <div className="text-sm leading-relaxed text-text-secondary border-l-2 border-primary pl-4">
                  <p className="font-bold text-text-primary">Alex Thompson</p>
                  <p>1288 Luminous Drive</p>
                  <p>Cloud Valley, CA 94043</p>
                  <p>United States</p>
               </div>
               <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm font-medium">
                  <Truck className="w-4 h-4 text-primary" /> {deliveryMethod}
               </div>
            </div>

            <div className="bg-background border border-border rounded-3xl p-8 shadow-sm flex items-center gap-4">
               <div className="w-12 h-8 bg-[#1a1f36] rounded text-white font-bold italic flex items-center justify-center text-xs">{cardBrand.slice(0, 4).toUpperCase()}</div>
               <div>
                  <h3 className="text-sm font-bold tracking-widest text-text-tertiary uppercase mb-1">Payment Method</h3>
                  <p className="text-sm font-medium">{cardBrand} ending in {cardLast4}</p>
                  <p className="text-xs text-text-secondary flex items-center gap-1">
                    <Wallet className="w-3 h-3" /> Wallet balance after payment: {formatCurrency(walletBalance)}
                  </p>
               </div>
            </div>
         </div>
      </motion.div>
    </div>
  );
}
