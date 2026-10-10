import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import './CatalogPage.css';

const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest First' },
  { value: 'price_asc',       label: 'Price: Low to High' },
  { value: 'price_desc',      label: 'Price: High to Low' },
  { value: 'rating_desc',     label: 'Highest Rated' },
  { value: 'popular',         label: 'Most Popular' },
];

function ErrorState({ message, onRetry }) {
  return (
    <div className="catalog-state catalog-error">
      <span className="catalog-state-emoji">⚠️</span>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      <button className="btn btn-primary" onClick={onRetry} id="catalog-retry-btn">Try Again</button>
    </div>
  );
}

function EmptyState({ query }) {
  return (
    <div className="catalog-state catalog-empty">
      <span className="catalog-state-emoji">🔍</span>
      <h3>No products found</h3>
      <p>
        {query
          ? `We couldn't find any products matching "${query}". Try different keywords.`
          : 'No products match your current filters. Try adjusting or clearing the filters.'}
      </p>
    </div>
  );
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Derive state from URL params
  const q          = searchParams.get('q')        || '';
  const category   = searchParams.get('category') || '';
  const sort       = searchParams.get('sort')     || 'created_at_desc';
  const page       = parseInt(searchParams.get('page') || '1', 10);
  const minPrice   = searchParams.get('minPrice') || '';
  const maxPrice   = searchParams.get('maxPrice') || '';

  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [searchInput, setSearchInput] = useState(q);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) { next.set(key, value); } else { next.delete(key); }
    next.delete('page'); // reset to page 1 on filter change
    setSearchParams(next);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12, sort };
      if (q)        params.q = q;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await api.get('/catalog/products', { params });
      setProducts(data.data);
      setMeta(data.meta);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [q, category, sort, page, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Fetch categories once
  useEffect(() => {
    api.get('/catalog/categories').then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  // Keep search input in sync with URL
  useEffect(() => { setSearchInput(q); }, [q]);
  useEffect(() => { setLocalMin(minPrice); }, [minPrice]);
  useEffect(() => { setLocalMax(maxPrice); }, [maxPrice]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('q', searchInput);
  };

  const handlePriceFilter = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localMin) { next.set('minPrice', localMin); } else { next.delete('minPrice'); }
    if (localMax) { next.set('maxPrice', localMax); } else { next.delete('maxPrice'); }
    next.delete('page');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setLocalMin(''); setLocalMax(''); setSearchInput('');
  };

  const hasFilters = q || category || minPrice || maxPrice || sort !== 'created_at_desc';

  return (
    <div className="catalog-layout">
      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className={`catalog-sidebar ${filtersOpen ? 'open' : ''}`} id="catalog-sidebar">
        <div className="catalog-sidebar-header">
          <h3>Filters</h3>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearAllFilters} id="catalog-clear-filters">
              <X size={14} /> Clear All
            </button>
          )}
          <button className="catalog-sidebar-close" onClick={() => setFiltersOpen(false)} id="catalog-close-filters">
            <X size={18} />
          </button>
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-group-label">Category</label>
          <div className="filter-list">
            <button
              className={`filter-item ${!category ? 'active' : ''}`}
              onClick={() => updateParam('category', '')}
              id="filter-category-all"
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`filter-item ${category === cat.slug ? 'active' : ''}`}
                onClick={() => updateParam('category', cat.slug)}
                id={`filter-category-${cat.slug}`}
              >
                {cat.name}
                <span className="filter-item-count">{cat.product_count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="filter-group">
          <label className="filter-group-label">Price Range</label>
          <form onSubmit={handlePriceFilter} className="price-range-form">
            <input
              type="number"
              placeholder="Min $"
              className="input input-sm"
              min="0"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              id="filter-price-min"
            />
            <span className="price-range-sep">—</span>
            <input
              type="number"
              placeholder="Max $"
              className="input input-sm"
              min="0"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              id="filter-price-max"
            />
            <button type="submit" className="btn btn-secondary btn-sm" id="filter-price-apply">
              Apply
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="catalog-main">
        {/* Toolbar */}
        <div className="catalog-toolbar">
          <form className="catalog-search-form" onSubmit={handleSearch}>
            <Search size={16} className="catalog-search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              className="input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              id="catalog-search-input"
            />
          </form>

          <div className="catalog-toolbar-right">
            <button
              className="btn btn-secondary btn-sm catalog-filter-toggle"
              onClick={() => setFiltersOpen(true)}
              id="catalog-open-filters"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <select
              className="input catalog-sort"
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              id="catalog-sort-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {hasFilters && (
          <div className="active-filters">
            {q && <span className="active-filter-chip">Search: "{q}" <button onClick={() => updateParam('q', '')}><X size={11} /></button></span>}
            {category && <span className="active-filter-chip">Category: {categories.find(c => c.slug === category)?.name || category} <button onClick={() => updateParam('category', '')}><X size={11} /></button></span>}
            {minPrice && <span className="active-filter-chip">Min: ${minPrice} <button onClick={() => { const n = new URLSearchParams(searchParams); n.delete('minPrice'); setSearchParams(n); }}><X size={11} /></button></span>}
            {maxPrice && <span className="active-filter-chip">Max: ${maxPrice} <button onClick={() => { const n = new URLSearchParams(searchParams); n.delete('maxPrice'); setSearchParams(n); }}><X size={11} /></button></span>}
          </div>
        )}

        {/* Results count */}
        {!loading && meta && (
          <p className="catalog-result-count">
            {meta.total} product{meta.total !== 1 ? 's' : ''} found
            {q && <> for "<strong>{q}</strong>"</>}
          </p>
        )}

        {/* Product Grid */}
        {error ? (
          <ErrorState message={error} onRetry={fetchProducts} />
        ) : loading ? (
          <div className="product-grid">
            {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState query={q} />
        ) : (
          <div className="product-grid">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && !loading && (
          <div className="catalog-pagination">
            <button
              className="btn btn-secondary btn-sm"
              disabled={!meta.hasPrev}
              onClick={() => updateParam('page', String(page - 1))}
              id="catalog-prev-page"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <div className="pagination-pages">
              {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    className={`pagination-page ${p === page ? 'active' : ''}`}
                    onClick={() => updateParam('page', String(p))}
                    id={`catalog-page-${p}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              disabled={!meta.hasNext}
              onClick={() => updateParam('page', String(page + 1))}
              id="catalog-next-page"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
