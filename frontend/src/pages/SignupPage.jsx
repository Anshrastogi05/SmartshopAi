import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim())  errs.lastName  = 'Last name is required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    const result = await signup(form);
    setSubmitting(false);

    if (result.success) {
      toast.success('Account created! Welcome to ShopSmart AI 🎉');
      navigate('/');
    } else {
      toast.error(result.error || 'Signup failed');
      setErrors({ api: result.error });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const pwStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength];
  const strengthClass = ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong'][pwStrength];

  return (
    <div className="auth-page">
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />

      <div className="auth-card glass animate-fade-in" id="signup-card">
        <div className="auth-header">
          <div className="auth-logo">
            <ShoppingBag size={22} />
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join ShopSmart AI and shop smarter</p>
        </div>

        {errors.api && (
          <div className="auth-error-banner" role="alert">{errors.api}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Name Row */}
          <div className="auth-name-row">
            <div className="form-group">
              <label className="label" htmlFor="signup-firstName">First name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  id="signup-firstName"
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  className={`input input-with-icon ${errors.firstName ? 'input-error' : ''}`}
                  placeholder="John"
                  value={form.firstName}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {errors.firstName && <span className="form-error">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="signup-lastName">Last name</label>
              <input
                id="signup-lastName"
                type="text"
                name="lastName"
                autoComplete="family-name"
                className={`input ${errors.lastName ? 'input-error' : ''}`}
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.lastName && <span className="form-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="signup-email">Email address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="signup-email"
                type="email"
                name="email"
                autoComplete="email"
                className={`input input-with-icon ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="label" htmlFor="signup-password">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="signup-password"
                type={showPw ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                className={`input input-with-icon input-with-icon-right ${errors.password ? 'input-error' : ''}`}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                disabled={submitting}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                id="signup-toggle-pw"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Password strength */}
            {form.password && (
              <div className="pw-strength">
                <div className="pw-strength-bars">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`pw-strength-bar ${i <= pwStrength ? `filled ${strengthClass}` : ''}`}
                    />
                  ))}
                </div>
                <span className={`pw-strength-label ${strengthClass}`}>{strengthLabel}</span>
              </div>
            )}
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={submitting}
            id="signup-submit-btn"
          >
            {submitting ? (
              <><span className="spinner spinner-sm" /> Creating account...</>
            ) : (
              <><Sparkles size={16} /> Create Account</>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link" id="signup-to-login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
