import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, PencilLine, Plus, Power, RefreshCw, Search, Trash2 } from 'lucide-react';
import Select, { type SingleValue, type StylesConfig } from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'sonner';
import {
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  getAdminCategories,
  deactivateAdminProduct,
  getAdminProducts,
  updateAdminCategory,
  updateAdminProduct,
  type AdminCategory,
  type AdminCategoryPayload,
  type AdminProduct,
  type AdminProductPayload,
} from '../../lib/storeApi';
import { useAuth } from '../../context/AuthContext';

type CategoryOption = {
  value: string;
  label: string;
};

type SpecRow = {
  key: string;
  value: string;
};

type ProductFormState = {
  name: string;
  brand: string;
  category: string;
  short_description: string;
  description_blocks: string[];
  price: string;
  compare_at_price: string;
  stock: number;
  image_url: string;
  badge: string;
  is_active: boolean;
  is_featured: boolean;
  released_at: string;
  specs: SpecRow[];
  gallery: string[];
};

const EMPTY_FORM: ProductFormState = {
  name: '',
  brand: '',
  category: '',
  short_description: '',
  description_blocks: [''],
  price: '0.00',
  compare_at_price: '',
  stock: 0,
  image_url: '',
  badge: '',
  is_active: true,
  is_featured: false,
  released_at: '',
  specs: [{ key: '', value: '' }],
  gallery: [''],
};

const categorySelectStyles: StylesConfig<CategoryOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: '48px',
    borderRadius: '0.75rem',
    backgroundColor: 'var(--background)',
    borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
    boxShadow: 'none',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--primary)' : 'var(--border-hover)',
    },
  }),
  valueContainer: base => ({
    ...base,
    padding: '0 0.75rem',
  }),
  input: base => ({
    ...base,
    color: 'var(--text-primary)',
  }),
  singleValue: base => ({
    ...base,
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
  }),
  placeholder: base => ({
    ...base,
    color: 'var(--text-tertiary)',
    fontSize: '0.875rem',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? 'var(--primary)' : 'var(--text-tertiary)',
    padding: '0.5rem',
  }),
  menuPortal: base => ({
    ...base,
    zIndex: 60,
  }),
  menu: base => ({
    ...base,
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    overflow: 'hidden',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused || state.isSelected ? 'var(--surface-hover)' : 'var(--surface)',
    color: state.isSelected ? 'var(--primary)' : 'var(--text-primary)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    padding: '0.625rem 0.75rem',
  }),
};

function parseDescriptionBlocks(description: string) {
  const blocks = description
    .split(/\n{2,}/)
    .map(value => value.trim())
    .filter(Boolean);

  return blocks.length > 0 ? blocks : [''];
}

function normalizeCategorySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseReleaseDate(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

  return new Date(year, month - 1, day);
}

function formatReleaseDate(value: Date | null) {
  if (!value) return '';

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function productToForm(product: AdminProduct): ProductFormState {
  const specs = Object.entries(product.specs ?? {}).map(([key, value]) => ({
    key,
    value: String(value ?? ''),
  }));

  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    short_description: product.short_description,
    description_blocks: parseDescriptionBlocks(product.description || ''),
    price: product.price,
    compare_at_price: product.compare_at_price ?? '',
    stock: product.stock,
    image_url: product.image_url,
    badge: product.badge || '',
    is_active: product.is_active,
    is_featured: product.is_featured,
    released_at: product.released_at ?? '',
    specs: specs.length > 0 ? specs : [{ key: '', value: '' }],
    gallery: product.gallery && product.gallery.length > 0 ? product.gallery : [''],
  };
}

function formToPayload(form: ProductFormState): AdminProductPayload {
  const category = form.category.trim().toLowerCase();
  if (!category) {
    throw new Error('Select a category before saving product.');
  }

  const description = form.description_blocks
    .map(value => value.trim())
    .filter(Boolean)
    .join('\n\n');

  if (!description) {
    throw new Error('Full description requires at least one paragraph.');
  }

  const specs = form.specs.reduce<Record<string, string>>((result, row) => {
    const key = row.key.trim();
    if (!key) return result;

    result[key] = row.value.trim();
    return result;
  }, {});

  const gallery = form.gallery.map(value => value.trim()).filter(Boolean);

  return {
    name: form.name.trim(),
    brand: form.brand.trim(),
    category,
    short_description: form.short_description.trim(),
    description,
    price: form.price,
    compare_at_price: form.compare_at_price.trim() ? form.compare_at_price.trim() : null,
    stock: form.stock,
    image_url: form.image_url.trim(),
    badge: form.badge.trim(),
    is_active: form.is_active,
    is_featured: form.is_featured,
    released_at: form.released_at.trim() ? form.released_at : null,
    specs,
    gallery,
  };
}

