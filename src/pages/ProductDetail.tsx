import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Truck, Star, PencilLine, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  deleteProductReview,
  getProductBySlug,
  getProductReviews,
  upsertProductReview,
  type Product,
  type ProductRatingBucket,
  type ProductReview,
} from '../lib/storeApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const EMPTY_RATING_DISTRIBUTION: ProductRatingBucket[] = [5, 4, 3, 2, 1].map(rating => ({ rating, count: 0 }));

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ratingDistribution, setRatingDistribution] = useState<ProductRatingBucket[]>(EMPTY_RATING_DISTRIBUTION);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const gallery = useMemo(() => {
    if (!product) return [];
    const combined = [product.image_url, ...(product.gallery ?? [])].filter(Boolean);
    return Array.from(new Set(combined));
  }, [product]);

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      if (!slug) {
        setError('Product not found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await getProductBySlug(slug);
        if (!mounted) return;
        setProduct(data);
      } catch (loadError) {
        if (!mounted) return;
        setError((loadError as Error).message || 'Unable to load product details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (gallery.length > 0) {
      setMainImage(gallery[0]);
    }
  }, [gallery]);

  useEffect(() => {
    let mounted = true;

    const loadReviews = async () => {
      if (!slug) return;

      setReviewsLoading(true);
      try {
        const response = await getProductReviews(slug, isAuthenticated ? token ?? undefined : undefined);
        if (!mounted) return;
        setReviews(response.results);
        setCanReview(Boolean(response.can_review));
        setRatingDistribution(response.rating_distribution.length ? response.rating_distribution : EMPTY_RATING_DISTRIBUTION);
        setProduct(current =>
          current
            ? {
                ...current,
                rating: response.rating,
                review_count: response.review_count,
              }
            : current
        );
      } catch {
        if (!mounted) return;
        setReviews([]);
        setCanReview(false);
        setRatingDistribution(EMPTY_RATING_DISTRIBUTION);
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    };

    void loadReviews();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, slug, token]);

  const price = Number(product?.price ?? 0);
  const compareAtPrice = Number(product?.compare_at_price ?? 0);

  const specs = useMemo(() => {
    if (!product?.specs) return [] as Array<[string, string]>;
    return Object.entries(product.specs);
  }, [product]);

  const resetReviewForm = () => {
    setEditingReviewId(null);
    setReviewRating(5);
    setReviewTitle('');
    setReviewComment('');
  };

  const handleStartEditingReview = (review: ProductReview) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewTitle(review.title);
    setReviewComment(review.comment);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.info('Sign in to add products to your cart.');
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await addItem(product.slug, 1);
      toast.success(`${product.name} added to cart.`);
    } catch (addError) {
      const message = addError instanceof Error ? addError.message : 'Unable to add product to cart.';
      toast.error(message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!slug || !product) return;

    if (!isAuthenticated) {
      toast.info('Sign in to leave a review.');
      navigate('/login');
      return;
    }

    if (!token) {
      toast.error('Your session expired. Please sign in again.');
      navigate('/login');
      return;
    }

    if (!canReview) {
      toast.error('You can review this product only after purchasing it.');
      return;
    }

    if (!reviewTitle.trim() && !reviewComment.trim()) {
      toast.error('Add a title or comment to submit your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await upsertProductReview(token, slug, {
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });

      setProduct(current =>
        current
          ? {
              ...current,
              rating: response.rating,
              review_count: response.review_count,
            }
          : current
      );
      setRatingDistribution(response.rating_distribution.length ? response.rating_distribution : EMPTY_RATING_DISTRIBUTION);

      setReviews(current => {
        const existingIndex = current.findIndex(item => item.id === response.review.id);
        if (existingIndex >= 0) {
          const next = [...current];
          next[existingIndex] = response.review;
          return next;
        }
        return [response.review, ...current];
      });

      resetReviewForm();
      toast.success(response.message);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to submit review.';
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!slug || !product) return;

    if (!isAuthenticated) {
      toast.info('Sign in to manage your review.');
      navigate('/login');
      return;
    }

    if (!token) {
      toast.error('Your session expired. Please sign in again.');
      navigate('/login');
      return;
    }

    if (!window.confirm('Delete your review for this product?')) {
      return;
    }

    setDeletingReview(true);
    try {
      const response = await deleteProductReview(token, slug);

      setProduct(current =>
        current
          ? {
              ...current,
              rating: response.rating,
              review_count: response.review_count,
            }
          : current
      );
      setRatingDistribution(response.rating_distribution.length ? response.rating_distribution : EMPTY_RATING_DISTRIBUTION);
      setReviews(current => current.filter(item => !item.is_mine));
      resetReviewForm();

      toast.success(response.message);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Unable to delete review.';
      toast.error(message);
    } finally {
      setDeletingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[92rem] mx-auto px-8 md:px-20 lg:px-28 py-12">
        <div className="h-[620px] rounded-3xl bg-surface border border-border animate-pulse"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[92rem] mx-auto px-8 md:px-20 lg:px-28 py-12">
        <div className="border border-error/30 bg-error/10 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-heading font-bold mb-2">Product unavailable</h2>
          <p className="text-error mb-6">{error || 'This product could not be loaded.'}</p>
          <Link to="/catalog" className="inline-flex px-5 py-3 rounded-full bg-text-primary text-background text-sm font-bold hover:bg-primary transition-colors">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  const formattedCompareAtPrice =
    compareAtPrice > 0
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(compareAtPrice)
      : null;
  const savings = compareAtPrice > price ? compareAtPrice - price : 0;
  const isEditingReview = editingReviewId !== null;
  const distributionTotal = ratingDistribution.reduce((sum, bucket) => sum + bucket.count, 0);
  const reviewSubmissionLocked = isAuthenticated && !canReview;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-[92rem] mx-auto px-8 md:px-20 lg:px-28 py-12">
      {/* Breadcrumb nav */}
      <nav className="flex gap-2 text-xs font-bold tracking-widest text-text-tertiary uppercase mb-8">
        <Link to="/catalog" className="hover:text-primary transition-colors">Catalog</Link>
        <span>/</span>
        <Link to={`/catalog?category=${product.category}`} className="hover:text-primary transition-colors">
          {product.category_label}
        </Link>
        <span>/</span>
        <span className="text-text-secondary">{product.name}</span>
      </nav>

      {/* Hero Section: Editorial Gallery & Key Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        {/* Gallery Block */}
        <div className="flex flex-col gap-4">
          <motion.div layoutId="main-image" className="aspect-square bg-surface border border-border shadow-md rounded-2xl relative overflow-hidden group flex items-center justify-center cursor-crosshair">
             {product.badge && (
               <span className="absolute top-6 left-6 bg-background px-3 py-1 font-bold text-xs uppercase tracking-widest border border-border rounded-full z-10 shadow-sm">
                 {product.badge}
               </span>
             )}
             <div className="w-full h-full bg-gradient-to-tr from-surface-hover to-transparent absolute inset-0 opacity-50 z-0"></div>
             <motion.img 
                key={mainImage}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                src={mainImage || product.image_url}
                className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-700"
                alt={product.name}
              />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
             {gallery.map((thumb, i) => (
               <div
                 key={thumb}
                 onClick={() => setMainImage(thumb)}
                 className={`aspect-square bg-surface border rounded-xl cursor-pointer hover:border-primary transition-all overflow-hidden relative ${
                   mainImage === thumb ? 'border-primary ring-2 ring-primary/20 opacity-100' : 'border-border opacity-60'
                 }`}
               >
                 <img src={thumb} className="w-full h-full object-cover" alt={`${product.name} ${i + 1}`} />
               </div>
             ))}
          </div>
        </div>

        {/* Configuration & Purchase Block */}
        <div className="flex flex-col">
          <h1 className="text-5xl font-heading font-black tracking-tighter mb-4 leading-tight">{product.name}</h1>
          <p className="text-lg text-text-secondary mb-8">
            {product.short_description}
          </p>

          <div className="inline-flex items-center gap-2 mb-6 text-xs uppercase tracking-widest text-text-tertiary">
            <span className="px-2 py-1 rounded-full border border-border bg-surface">{product.brand}</span>
            <span className="px-2 py-1 rounded-full border border-border bg-surface">{product.category_label}</span>
            {!product.in_stock && <span className="px-2 py-1 rounded-full border border-error/40 bg-error/10 text-error">Out of stock</span>}
          </div>

          <div className="flex items-center gap-4 mb-10">
            <span className="text-3xl font-black text-error">{formattedPrice}</span>
            {formattedCompareAtPrice && <span className="text-xl font-medium text-text-tertiary line-through">{formattedCompareAtPrice}</span>}
            {savings > 0 && (
              <span className="bg-text-primary text-background px-3 py-1 text-xs font-bold rounded-full">
                SAVE {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(savings)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {specs.slice(0, 4).map(([label, value]) => (
              <div key={label} className="border border-border rounded-xl p-4 bg-surface">
                <p className="text-xs font-bold tracking-widest uppercase text-text-tertiary mb-2">{label}</p>
                <p className="font-medium leading-relaxed">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock || addingToCart}
              className="flex-1 bg-text-primary text-background py-4 rounded-full font-bold text-lg hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 active:scale-95 transform disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addingToCart ? 'ADDING...' : 'ADD TO BAG'}
            </button>
            <button onClick={() => toast('Quick checkout initiated')} className="flex-1 bg-surface border border-border py-4 rounded-full font-bold text-lg hover:bg-surface-hover transition-colors active:scale-95 transform">
              QUICK CHECKOUT
            </button>
          </div>

          <div className="flex flex-col gap-4 border border-border bg-background rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 text-sm font-medium">
               <Truck className="w-5 h-5 text-primary" /> <span className="tracking-wide">EXPRESS DELIVERY</span>
            </div>
            <div className="border-t border-border -mx-6 my-2"></div>
            <div className="flex items-center gap-4 text-sm font-medium">
               <ShieldCheck className="w-5 h-5 text-primary" /> <span className="tracking-wide">OFFICIAL BRAND WARRANTY INCLUDED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section - Technical Blueprint */}
      <section className="py-24 border-t border-border border-dashed">
        <div className="text-center mb-16 max-w-2xl mx-auto">
           <p className="text-primary font-bold tracking-widest text-xs mb-2 uppercase">Powerhouse Architecture</p>
           <h2 className="text-4xl font-heading font-black tracking-tight mb-4">Technical Specifications</h2>
           <p className="text-text-secondary leading-relaxed text-lg">
             {product.description}
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map(([label, value], index) => (
            <div
              key={`${label}-${index}`}
              className={`rounded-2xl p-8 transition-shadow group flex flex-col justify-between min-h-56 ${
                index % 3 === 2
                  ? 'bg-text-primary text-background shadow-xl'
                  : 'bg-surface border border-border hover:shadow-lg'
              }`}
            >
              <div>
                <p className={`text-xs font-bold tracking-widest uppercase mb-3 ${index % 3 === 2 ? 'text-white/60' : 'text-text-tertiary'}`}>
                  {label}
                </p>
                <h3 className="font-heading font-bold text-2xl mb-4">{value}</h3>
              </div>
              <div className={`pt-4 border-t ${index % 3 === 2 ? 'border-white/20 text-white/80' : 'border-border text-text-secondary'} text-sm`}>
                Verified market specification.
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Section - Brand Story */}
      <section className="bg-background border border-border rounded-3xl p-12 lg:p-24 overflow-hidden relative shadow-2xl mb-24 flex items-center justify-center text-center">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-hover opacity-50"></div>
         <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-bold text-text-tertiary tracking-widest uppercase mb-6">The Craft</p>
            <h2 className="text-5xl md:text-7xl font-heading font-black mb-8 tracking-tighter">Built by {product.brand}.</h2>
            <p className="text-xl text-text-secondary leading-relaxed mb-10">
              {product.description}
            </p>
            <Link to={`/catalog?brand=${encodeURIComponent(product.brand)}`} className="border-2 border-text-primary text-text-primary px-8 py-3 rounded-full font-bold hover:bg-text-primary hover:text-background transition-colors inline-flex">
              MORE FROM {product.brand.toUpperCase()}
            </Link>
         </div>
      </section>

      {/* User Reviews */}
      <section className="pt-12 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
            <div>
               <p className="text-primary font-bold tracking-widest text-xs mb-2 uppercase">The Verdict</p>
               <h2 className="text-4xl font-heading font-black tracking-tight mb-4">User Experiences</h2>
               <div className="flex items-center gap-4">
                <span className="font-heading font-black text-3xl">{Number(product.rating).toFixed(1)}</span>
                <div className="flex text-warning items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.review_count.toLocaleString()} reviews</span>
                </div>
               </div>
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-text-tertiary">
              {!isAuthenticated
                ? 'Sign in to leave a review'
                : canReview
                  ? 'Share your experience below'
                  : 'Purchase required to leave a review'}
            </span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div className="bg-surface border border-border rounded-2xl p-6">
             <p className="text-xs font-bold tracking-widest uppercase text-text-tertiary mb-3">Overall rating</p>
             <p className="font-heading font-black text-5xl leading-none mb-3">{Number(product.rating).toFixed(1)}</p>
             <p className="text-sm text-text-secondary">Based on {product.review_count.toLocaleString()} verified reviews.</p>
           </div>

           <div className="bg-surface border border-border rounded-2xl p-6">
             <p className="text-xs font-bold tracking-widest uppercase text-text-tertiary mb-4">Rating breakdown</p>
             <div className="flex flex-col gap-3">
               {ratingDistribution.map(bucket => {
                 const percent = distributionTotal > 0 ? (bucket.count / distributionTotal) * 100 : 0;
                 return (
                   <div key={bucket.rating} className="flex items-center gap-3 text-xs font-bold">
                     <span className="w-8 text-text-secondary">{bucket.rating}★</span>
                     <div className="flex-1 h-2 rounded-full bg-background border border-border overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${percent}%` }}></div>
                     </div>
                     <span className="w-8 text-right text-text-secondary">{bucket.count}</span>
                   </div>
                 );
               })}
             </div>
           </div>
         </div>

         <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
           {reviewSubmissionLocked && (
             <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 text-warning text-sm px-4 py-3">
               You can submit a review after purchasing this product.
             </div>
           )}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
             <div className="md:col-span-1">
               <p className="text-xs font-bold tracking-widest uppercase text-text-tertiary mb-3">Your Rating</p>
               <div className="flex flex-wrap gap-2">
                 {[1, 2, 3, 4, 5].map(value => (
                   <button
                     key={value}
                     type="button"
                     onClick={() => setReviewRating(value)}
                     disabled={reviewSubmissionLocked || submittingReview || deletingReview}
                     className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                       reviewRating === value
                         ? 'border-primary bg-primary/10 text-primary'
                         : 'border-border text-text-secondary hover:text-text-primary'
                     } disabled:opacity-50 disabled:cursor-not-allowed`}
                   >
                     {value}★
                   </button>
                 ))}
               </div>
             </div>

             <div className="md:col-span-3 flex flex-col gap-3">
               {isEditingReview && (
                 <div className="rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase px-4 py-3">
                   Editing your existing review
                 </div>
               )}
               <input
                 value={reviewTitle}
                 onChange={event => setReviewTitle(event.target.value)}
                 placeholder="Review title"
                 disabled={reviewSubmissionLocked}
                 className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
               />
               <textarea
                 value={reviewComment}
                 onChange={event => setReviewComment(event.target.value)}
                 placeholder="Share your experience with this product"
                 rows={4}
                 disabled={reviewSubmissionLocked}
                 className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none"
               ></textarea>
               <div className="flex justify-end gap-3">
                 {isEditingReview && (
                   <button
                     type="button"
                     onClick={resetReviewForm}
                     className="px-6 py-3 rounded-full border border-border text-sm font-bold hover:bg-background transition-colors"
                   >
                     Cancel
                   </button>
                 )}
                 <button
                   type="button"
                   onClick={() => void handleSubmitReview()}
                   disabled={submittingReview || deletingReview || reviewSubmissionLocked}
                   className="px-6 py-3 rounded-full bg-text-primary text-background text-sm font-bold hover:bg-primary transition-colors disabled:opacity-60"
                 >
                   {submittingReview ? (isEditingReview ? 'Updating...' : 'Submitting...') : isEditingReview ? 'Update Review' : 'Submit Review'}
                 </button>
               </div>
             </div>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviewsLoading ? (
              <div className="md:col-span-2 text-sm text-text-secondary">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="md:col-span-2 bg-surface border border-border rounded-2xl p-8 text-text-secondary">
                No reviews yet. Be the first to rate this product.
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-surface border border-border rounded-2xl p-8 hover:bg-surface-hover transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h4 className="font-bold">{review.user_name}</h4>
                      <p className="text-xs text-text-tertiary uppercase tracking-widest font-bold">
                        {formatReviewDate(review.created_at)}
                        {review.updated_at !== review.created_at ? ` • Edited ${formatReviewDate(review.updated_at)}` : ''}
                        {review.is_mine ? ' • Your review' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-warning font-bold text-sm">{review.rating}.0 ★</span>
                      {review.is_mine && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEditingReview(review)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border hover:bg-background transition-colors"
                            aria-label="Edit your review"
                          >
                            <PencilLine className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteReview()}
                            disabled={deletingReview}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                            aria-label="Delete your review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {review.title && <h5 className="font-heading font-bold text-lg mb-3">{review.title}</h5>}
                  <p className="text-text-secondary leading-relaxed border-l-2 border-primary pl-4">
                    {review.comment || 'Rated without written feedback.'}
                  </p>
                </div>
              ))
            )}
         </div>
      </section>
    </motion.div>
  );
}
