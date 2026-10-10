import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, ShieldCheck, Calendar, LogOut, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading || !user) return null;

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="profile-page">
      <div className="container-sm">
        <div className="profile-header animate-fade-in">
          <div className="profile-avatar">
            {initials}
          </div>
          <div>
            <h1 className="profile-name">{user.first_name} {user.last_name}</h1>
            <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-green'}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="profile-cards animate-fade-in">
          <div className="profile-info-card card">
            <h3>Account Details</h3>
            <div className="profile-details">
              <div className="profile-detail-row">
                <User size={16} />
                <div>
                  <span className="profile-detail-label">Full Name</span>
                  <span className="profile-detail-value">{user.first_name} {user.last_name}</span>
                </div>
              </div>
              <div className="profile-detail-row">
                <Mail size={16} />
                <div>
                  <span className="profile-detail-label">Email</span>
                  <span className="profile-detail-value">{user.email}</span>
                </div>
              </div>
              <div className="profile-detail-row">
                <ShieldCheck size={16} />
                <div>
                  <span className="profile-detail-label">Account Role</span>
                  <span className="profile-detail-value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                </div>
              </div>
              <div className="profile-detail-row">
                <Calendar size={16} />
                <div>
                  <span className="profile-detail-label">Member Since</span>
                  <span className="profile-detail-value">{memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="profile-actions-card card">
            <h3>Quick Actions</h3>
            <div className="profile-quick-actions">
              <Link to="/catalog" className="btn btn-secondary" id="profile-browse-btn">
                <ShoppingBag size={16} /> Browse Catalog <ArrowRight size={14} />
              </Link>
              <button className="btn btn-ghost profile-logout" onClick={handleLogout} id="profile-logout-btn">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
