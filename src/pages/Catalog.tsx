import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import {
   getProductFilters,
   getProducts,
   type Product,
   type ProductFilters,
   type ProductOrdering,
} from '../lib/storeApi';

const SORT_OPTIONS: Array<{ label: string; value: ProductOrdering }> = [
   { label: 'Featured', value: 'featured' },
   { label: 'Newest', value: 'newest' },
   { label: 'Top Rated', value: 'rating' },
   { label: 'Price Low', value: 'price_asc' },
   { label: 'Price High', value: 'price_desc' },
];

function formatPrice(value: string | number) {
   const amount = Number(value);
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: amount >= 1000 ? 0 : 2,
   }).format(amount);
}

function formatReviewCount(count: number) {
   if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
   }
   return String(count);
}

function parseMultiParam(params: URLSearchParams, key: string) {
   return params
      .getAll(key)
      .flatMap(value => value.split(','))
      .map(value => value.trim())
      .filter(Boolean);
}

function parsePageParam(params: URLSearchParams) {
   const value = Number(params.get('page'));
   if (!Number.isFinite(value) || value < 1) return 1;
   return Math.floor(value);
}

const MIN_PRICE_FLOOR = 0;
const PRODUCTS_PER_PAGE = 9;

export default function Catalog() {
   const [searchParams, setSearchParams] = useSearchParams();

   const [filtersMeta, setFiltersMeta] = useState<ProductFilters | null>(null);
   const [products, setProducts] = useState<Product[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '');
   const [selectedCategories, setSelectedCategories] = useState<string[]>(parseMultiParam(searchParams, 'category'));
   const [selectedBrands, setSelectedBrands] = useState<string[]>(parseMultiParam(searchParams, 'brand'));
   const [minRating, setMinRating] = useState(0);
   const [minPrice, setMinPrice] = useState<number | ''>('');
   const [maxPrice, setMaxPrice] = useState<number | ''>('');
   const [ordering, setOrdering] = useState<ProductOrdering>('featured');
   const [currentPage, setCurrentPage] = useState(parsePageParam(searchParams));

   const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
   const paginatedProducts = useMemo(() => {
      const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const end = start + PRODUCTS_PER_PAGE;
      return products.slice(start, end);
   }, [products, currentPage]);

   const pageStart = products.length === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
   const pageEnd = Math.min(currentPage * PRODUCTS_PER_PAGE, products.length);

   useEffect(() => {
      if (currentPage > totalPages) {
         const nextParams = new URLSearchParams(searchParams);
         if (totalPages <= 1) {
            nextParams.delete('page');
         } else {
            nextParams.set('page', String(totalPages));
         }

         if (nextParams.toString() !== searchParams.toString()) {
            setSearchParams(nextParams, { replace: true });
         }
      }
   }, [currentPage, totalPages, searchParams, setSearchParams]);

   useEffect(() => {
      const urlSearch = searchParams.get('search') ?? '';
      setSearchTerm(urlSearch);
      setSelectedCategories(parseMultiParam(searchParams, 'category'));
      setSelectedBrands(parseMultiParam(searchParams, 'brand'));
      setCurrentPage(parsePageParam(searchParams));
   }, [searchParams]);

   useEffect(() => {
      let mounted = true;

      const loadFilters = async () => {
         try {
            const data = await getProductFilters();
            if (!mounted) return;
            setFiltersMeta(data);
         } catch (loadError) {
            if (!mounted) return;
            setError((loadError as Error).message || 'Unable to load filter options.');
         }
      };

      loadFilters();
      return () => {
         mounted = false;
      };
   }, []);

   useEffect(() => {
      let mounted = true;

      const loadProducts = async () => {
         setLoading(true);
         setError('');

         try {
            const data = await getProducts({
               search: searchTerm.trim() || undefined,
               category: selectedCategories.length ? selectedCategories : undefined,
               brand: selectedBrands.length ? selectedBrands : undefined,
               minRating: minRating || undefined,
               minPrice: typeof minPrice === 'number' ? minPrice : undefined,
               maxPrice: typeof maxPrice === 'number' ? maxPrice : undefined,
               ordering,
            });

            if (!mounted) return;
            setProducts(data);
         } catch (loadError) {
            if (!mounted) return;
            setError((loadError as Error).message || 'Unable to load products right now.');
         } finally {
            if (mounted) setLoading(false);
         }
      };

      loadProducts();

      return () => {
         mounted = false;
      };
   }, [searchTerm, selectedCategories, selectedBrands, minRating, minPrice, maxPrice, ordering]);

   const priceRange = useMemo(() => {
      const min = Number(filtersMeta?.price_range.min ?? 0);
      const max = Number(filtersMeta?.price_range.max ?? 0);
      return { min, max };
   }, [filtersMeta]);

   const updateMultiParam = (key: 'category' | 'brand', values: string[]) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete(key);
      values.forEach(value => nextParams.append(key, value));
      nextParams.delete('page');
      setSearchParams(nextParams, { replace: true });
   };

   const resetPagination = () => {
      setCurrentPage(1);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('page');
      setSearchParams(nextParams, { replace: true });
   };

   const goToPage = (page: number) => {
      const nextPage = Math.max(1, Math.min(totalPages, page));
      const nextParams = new URLSearchParams(searchParams);

      if (nextPage <= 1) {
         nextParams.delete('page');
      } else {
         nextParams.set('page', String(nextPage));
      }

      setSearchParams(nextParams, { replace: true });
   };

   const applySearch = (e: FormEvent) => {
      e.preventDefault();
      const nextParams = new URLSearchParams(searchParams);

      if (searchTerm.trim()) {
         nextParams.set('search', searchTerm.trim());
      } else {
         nextParams.delete('search');
      }

      nextParams.delete('page');

      setSearchParams(nextParams, { replace: true });
   };

   const selectCategory = (value: string) => {
      const nextCategories = selectedCategories.includes(value)
         ? selectedCategories.filter(item => item !== value)
         : [...selectedCategories, value];

      setSelectedCategories(nextCategories);
      updateMultiParam('category', nextCategories);
   };

   const selectBrand = (value: string) => {
      const nextBrands = selectedBrands.includes(value)
         ? selectedBrands.filter(item => item !== value)
         : [...selectedBrands, value];

      setSelectedBrands(nextBrands);
      updateMultiParam('brand', nextBrands);
   };

   const resetFilters = () => {
      setSelectedCategories([]);
      setSelectedBrands([]);
      setMinRating(0);
      setMinPrice('');
      setMaxPrice('');
      setOrdering('featured');
      setSearchTerm('');
      setSearchParams({}, { replace: true });
   };

   const handleMinPriceChange = (value: string) => {
      if (!value) {
         setMinPrice('');
         resetPagination();
         return;
      }
      setMinPrice(Math.max(MIN_PRICE_FLOOR, Number(value)));
      resetPagination();
   };

   const handleMaxPriceChange = (value: string) => {
      if (!value) {
         setMaxPrice('');
         resetPagination();
         return;
      }
      setMaxPrice(Math.max(MIN_PRICE_FLOOR, Number(value)));
      resetPagination();
   };

   return (
      <div className="max-w-[92rem] mx-auto px-8 md:px-20 lg:px-28 py-12 flex flex-col md:flex-row gap-12">
         <aside className="w-full md:w-72 flex-shrink-0">
            <h3 className="text-xl font-heading font-bold mb-8">Filters</h3>

            <div className="flex flex-col gap-8">
               <div className="border-b border-border pb-8">
                  <h4 className="text-xs font-bold tracking-widest text-text-tertiary uppercase mb-4">Category</h4>
                  <div className="flex flex-col gap-3 text-sm">
                     {filtersMeta?.categories.map(category => {
                        const active = selectedCategories.includes(category.value);
                        return (
                           <button
                              key={category.value}
                              type="button"
                              onClick={() => selectCategory(category.value)}
                              className="flex items-center justify-between gap-3 text-left group"
                           >
                              <div className="flex items-center gap-3">
                                 <div
                                    className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                                       active ? 'bg-primary border-primary' : 'border-border group-hover:border-primary'
                                    }`}
                                 >
                                    {active && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                 </div>
                                 <span className={active ? 'text-text-primary font-medium' : 'text-text-secondary group-hover:text-text-primary transition-colors'}>
                                    {category.label}
                                 </span>
                              </div>
                              <span className="text-xs text-text-tertiary">{category.count}</span>
                           </button>
                        );
                     })}
                  </div>
               </div>

               <div className="border-b border-border pb-8">
                  <h4 className="text-xs font-bold tracking-widest text-text-tertiary uppercase mb-4">Brand</h4>
                  <div className="flex flex-col gap-3 text-sm max-h-52 overflow-y-auto pr-2">
                     {filtersMeta?.brands.map(brand => {
                        const active = selectedBrands.includes(brand.value);
                        return (
                           <button
                              key={brand.value}
                              type="button"
                              onClick={() => selectBrand(brand.value)}
                              className="flex items-center justify-between gap-3 text-left group"
                           >
                              <div className="flex items-center gap-3">
                                 <div
                                    className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                                       active ? 'bg-primary border-primary' : 'border-border group-hover:border-primary'
                                    }`}
                                 >
                                    {active && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                 </div>
                                 <span className={active ? 'text-text-primary font-medium' : 'text-text-secondary group-hover:text-text-primary transition-colors'}>
                                    {brand.label}
                                 </span>
                              </div>
                              <span className="text-xs text-text-tertiary">{brand.count}</span>
                           </button>
                        );
                     })}
                  </div>
               </div>

               <div className="border-b border-border pb-8">
                  <h4 className="text-xs font-bold tracking-widest text-text-tertiary uppercase mb-4">Price Range</h4>
                  <div className="grid grid-cols-2 gap-3">
                     <input
                        type="number"
                        min={MIN_PRICE_FLOOR}
                        placeholder={String(MIN_PRICE_FLOOR)}
                        value={minPrice}
                        onChange={e => handleMinPriceChange(e.target.value)}
                        className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm outline-none focus:border-primary"
                     />
                     <input
                        type="number"
                        min={MIN_PRICE_FLOOR}
                        placeholder={String(priceRange.max || 0)}
                        value={maxPrice}
                        onChange={e => handleMaxPriceChange(e.target.value)}
                        className="w-full bg-background border border-border px-3 py-2 rounded-lg text-sm outline-none focus:border-primary"
                     />
                  </div>
                  <div className="flex justify-between text-xs text-text-tertiary mt-3">
                     <span>Min: {formatPrice(MIN_PRICE_FLOOR)}</span>
                     <span>Max: {formatPrice(priceRange.max || 0)}</span>
                  </div>
               </div>

               <div>
                  <h4 className="text-xs font-bold tracking-widest text-text-tertiary uppercase mb-4">Rating</h4>
                  <div className="flex flex-wrap gap-2">
                     {[0, 4, 4.5].map(value => (
                        <button
                           key={value}
                           type="button"
                           onClick={() => {
                              setMinRating(value);
                              resetPagination();
                           }}
                           className={`px-3 py-2 border rounded-lg text-xs font-medium transition-colors ${
                              minRating === value
                                 ? 'border-primary bg-primary/10 text-primary'
                                 : 'border-border text-text-secondary hover:text-text-primary hover:border-primary/40'
                           }`}
                        >
                           {value === 0 ? 'Any' : `${value}+ Stars`}
                        </button>
                     ))}
                  </div>
               </div>

               <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-2 border border-border rounded-full py-2 text-sm font-medium hover:bg-surface transition-colors"
               >
                  Reset Filters
               </button>
            </div>
         </aside>

         <main className="flex-1">
            <header className="flex flex-col gap-4 mb-10">
               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                  <div>
                     <h1 className="text-4xl font-heading font-black tracking-tight mb-2">All Products</h1>
                     <p className="text-text-secondary">
                        {loading ? 'Loading products...' : `Showing ${pageStart}-${pageEnd} of ${products.length} products.`}
                     </p>
                  </div>

                  <div className="text-xs uppercase tracking-[0.18em] text-text-tertiary font-semibold">
                     {selectedCategories.length + selectedBrands.length} active facets
                  </div>
               </div>

               <div className="rounded-2xl border border-border bg-gradient-to-r from-surface to-background p-3 md:p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex flex-col xl:flex-row xl:items-center gap-3 xl:justify-between">
                     <form onSubmit={applySearch} className="w-full xl:max-w-xl flex gap-2">
                        <input
                           value={searchTerm}
                           onChange={e => setSearchTerm(e.target.value)}
                           type="text"
                           placeholder="Search by product name..."
                           className="w-full bg-background border border-border px-4 py-3 rounded-xl outline-none focus:border-primary text-sm"
                        />
                        <button
                           type="submit"
                           className="px-5 py-3 rounded-xl border border-border bg-background hover:bg-surface transition-colors text-sm font-medium"
                        >
                           Search
                        </button>
                     </form>

                     <div className="flex items-center gap-2 bg-surface border border-border p-1 rounded-xl flex-wrap">
                        {SORT_OPTIONS.map(option => (
                           <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                 setOrdering(option.value);
                                 resetPagination();
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                 ordering === option.value
                                    ? 'bg-background border border-border shadow-sm text-text-primary'
                                    : 'text-text-secondary hover:text-text-primary'
                              }`}
                           >
                              {option.label} {option.value.includes('price') && <ChevronDown className="w-3 h-3 inline-block ml-1" />}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </header>

            {error && (
               <div className="mb-8 border border-error/30 bg-error/10 text-error rounded-xl px-4 py-3 text-sm">
                  {error}
               </div>
            )}

            {loading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {Array.from({ length: 6 }).map((_, index) => (
                     <div key={index} className="h-[420px] rounded-2xl border border-border bg-surface animate-pulse"></div>
                  ))}
               </div>
            ) : products.length === 0 ? (
               <div className="text-center border border-border rounded-2xl p-16 bg-surface">
                  <h3 className="text-2xl font-heading font-bold mb-3">No products found</h3>
                  <p className="text-text-secondary mb-6">Try different filters or clear the current selection.</p>
                  <button
                     type="button"
                     onClick={resetFilters}
                     className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-text-primary text-background text-sm font-bold hover:bg-primary transition-colors"
                  >
                     Reset and show all
                  </button>
               </div>
            ) : (
               <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {paginatedProducts.map(product => (
                     <Link
                        key={product.slug}
                        to={`/product/${product.slug}`}
                        className="group cursor-pointer flex flex-col h-full bg-background border border-transparent hover:border-border hover:bg-surface rounded-2xl p-4 transition-colors duration-300"
                     >
                        <div className="aspect-[4/5] bg-surface rounded-xl mb-4 relative overflow-hidden">
                           {product.badge && (
                              <span className="absolute top-4 left-4 bg-text-primary text-background px-2 py-1 text-[10px] font-bold tracking-widest uppercase rounded">
                                 {product.badge}
                              </span>
                           )}
                           <img
                              src={product.image_url}
                              alt={product.name}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                           />
                        </div>
                        <div className="flex-1 flex flex-col">
                           <div className="flex justify-between items-start mb-2 gap-4">
                              <h3 className="font-heading font-bold text-lg leading-tight">{product.name}</h3>
                              <span className="font-bold border border-border px-2 py-1 rounded text-sm bg-surface whitespace-nowrap">
                                 {formatPrice(product.price)}
                              </span>
                           </div>
                           <p className="text-xs uppercase tracking-widest text-text-tertiary mb-2">
                              {product.brand} • {product.category_label}
                           </p>
                           <p className="text-sm text-text-secondary mb-4 leading-relaxed line-clamp-2 flex-1">
                              {product.short_description}
                           </p>
                           <div className="pt-4 border-t border-border flex items-center gap-2 mt-auto">
                              <div className="flex items-center text-warning text-sm font-bold gap-1">
                                 <Star className="w-3 h-3 fill-current" /> {Number(product.rating).toFixed(1)}
                              </div>
                              <span className="text-xs text-text-tertiary">({formatReviewCount(product.review_count)} Reviews)</span>
                           </div>
                        </div>
                     </Link>
                  ))}
                  </div>

                  {totalPages > 1 && (
                     <div className="flex items-center justify-center gap-2 mb-16 flex-wrap">
                        <button
                           type="button"
                           onClick={() => goToPage(currentPage - 1)}
                           disabled={currentPage === 1}
                           className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                        >
                           Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                           <button
                              key={page}
                              type="button"
                              onClick={() => goToPage(page)}
                              className={`min-w-10 px-3 py-2 rounded-lg border text-sm transition-colors ${
                                 currentPage === page
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-border hover:bg-surface'
                              }`}
                           >
                              {page}
                           </button>
                        ))}

                        <button
                           type="button"
                           onClick={() => goToPage(currentPage + 1)}
                           disabled={currentPage === totalPages}
                           className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface transition-colors"
                        >
                           Next
                        </button>
                     </div>
                  )}
               </>
            )}
         </main>
      </div>
   );
}
