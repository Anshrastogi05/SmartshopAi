import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, LogOut, LogIn, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchValue.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" id="nav-logo">
          <div className="navbar-logo-icon">
            <ShoppingBag size={20} />
          </div>
          <span className="navbar-logo-text">
            Shop<span className="text-gradient">Smart</span>
            <span className="navbar-logo-badge">AI</span>
          </span>
        </Link>

        {/* Desktop Search */}
        <form className="navbar-search" onSubmit={handleSearch} id="nav-search-form">
          <Search size={16} className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            className="navbar-search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            id="nav-search-input"
          />
        </form>

        {/* Desktop Nav */}
        <nav className="navbar-links">
          <NavLink to="/catalog" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} id="nav-catalog">
            Catalog
          </NavLink>
          {user ? (
            <>
              <NavLink to="/profile" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} id="nav-profile">
                <User size={14} />
                {user.first_name}
              </NavLink>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="nav-logout">
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} id="nav-login">
                <LogIn size={14} />
                Login
              </NavLink>
              <Link to="/signup" className="btn btn-primary btn-sm" id="nav-signup">
                <Sparkles size={14} />
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="nav-hamburger"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar-mobile animate-slide-in">
          <div className="container">
            <form onSubmit={handleSearch} className="navbar-mobile-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                id="nav-mobile-search"
              />
            </form>
            <nav className="navbar-mobile-links">
              <NavLink to="/catalog" onClick={() => setMenuOpen(false)} id="nav-mobile-catalog">Catalog</NavLink>
              {user ? (
                <>
                  <NavLink to="/profile" onClick={() => setMenuOpen(false)} id="nav-mobile-profile">
                    Profile ({user.first_name})
                  </NavLink>
                  <button onClick={handleLogout} id="nav-mobile-logout">Logout</button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setMenuOpen(false)} id="nav-mobile-login">Login</NavLink>
                  <NavLink to="/signup" onClick={() => setMenuOpen(false)} id="nav-mobile-signup">Sign Up</NavLink>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
