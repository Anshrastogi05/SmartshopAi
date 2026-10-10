import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ShieldCheck, Truck, RotateCcw, Package } from 'lucide-react';
import api from '../lib/api';
import './ProductDetailPage.css';

function StarRating({ rating, count }) {
  return (
    <div className="pdp-rating">
      <div className="stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}>
            <Star size={16} fill={i <= Math.round(rating) ? 'currentColor' : 'none'} />
          </span>
        ))}
      </div>
      <span className="pdp-rating-value">{Number(rating).toFixed(1)}</span>
      <span className="pdp-rating-count">({count?.toLocaleString()} reviews)</span>
    </div>
  );
}

function StockBadge({ stock }) {
  if (stock <= 0) return <span className="badge badge-red">Out of Stock</span>;
  if (stock < 10) return <span className="badge badge-yellow">Low Stock – {stock} left</span>;
  return <span className="badge badge-green">In Stock</span>;
}

function SkeletonDetail() {
  return (
    <div className="pdp-skeleton">
      <div className="skeleton pdp-skeleton-img" />
      <div className="pdp-skeleton-info">
        <div className="skeleton" style={{ height: '1rem', width: '30%', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '2rem', width: '80%', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: '2rem', width: '60%', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: '1rem', width: '50%', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '0.75rem', width: '90%', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: '0.75rem', width: '75%', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: '0.75rem', width: '85%', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '3rem', borderRadius: '0.75rem' }} />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/catalog/products/${idOrSlug}`)
      .then(({ data }) => { setProduct(data.data); setLoading(false); })
      .catch((err) => {
        setError(err.response?.status === 404 ? 'Product not found.' : 'Failed to load product.');
        setLoading(false);
      });
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="pdp-page container">
        <SkeletonDetail />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdp-page container pdp-error-state">
        <span style={{ fontSize: '3rem' }}>😕</span>
        <h2>{error}</h2>
        <Link to="/catalog" className="btn btn-primary" id="pdp-back-btn">← Back to Catalog</Link>
      </div>
    );
  }

  const discount = product.original_price && Number(product.original_price) > Number(product.price)
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  return (
    <div className="pdp-page">
      <div className="container">
        <nav className="pdp-breadcrumb" aria-label="breadcrumb">
          <Link to="/catalog" id="pdp-catalog-link">Catalog</Link>
          {product.category_name && (
            <>
              <span>/</span>
              <Link to={`/catalog?category=${product.category_slug}`} id="pdp-category-link">
                {product.category_name}
              </Link>
            </>
          )}
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="pdp-grid">
          {/* ── Image ─────────────────────────────────────────────── */}
          <div className="pdp-image-wrap card">
            <img
              src={product.image_url}
              alt={product.name}
              className="pdp-image"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x500/1a1a2e/6d28d9?text=No+Image'; }}
            />
            {discount && <span className="pdp-discount-badge">-{discount}% OFF</span>}
          </div>

          {/* ── Info ──────────────────────────────────────────────── */}
          <div className="pdp-info">
            {product.brand && <span className="pdp-brand">{product.brand}</span>}
            <h1 className="pdp-title">{product.name}</h1>

            <StarRating rating={product.rating} count={product.review_count} />

            {/* Pricing */}
            <div className="pdp-pricing">
              <span className="price pdp-price">${Number(product.price).toFixed(2)}</span>
              {product.original_price && Number(product.original_price) > Number(product.price) && (
                <span className="price-original">${Number(product.original_price).toFixed(2)}</span>
              )}
              {discount && <span className="price-discount">Save {discount}%</span>}
            </div>

            <StockBadge stock={product.stock_available} />

            {/* Description */}
            {product.description && (
              <p className="pdp-description">{product.description}</p>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="pdp-tags">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/catalog?q=${encodeURIComponent(tag)}`}
                    className="pdp-tag"
                    id={`tag-${tag}`}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="pdp-actions">
              <Link
                to="/catalog"
                className="btn btn-secondary"
                id="pdp-back-catalog"
              >
                <ArrowLeft size={16} /> Back to Catalog
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="pdp-trust">
              {[
                { icon: <ShieldCheck size={16} />, text: 'Secure checkout' },
                { icon: <Truck size={16} />, text: 'Free shipping over $50' },
                { icon: <RotateCcw size={16} />, text: '30-day returns' },
                { icon: <Package size={16} />, text: 'Fast delivery' },
              ].map(({ icon, text }) => (
                <div key={text} className="pdp-trust-item">
                  {icon} {text}
                </div>
              ))}
            </div>

            {/* Meta */}
            <div className="pdp-meta">
              <span>SKU: {product.sku}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
