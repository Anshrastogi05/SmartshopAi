import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';

function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛍️</div>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404 – Page Not Found</h2>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <a href="/" className="btn btn-primary" id="404-home-btn">Go Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--clr-bg-elevated)',
              color: 'var(--clr-text-primary)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: 'white' } },
          }}
        />

        <Navbar />

        <Routes>
          <Route path="/"               element={<HomePage />} />
          <Route path="/catalog"        element={<CatalogPage />} />
          <Route path="/catalog/:idOrSlug" element={<ProductDetailPage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/signup"         element={<SignupPage />} />
          <Route path="/profile"        element={<ProfilePage />} />
          <Route path="*"               element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
