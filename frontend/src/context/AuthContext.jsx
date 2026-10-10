import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../lib/api';

// ── State ─────────────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  token: null,
  loading: true,   // true while we're restoring session
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, user: action.user, token: action.token, loading: false };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.user, token: action.token, loading: false, error: null };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: 'HYDRATE', user, token });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'HYDRATE', user: null, token: null });
      }
    } else {
      dispatch({ type: 'HYDRATE', user: null, token: null });
    }
  }, []);

  // Listen for automatic logout events from the API interceptor
  useEffect(() => {
    const handleLogout = () => dispatch({ type: 'LOGOUT' });
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { user, token } = data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', user, token });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', error: message });
      return { success: false, error: message };
    }
  }, []);

  const signup = useCallback(async ({ email, password, firstName, lastName }) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const { data } = await api.post('/auth/signup', { email, password, firstName, lastName });
      const { user, token } = data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', user, token });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Signup failed';
      dispatch({ type: 'SET_ERROR', error: message });
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
