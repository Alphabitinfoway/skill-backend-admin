import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  Users, 
  BookOpen, 
  Calendar,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ collapsed, mobileOpen, closeMobile }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navGroups = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard }
      ]
    },
    {
      title: 'EVENTS & SIGNUPS',
      items: [
        { name: 'Seminar Events', path: '/seminar-events', icon: Calendar },
        { name: 'Student Registrations', path: '/seminars', icon: BookOpen }
      ]
    },
    {
      title: 'CONTENT MANAGEMENT',
      items: [
        { name: 'Blog Posts', path: '/blogs', icon: FileText },
        { name: 'Syllabus / PDFs', path: '/syllabus', icon: BookOpen },
        { name: 'Meetings Glance', path: '/meetings', icon: Users }
      ]
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-logo">
        <Link to="/" className="brand-wrapper">
          <div className="brand-icon-box">
            <img 
              src="https://res.cloudinary.com/dn4blj1nq/image/upload/v1785143152/Icon.svg" 
              alt="Alphabit Skill Logo" 
            />
          </div>
          <div className="brand-text">
            <span className="brand-title">Alphabit Skill</span>
            <span className="brand-subtitle">Admin Console</span>
          </div>
        </Link>

        {/* Mobile Close Button */}
        {mobileOpen && (
          <button 
            className="sidebar-toggle-btn" 
            onClick={closeMobile} 
            title="Close navigation drawer"
            style={{ display: 'flex' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="nav-group">
            <div className="nav-group-title">
              {collapsed ? group.title.substring(0, 3) : group.title}
            </div>
            <div className="nav-group-items">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                    <Link 
                    key={item.path}
                    to={item.path} 
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.name : undefined}
                  >
                    <div className="nav-icon">
                      <Icon size={18} />
                    </div>
                    <span className="nav-label">{item.name}</span>
                    {isActive && (
                      <ChevronRight size={14} className="nav-chevron" style={{ opacity: 0.8 }} />
                    )}

                    {/* Floating Tooltip in Collapsed mode */}
                    {collapsed && (
                      <div className="sidebar-tooltip">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Streamlined User Profile & Logout Footer */}
      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="avatar-wrapper">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="status-dot" title="Online"></span>
          </div>

          {!collapsed && (
            <div className="user-info">
              <span className="user-name">{user?.name || 'Admin'}</span>
              <span className="user-role">Administrator</span>
            </div>
          )}

          <button 
            onClick={logout} 
            className="footer-logout-icon-btn" 
            title="Log out of admin panel"
          >
            <LogOut size={16} />
          </button>

          {collapsed && (
            <div className="sidebar-tooltip">
              Logout ({user?.name || 'Admin'})
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