function FieldLabel({ children }: { children: string }) {
  return <label className="block text-xs font-bold tracking-widest uppercase text-text-tertiary mb-2">{children}</label>;
}

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [pendingDeactivation, setPendingDeactivation] = useState<AdminProduct | null>(null);
  const [error, setError] = useState('');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [categorySlugInput, setCategorySlugInput] = useState('');
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);

  const editingProduct = useMemo(
    () => products.find(product => product.id === editingProductId) ?? null,
    [products, editingProductId]
  );

  const categoryOptions = useMemo<CategoryOption[]>(
    () => categories.map(category => ({ value: category.slug, label: category.name })),
    [categories]
  );

  const selectedCategory = useMemo(
    () => categoryOptions.find(option => option.value === form.category) ?? null,
    [categoryOptions, form.category]
  );

  const loadProducts = async (query = search) => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const result = await getAdminProducts(token, query.trim() || undefined);
      setProducts(result);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load products.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!token) return;

    try {
      const result = await getAdminCategories(token);
      setCategories(result);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load categories.';
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!token) return;
    void Promise.all([loadProducts(''), loadCategories()]);
  }, [token]);

  useEffect(() => {
    if (categories.length === 0) {
      if (form.category) {
        setForm(current => ({ ...current, category: '' }));
      }
      return;
    }

    const exists = categories.some(category => category.slug === form.category);
    if (!exists) {
      setForm(current => ({ ...current, category: categories[0].slug }));
    }
  }, [categories, form.category]);

  const resetForm = () => {
    setEditingProductId(null);
    setForm({ ...EMPTY_FORM, category: categories[0]?.slug ?? '' });
  };

  const resetCategoryEditor = () => {
    setEditingCategoryId(null);
    setCategoryNameInput('');
    setCategorySlugInput('');
  };

  const startCategoryEdit = (category: AdminCategory) => {
    setEditingCategoryId(category.id);
    setCategoryNameInput(category.name);
    setCategorySlugInput(category.slug);
  };

  const handleCategorySubmit = async () => {
    if (!token) return;

    const name = categoryNameInput.trim();
    if (!name) {
      toast.error('Category name is required.');
      return;
    }

    const normalizedSlug = normalizeCategorySlug(categorySlugInput);
    const payload: AdminCategoryPayload = {
      name,
      ...(normalizedSlug ? { slug: normalizedSlug } : {}),
    };

    setCategorySaving(true);
    try {
      if (editingCategoryId) {
        const updatePayload = categorySlugInput.trim() ? payload : { name };
        await updateAdminCategory(token, editingCategoryId, updatePayload);
        toast.success('Category updated.');
      } else {
        await createAdminCategory(token, payload);
        toast.success('Category added.');
      }

      resetCategoryEditor();
      await Promise.all([loadCategories(), loadProducts()]);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to save category.';
      toast.error(message);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (category: AdminCategory) => {
    if (!token) return;

    if (!window.confirm(`Delete category ${category.name}?`)) {
      return;
    }

    try {
      await deleteAdminCategory(token, category.id);
      toast.success('Category deleted.');
      if (editingCategoryId === category.id) {
        resetCategoryEditor();
      }
      await Promise.all([loadCategories(), loadProducts()]);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Unable to delete category.';
      toast.error(message);
    }
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingProductId(product.id);
    setForm(productToForm(product));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    try {
      const payload = formToPayload(form);

      if (editingProductId) {
        await updateAdminProduct(token, editingProductId, payload);
        toast.success('Product updated.');
      } else {
        await createAdminProduct(token, payload);
        toast.success('Product created.');
      }

      resetForm();
      await loadProducts();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to save product.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (product: AdminProduct) => {
    setPendingDeactivation(product);
  };

  const confirmDeactivate = async () => {
    if (!token || !pendingDeactivation) return;

    setDeactivatingId(pendingDeactivation.id);
    try {
      await deactivateAdminProduct(token, pendingDeactivation.id);
      toast.success('Product deactivated.');
      setPendingDeactivation(null);
      await loadProducts();
    } catch (deactivateError) {
      const message = deactivateError instanceof Error ? deactivateError.message : 'Unable to deactivate product.';
      toast.error(message);
    } finally {
      setDeactivatingId(null);
    }
  };

  const handleReactivate = async (product: AdminProduct) => {
    if (!token) return;

    try {
      await updateAdminProduct(token, product.id, { is_active: true });
      toast.success('Product reactivated.');
      await loadProducts();
    } catch (reactivateError) {
      const message = reactivateError instanceof Error ? reactivateError.message : 'Unable to reactivate product.';
      toast.error(message);
    }
  };

  const updateField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const updateSpecRow = (index: number, key: keyof SpecRow, value: string) => {
    setForm(current => ({
      ...current,
      specs: current.specs.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    }));
  };

  const addSpecRow = () => {
    setForm(current => ({ ...current, specs: [...current.specs, { key: '', value: '' }] }));
  };

  const removeSpecRow = (index: number) => {
    setForm(current => {
      const nextRows = current.specs.filter((_, rowIndex) => rowIndex !== index);
      return { ...current, specs: nextRows.length > 0 ? nextRows : [{ key: '', value: '' }] };
    });
  };

  const updateDescriptionBlock = (index: number, value: string) => {
    setForm(current => ({
      ...current,
      description_blocks: current.description_blocks.map((block, blockIndex) => (blockIndex === index ? value : block)),
    }));
  };

  const addDescriptionBlock = () => {
    setForm(current => ({ ...current, description_blocks: [...current.description_blocks, ''] }));
  };

  const removeDescriptionBlock = (index: number) => {
    setForm(current => {
      const nextBlocks = current.description_blocks.filter((_, blockIndex) => blockIndex !== index);
      return { ...current, description_blocks: nextBlocks.length > 0 ? nextBlocks : [''] };
    });
  };

  const updateGalleryRow = (index: number, value: string) => {
    setForm(current => ({
      ...current,
      gallery: current.gallery.map((row, rowIndex) => (rowIndex === index ? value : row)),
    }));
  };

  const addGalleryRow = () => {
    setForm(current => ({ ...current, gallery: [...current.gallery, ''] }));
  };

  const removeGalleryRow = (index: number) => {
    setForm(current => {
      const nextRows = current.gallery.filter((_, rowIndex) => rowIndex !== index);
      return { ...current, gallery: nextRows.length > 0 ? nextRows : [''] };
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
      <section className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-black">{editingProduct ? `Edit ${editingProduct.name}` : 'Add Product'}</h2>
          {editingProduct && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-bold uppercase tracking-widest text-text-tertiary hover:text-primary"
            >
              Clear Form
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 bg-background border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <FieldLabel>Manage Categories</FieldLabel>
              {editingCategoryId && (
                <button
                  type="button"
                  onClick={resetCategoryEditor}
                  className="text-xs font-bold uppercase tracking-widest text-text-tertiary hover:text-primary"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 mb-3">
              <input
                value={categoryNameInput}
                onChange={event => setCategoryNameInput(event.target.value)}
                placeholder="Category name (e.g. Smart Home)"
                className="w-full min-w-0 bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                value={categorySlugInput}
                onChange={event => setCategorySlugInput(normalizeCategorySlug(event.target.value))}
                placeholder="Slug (optional)"
                className="w-full min-w-0 bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => void handleCategorySubmit()}
                disabled={categorySaving}
                className="justify-self-start sm:justify-self-auto inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-text-primary text-background text-xs font-bold uppercase tracking-widest hover:bg-primary disabled:opacity-60"
              >
                <Plus className="w-3 h-3" /> {categorySaving ? 'Saving...' : editingCategoryId ? 'Update' : 'Add'}
              </button>
            </div>

            {categories.length === 0 ? (
              <p className="text-xs text-text-secondary">No categories yet. Add your first category to start creating products.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{category.name}</p>
                      <p className="text-[11px] text-text-tertiary uppercase tracking-widest">{category.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-border text-text-tertiary">
                        {category.product_count} products
                      </span>
                      <button
                        type="button"
                        onClick={() => startCategoryEdit(category)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border hover:bg-background"
                        aria-label={`Edit category ${category.name}`}
                      >
                        <PencilLine className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteCategory(category)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border text-error hover:bg-error/10"
                        aria-label={`Delete category ${category.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Product Name</FieldLabel>
            <input
              value={form.name}
              onChange={event => updateField('name', event.target.value)}
              placeholder="e.g. Pixel Prime X"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <FieldLabel>Brand</FieldLabel>
            <input
              value={form.brand}
              onChange={event => updateField('brand', event.target.value)}
              placeholder="e.g. Google"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <FieldLabel>Category</FieldLabel>
            <Select<CategoryOption, false>
              options={categoryOptions}
              value={selectedCategory}
              onChange={(option: SingleValue<CategoryOption>) => {
                if (option) updateField('category', option.value);
              }}
              placeholder={categories.length > 0 ? 'Choose category' : 'Add category first'}
              isDisabled={categories.length === 0}
              styles={categorySelectStyles}
              menuPlacement="auto"
              menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
              isSearchable={false}
            />
          </div>

          <div>
            <FieldLabel>Price</FieldLabel>
            <input
              value={form.price}
              onChange={event => updateField('price', event.target.value)}
              placeholder="e.g. 799.00"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <FieldLabel>Compare-At Price (Optional)</FieldLabel>
            <input
              value={form.compare_at_price}
              onChange={event => updateField('compare_at_price', event.target.value)}
              placeholder="e.g. 999.00"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <FieldLabel>Stock Quantity</FieldLabel>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={event => updateField('stock', Number(event.target.value) || 0)}
              placeholder="0"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <FieldLabel>Release Date (Optional)</FieldLabel>
            <div className="relative">
              <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none z-10" />
              <DatePicker
                selected={parseReleaseDate(form.released_at)}
                onChange={(value: Date | null) => updateField('released_at', formatReleaseDate(value))}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select release date"
                isClearable
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                wrapperClassName="w-full"
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary"
                calendarClassName="electra-datepicker"
                popperClassName="electra-datepicker-popper"
                showPopperArrow={false}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Badge (Optional)</FieldLabel>
            <input
              value={form.badge}
              onChange={event => updateField('badge', event.target.value)}
              placeholder="e.g. New Arrival"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Main Image URL</FieldLabel>
            <input
              value={form.image_url}
              onChange={event => updateField('image_url', event.target.value)}
              placeholder="https://..."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
              required
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Short Description</FieldLabel>
            <textarea
              value={form.short_description}
              onChange={event => updateField('short_description', event.target.value)}
              placeholder="One concise sentence that appears in cards and lists."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none"
              rows={2}
              required
            ></textarea>
          </div>

          <div className="md:col-span-2 bg-background border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <FieldLabel>Full Description Paragraphs</FieldLabel>
              <button
                type="button"
                onClick={addDescriptionBlock}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-bold uppercase tracking-widest hover:bg-surface"
              >
                <Plus className="w-3 h-3" /> Add Paragraph
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {form.description_blocks.map((paragraph, index) => (
                <div key={`description-${index}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold tracking-widest uppercase text-text-tertiary">Paragraph {index + 1}</p>
                    {form.description_blocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDescriptionBlock(index)}
                        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-error hover:opacity-80"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    value={paragraph}
                    onChange={event => updateDescriptionBlock(index, event.target.value)}
                    placeholder="Write this section of the full description..."
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-y"
                    rows={3}
                  ></textarea>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-background border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <FieldLabel>Specifications (Key / Value)</FieldLabel>
              <button
                type="button"
                onClick={addSpecRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-bold uppercase tracking-widest hover:bg-surface"
              >
                <Plus className="w-3 h-3" /> Add Spec
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {form.specs.map((row, index) => (
                <div key={`spec-${index}`} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-center">
                  <input
                    value={row.key}
                    onChange={event => updateSpecRow(index, 'key', event.target.value)}
                    placeholder="Field name (e.g. Display)"
                    className="w-full min-w-0 bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={row.value}
                    onChange={event => updateSpecRow(index, 'value', event.target.value)}
                    placeholder="Value (e.g. 6.7-inch OLED)"
                    className="w-full min-w-0 bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(index)}
                    className="justify-self-start sm:justify-self-auto inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border text-error hover:bg-error/10"
                    aria-label="Remove specification row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-background border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <FieldLabel>Gallery Image URLs</FieldLabel>
              <button
                type="button"
                onClick={addGalleryRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-bold uppercase tracking-widest hover:bg-surface"
              >
                <Plus className="w-3 h-3" /> Add Image
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {form.gallery.map((url, index) => (
                <div key={`gallery-${index}`} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-2 items-center">
                  <input
                    value={url}
                    onChange={event => updateGalleryRow(index, event.target.value)}
                    placeholder="https://..."
                    className="w-full min-w-0 bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryRow(index)}
                    className="justify-self-start sm:justify-self-auto inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border text-error hover:bg-error/10"
                    aria-label="Remove gallery row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={event => updateField('is_featured', event.target.checked)}
              />
              Featured Product
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={event => updateField('is_active', event.target.checked)}
              />
              Active Product
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="md:col-span-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-text-primary text-background text-sm font-bold hover:bg-primary transition-colors disabled:opacity-60"
          >
            {editingProduct ? <PencilLine className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </section>

      <section className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-heading font-black">Catalog Inventory</h2>
          <button
            type="button"
            onClick={() => void loadProducts()}
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-text-tertiary hover:text-primary"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void loadProducts();
              }
            }}
            placeholder="Search products..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>

        {error ? (
          <div className="border border-error/30 bg-error/10 text-error rounded-xl px-4 py-3 text-sm mb-3">{error}</div>
        ) : null}

        {loading ? (
          <p className="text-sm text-text-secondary">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-text-secondary">No products found.</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-[920px] overflow-y-auto pr-1">
            {products.map(product => (
              <article key={product.id} className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-bold leading-tight">{product.name}</h3>
                    <p className="text-xs text-text-tertiary uppercase tracking-widest mt-1">
                      {product.brand} • {product.category_label}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-1 rounded ${
                      product.is_active
                        ? 'border-success/30 text-success bg-success/10'
                        : 'border-warning/30 text-warning bg-warning/10'
                    }`}
                  >
                    {product.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </div>

                <p className="text-xs text-text-secondary mb-3 line-clamp-2">{product.short_description}</p>

                <div className="flex items-center justify-between gap-3 text-xs mb-3">
                  <span className="font-bold">${Number(product.price).toFixed(2)}</span>
                  <span className="text-text-tertiary">Stock: {product.stock}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-xs font-bold uppercase tracking-widest hover:bg-surface"
                  >
                    <PencilLine className="w-3 h-3" /> Edit
                  </button>

                  {product.is_active ? (
                    <button
                      type="button"
                      onClick={() => handleDeactivate(product)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-error/30 text-error text-xs font-bold uppercase tracking-widest hover:bg-error/10"
                    >
                      <Power className="w-3 h-3" /> Deactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleReactivate(product)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-success/30 text-success text-xs font-bold uppercase tracking-widest hover:bg-success/10"
                    >
                      <Power className="w-3 h-3" /> Reactivate
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {pendingDeactivation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close deactivation dialog"
            onClick={() => {
              if (deactivatingId !== pendingDeactivation.id) {
                setPendingDeactivation(null);
              }
            }}
            className="absolute inset-0 bg-foreground/55"
          />

          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <p className="text-[11px] font-bold tracking-widest uppercase text-error mb-3">Deactivate Product</p>
            <h3 className="text-xl font-heading font-black mb-2">{pendingDeactivation.name}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Are you sure you want to deactivate this product? It will be hidden from the customer catalog until reactivated.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDeactivation(null)}
                disabled={deactivatingId === pendingDeactivation.id}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-background transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeactivate()}
                disabled={deactivatingId === pendingDeactivation.id}
                className="px-4 py-2 rounded-lg bg-error text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {deactivatingId === pendingDeactivation.id ? 'Deactivating...' : 'Yes, deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
