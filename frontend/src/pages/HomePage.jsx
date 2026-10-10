import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Star, Zap, ArrowRight, Shield, Cpu, TrendingUp } from 'lucide-react';
import './HomePage.css';

const FEATURES = [
  { icon: <Cpu size={24} />, title: 'AI-Powered Search', desc: 'Find exactly what you need with intelligent semantic search that understands natural language.' },
  { icon: <Star size={24} />, title: 'Smart Recommendations', desc: 'Get personalized product suggestions based on your preferences and browsing history.' },
  { icon: <Shield size={24} />, title: 'Secure Shopping', desc: 'Shop with confidence. Your data is encrypted and your payments are always protected.' },
  { icon: <TrendingUp size={24} />, title: 'Price Tracking', desc: 'Never miss a deal. We monitor prices across categories to get you the best value.' },
];

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', emoji: '📱', color: 'rgba(124,58,237,0.15)' },
  { name: 'Clothing', slug: 'clothing', emoji: '👗', color: 'rgba(59,130,246,0.15)' },
  { name: 'Home & Garden', slug: 'home-garden', emoji: '🏡', color: 'rgba(16,185,129,0.15)' },
  { name: 'Sports', slug: 'sports-outdoors', emoji: '⚽', color: 'rgba(245,158,11,0.15)' },
  { name: 'Books', slug: 'books', emoji: '📚', color: 'rgba(239,68,68,0.15)' },
  { name: 'Beauty', slug: 'beauty-health', emoji: '✨', color: 'rgba(34,211,238,0.15)' },
];

export default function HomePage() {
  return (
    <main className="home">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="container hero-content">
          <div className="hero-badge badge badge-purple animate-fade-in">
            <Zap size={12} />
            AI-Powered Shopping Platform
          </div>
          <h1 className="hero-title animate-fade-in">
            Shop Smarter with
            <br />
            <span className="text-gradient">Artificial Intelligence</span>
          </h1>
          <p className="hero-subtitle animate-fade-in">
            Discover thousands of products tailored to your taste. Our AI understands
            what you need — before you even know you need it.
          </p>
          <div className="hero-actions animate-fade-in">
            <Link to="/catalog" className="btn btn-primary btn-lg" id="hero-browse-btn">
              <ShoppingBag size={18} />
              Browse Catalog
            </Link>
            <Link to="/signup" className="btn btn-secondary btn-lg" id="hero-signup-btn">
              Get Started Free
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Search Bar */}
          <form
            className="hero-search glass animate-fade-in"
            onSubmit={(e) => {
              e.preventDefault();
              const q = e.target.querySelector('input').value;
              if (q) window.location.href = `/catalog?q=${encodeURIComponent(q)}`;
            }}
          >
            <Search size={18} className="hero-search-icon" />
            <input
              type="text"
              placeholder='Try "noise canceling headphones" or "running shoes"...'
              className="hero-search-input"
              id="hero-search-input"
            />
            <button type="submit" className="btn btn-primary btn-sm" id="hero-search-btn">
              Search
            </button>
          </form>

          {/* Stats */}
          <div className="hero-stats animate-fade-in">
            {[['15+', 'Products'], ['6', 'Categories'], ['100%', 'Secure']].map(([val, label]) => (
              <div key={label} className="hero-stat">
                <span className="hero-stat-value text-gradient">{val}</span>
                <span className="hero-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────── */}
      <section className="home-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <Link to="/catalog" className="btn btn-ghost btn-sm" id="home-all-categories">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/catalog?category=${cat.slug}`}
                className="category-card card"
                id={`category-${cat.slug}`}
                style={{ '--cat-color': cat.color }}
              >
                <span className="category-card-emoji">{cat.emoji}</span>
                <span className="category-card-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="home-section home-section-alt">
        <div className="container">
          <div className="section-header centered">
            <h2>Why ShopSmart AI?</h2>
            <p>Built for the modern shopper who expects more than just a product list.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card card">
                <div className="feature-card-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section className="home-section">
        <div className="container">
          <div className="cta-banner glass">
            <div className="cta-banner-glow" />
            <div className="cta-banner-content">
              <h3>Ready to experience smarter shopping?</h3>
              <p>Create your free account and unlock AI-powered recommendations today.</p>
              <Link to="/signup" className="btn btn-primary btn-lg" id="home-cta-signup">
                <Zap size={18} />
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
