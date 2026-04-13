import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const TAX_RATE = 0.08;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const { items, itemCount, subtotal, loading, updateItemQuantity, removeItem, clearAll } = useCart();

  const estimatedTax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + estimatedTax).toFixed(2));

  const changeQuantity = async (itemId: number, quantity: number) => {
    try {
      await updateItemQuantity(itemId, quantity);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update quantity.'));
    }
  };

  const removeLine = async (itemId: number) => {
    try {
      await removeItem(itemId);
      toast.success('Item removed from cart.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to remove item.'));
    }
  };

  const clearCartAction = async () => {
    try {
      await clearAll();
      toast.success('Cart cleared.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to clear cart.'));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-8 md:px-16 lg:px-24 py-16 text-center">
        <div className="bg-surface border border-border rounded-2xl p-12">
          <h1 className="text-3xl font-heading font-black mb-3">Sign in to access your cart</h1>
          <p className="text-text-secondary mb-8">Your saved items and checkout flow are available after login.</p>
          <Link to="/login" className="inline-flex px-6 py-3 rounded-full bg-text-primary text-background text-sm font-bold hover:bg-primary transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 py-12">
        <div className="h-12 w-56 rounded-xl bg-surface border border-border animate-pulse mb-10"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-44 rounded-2xl border border-border bg-surface animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 rounded-2xl border border-border bg-surface animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-8 md:px-16 lg:px-24 py-16 text-center">
        <div className="bg-surface border border-border rounded-2xl p-12">
          <h1 className="text-3xl font-heading font-black mb-3">Your cart is empty</h1>
          <p className="text-text-secondary mb-8">Browse the catalog and add your favorite products to continue checkout.</p>
          <Link to="/catalog" className="inline-flex px-6 py-3 rounded-full bg-text-primary text-background text-sm font-bold hover:bg-primary transition-colors">
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-black tracking-tight mb-2">Your Cart</h1>
        <p className="text-text-secondary">{itemCount} items selected for checkout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            {items.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-6 bg-surface border border-border rounded-2xl">
                <div
                  className="w-full sm:w-32 aspect-square rounded-xl bg-cover bg-center border border-border"
                  style={{ backgroundImage: `url('${item.product.image_url}')` }}
                ></div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-heading font-bold text-lg">{item.product.name}</h3>
                      <p className="text-sm text-text-tertiary mt-1">
                        {item.product.brand} | {item.product.category_label}
                      </p>
                      {!item.product.in_stock && (
                        <p className="text-xs text-error mt-2">Out of stock</p>
                      )}
                    </div>
                    <p className="font-bold border px-3 py-1 bg-background text-sm rounded-full">
                      {formatCurrency(Number(item.line_total))}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-6 gap-4">
                    <div className="flex items-center gap-4 bg-background border border-border rounded-full p-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.quantity <= 1) {
                            void removeLine(item.id);
                            return;
                          }
                          void changeQuantity(item.id, item.quantity - 1);
                        }}
                        className="p-2 hover:bg-surface-hover rounded-full transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.quantity >= item.product.stock) {
                            toast.error(`Only ${item.product.stock} items available.`);
                            return;
                          }
                          void changeQuantity(item.id, item.quantity + 1);
                        }}
                        className="p-2 hover:bg-surface-hover rounded-full transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeLine(item.id)}
                      className="text-sm text-error font-medium hover:text-red-700 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface border border-border shadow-xl rounded-2xl p-8 sticky top-24">
            <div className="flex items-center justify-between mb-6 gap-3">
              <h2 className="text-2xl font-heading font-black">Summary</h2>
              <button
                type="button"
                onClick={() => void clearCartAction()}
                className="text-xs font-bold tracking-widest uppercase px-3 py-2 rounded-full border border-border hover:bg-background transition-colors"
              >
                Clear Cart
              </button>
            </div>

            <div className="flex flex-col gap-4 text-sm mb-6">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-bold text-base">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Estimated Shipping</span>
                <span className="font-bold text-success">Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Estimated Tax</span>
                <span className="font-bold text-base">{formatCurrency(estimatedTax)}</span>
              </div>
            </div>

            <div className="border-t border-border pt-6 mb-8 flex justify-between items-center">
              <span className="font-bold">Estimated Total</span>
              <span className="font-black text-2xl">{formatCurrency(total)}</span>
            </div>

            <Link to="/checkout" className="w-full bg-text-primary text-background py-4 rounded-full flex justify-center items-center gap-2 font-bold hover:bg-primary hover:shadow-xl transition-all">
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-warning text-center mt-4 leading-relaxed">
              Linked card is required at checkout before order confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
