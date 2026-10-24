import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Settings, LogOut, Menu, X, Stethoscope,
  ImageIcon, MessageSquare, Mail, FileText, ChevronRight, User, Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/admin/appointments', icon: <Calendar size={18} />, label: 'Appointments' },
  { to: '/admin/services', icon: <Stethoscope size={18} />, label: 'Services' },
  { to: '/admin/doctors', icon: <User size={18} />, label: 'Doctors' },
  { to: '/admin/gallery', icon: <ImageIcon size={18} />, label: 'Gallery' },
  { to: '/admin/testimonials', icon: <MessageSquare size={18} />, label: 'Testimonials' },
  { to: '/admin/content', icon: <FileText size={18} />, label: 'Content' },
  { to: '/admin/inquiries', icon: <Mail size={18} />, label: 'Inquiries' },
  { to: '/admin/settings', icon: <Settings size={18} />, label: 'Settings' },
];

const AdminLayout = () => {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileSidebarOpen(false); }, [location]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="loading-spinner" />
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`} aria-label="Admin navigation">
        <div className="sidebar-header">
          <Link to="/admin/dashboard" className="sidebar-logo">
            <Logo size={sidebarOpen ? 'sm' : 'sm'} />
          </Link>
          <button
            className="sidebar-collapse-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronRight size={16} style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link to="/admin/profile" className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'Admin'}</span>
              <span className="sidebar-user-role">{user?.role || 'admin'}</span>
            </div>
          </Link>
          <button onClick={handleLogout} className="sidebar-logout" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="admin-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="admin-topbar-right">
            <Link to="/" target="_blank" className="btn btn-outline btn-sm" style={{ gap: 6 }}>
              View Site
            </Link>
            <Link to="/admin/profile" className="topbar-user">
              <div className="topbar-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
            </Link>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
