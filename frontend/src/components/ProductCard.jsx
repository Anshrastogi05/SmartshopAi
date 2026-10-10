import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Zap } from 'lucide-react';
import './ProductCard.css';

function StarRating({ rating }) {
  return (
    <div className="stars" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}>
          <Star size={12} fill={i <= Math.round(rating) ? 'currentColor' : 'none'} />
        </span>
      ))}
    </div>
  );
}

function DiscountBadge({ price, originalPrice }) {
  if (!originalPrice || originalPrice <= price) return null;
  const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
  return <span className="product-card-discount">-{pct}%</span>;
}

export default function ProductCard({ product }) {
  const {
    id, slug, name, brand, price, original_price,
    image_url, rating, review_count, stock_available,
    category_name,
  } = product;

  const inStock = stock_available > 0;

  return (
    <article className="product-card card" id={`product-${id}`}>
      {/* Image */}
      <Link to={`/catalog/${slug}`} className="product-card-image-wrap">
        <img
          src={image_url}
          alt={name}
          className="product-card-image"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/1a1a2e/6d28d9?text=No+Image'; }}
        />
        <DiscountBadge price={price} originalPrice={original_price} />
        {!inStock && (
          <div className="product-card-out-of-stock">Out of Stock</div>
        )}
      </Link>

      {/* Content */}
      <div className="product-card-body">
        {category_name && (
          <span className="product-card-category">{category_name}</span>
        )}
        <Link to={`/catalog/${slug}`} className="product-card-name" title={name}>
          {name}
        </Link>
        {brand && <p className="product-card-brand">{brand}</p>}

        {/* Rating */}
        <div className="product-card-rating">
          <StarRating rating={rating} />
          <span className="product-card-review-count">({review_count?.toLocaleString()})</span>
        </div>

        {/* Pricing */}
        <div className="product-card-footer">
          <div className="product-card-prices">
            <span className="price">${Number(price).toFixed(2)}</span>
            {original_price && Number(original_price) > Number(price) && (
              <span className="price-original">${Number(original_price).toFixed(2)}</span>
            )}
          </div>
          <Link
            to={`/catalog/${slug}`}
            className="product-card-cta btn btn-sm btn-primary"
            aria-label={`View ${name}`}
            id={`view-product-${id}`}
          >
            <Zap size={13} />
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card card product-card-skeleton">
      <div className="skeleton product-card-image-skeleton" />
      <div className="product-card-body">
        <div className="skeleton" style={{ height: '0.7rem', width: '40%', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: '1rem', width: '85%', marginBottom: '0.4rem' }} />
        <div className="skeleton" style={{ height: '0.8rem', width: '50%', marginBottom: '0.75rem' }} />
        <div className="skeleton" style={{ height: '0.8rem', width: '30%', marginBottom: '1rem' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: '1.25rem', width: '35%' }} />
          <div className="skeleton" style={{ height: '2rem', width: '4rem', borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
    </div>
  );
}
