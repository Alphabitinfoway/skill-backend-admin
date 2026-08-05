import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Globe, 
  ChevronRight, 
  Search, 
  Bell, 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen,
  LayoutDashboard,
  Calendar,
  BookOpen,
  FileText,
  Users,
  ShieldCheck,
  CheckCheck,
  Trash2,
  ExternalLink,
  UserPlus,
  Sparkles,
  Inbox,
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

const Header = ({ collapsed, toggleCollapse, toggleMobileOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  
  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);

  // Quick search routes database
  const navRoutes = [
    { title: 'Dashboard Overview', category: 'Main Navigation', path: '/', icon: LayoutDashboard },
    { title: 'Seminar Events Management', category: 'Events', path: '/seminar-events', icon: Calendar },
    { title: 'Student Registrations', category: 'Events & Signups', path: '/seminars', icon: BookOpen },
    { title: 'Blog Posts Management', category: 'Content', path: '/blogs', icon: FileText },
    { title: 'Meetings & Inquiries Glance', category: 'Content Management', path: '/meetings', icon: Users }
  ];

  // ⌘K / Ctrl+K keyboard shortcut listener & outside click handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setShowNotifications(false);
      }
    };

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter search results
  const filteredSearch = searchQuery.trim() === ''
    ? navRoutes
    : navRoutes.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelectSearchResult = (path) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  // Helper to get read and cleared notification IDs from localStorage
  const getReadNotificationIds = () => {
    try {
      const stored = localStorage.getItem('read_notification_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const getClearedNotificationIds = () => {
    try {
      const stored = localStorage.getItem('cleared_notification_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveReadNotificationIds = (ids) => {
    try {
      const current = getReadNotificationIds();
      const updated = Array.from(new Set([...current, ...ids]));
      localStorage.setItem('read_notification_ids', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save read notification IDs', err);
    }
  };

  const saveClearedNotificationIds = (ids) => {
    try {
      const current = getClearedNotificationIds();
      const updated = Array.from(new Set([...current, ...ids]));
      localStorage.setItem('cleared_notification_ids', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save cleared notification IDs', err);
    }
  };

  // Fetch real notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const [regsRes, eventsRes, meetingsRes] = await Promise.allSettled([
          api.get('/admin/seminars', { params: { limit: 5, page: 1 } }),
          api.get('/admin/seminar-events'),
          api.get('/admin/meetings')
        ]);

        const items = [];

        // 1. Process recent Registrations
        if (regsRes.status === 'fulfilled' && regsRes.value.data?.success) {
          const regs = regsRes.value.data.data || [];
          regs.slice(0, 3).forEach((reg, index) => {
            items.push({
              id: reg._id ? `reg-${reg._id}` : `reg-${index}`,
              type: 'registration',
              icon: UserPlus,
              title: 'New Student Signup',
              description: `${reg.name || 'Student'} registered for batch: ${reg.batchCode || 'Seminar'}`,
              time: reg.createdAt ? new Date(reg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              unread: true,
              link: '/seminars'
            });
          });
        }

        // 2. Process active Seminar Events
        if (eventsRes.status === 'fulfilled' && eventsRes.value.data?.success) {
          const events = eventsRes.value.data.data || [];
          const active = events.find(e => e.isActive);
          if (active) {
            items.push({
              id: active._id ? `event-${active._id}` : 'event-active',
              type: 'event',
              icon: Calendar,
              title: 'Active Seminar Event',
              description: `${active.title} (${active.registeredCount || 0}/${active.totalSeats || 100} seats filled)`,
              time: active.date ? active.date : 'Live',
              unread: true,
              link: '/seminar-events'
            });
          }
        }

        // 3. Process Meetings/Inquiries
        if (meetingsRes.status === 'fulfilled' && meetingsRes.value.data?.success) {
          const meets = meetingsRes.value.data.data || [];
          meets.slice(0, 2).forEach((meet, index) => {
            items.push({
              id: meet._id ? `meet-${meet._id}` : `meet-${index}`,
              type: 'meeting',
              icon: Users,
              title: 'Meeting Request',
              description: `${meet.name || 'User'} requested meeting for topic: ${meet.topic || 'Counseling'}`,
              time: 'New',
              unread: true,
              link: '/meetings'
            });
          });
        }

        // Fallback default notifications if none returned
        if (items.length === 0) {
          items.push(
            {
              id: 'sys-1',
              type: 'system',
              icon: Sparkles,
              title: 'Admin Panel Active',
              description: 'Admin Console backend & API services running smoothly.',
              time: 'Just now',
              unread: true,
              link: '/'
            },
            {
              id: 'sys-2',
              type: 'registration',
              icon: UserPlus,
              title: 'Student Registrations',
              description: 'Check latest seminar registrants in the registrations panel.',
              time: '10m ago',
              unread: true,
              link: '/seminars'
            }
          );
        }

        const readIds = getReadNotificationIds();
        const clearedIds = getClearedNotificationIds();

        // Filter out cleared items and apply stored unread status
        const processedItems = items
          .filter(item => !clearedIds.includes(item.id))
          .map(item => ({
            ...item,
            unread: !readIds.includes(item.id)
          }));

        setNotifications(processedItems);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    saveReadNotificationIds(allIds);
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    const allIds = notifications.map(n => n.id);
    saveClearedNotificationIds(allIds);
    setNotifications([]);
  };

  const handleNotificationClick = (item) => {
    // Mark as read
    saveReadNotificationIds([item.id]);
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
    setShowNotifications(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => n.unread)
    : notifications;

  const getPageDetails = (path) => {
    if (path === '/') {
      return { title: 'Dashboard Overview', icon: LayoutDashboard };
    }
    if (path.startsWith('/seminar-events')) {
      return { title: 'Seminar Events Management', icon: Calendar };
    }
    if (path.startsWith('/seminars')) {
      return { title: 'Student Registrations', icon: BookOpen };
    }
    if (path.startsWith('/blogs')) {
      return { title: 'Blog Posts Management', icon: FileText };
    }
    if (path.startsWith('/meetings')) {
      return { title: 'Meeting Glances', icon: Users };
    }
    return { title: 'Admin Management', icon: ShieldCheck };
  };

  const currentDetails = getPageDetails(location.pathname);
  const RouteIcon = currentDetails.icon;

  return (
    <header className="header">
      {/* Left Section: Toggles & Breadcrumbs */}
      <div className="header-left">
        {/* Mobile menu trigger */}
        <button 
          className="btn-icon mobile-menu-btn" 
          onClick={toggleMobileOpen} 
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        {/* Desktop sidebar collapse trigger */}
        <button 
          className="btn-icon header-collapse-btn" 
          onClick={toggleCollapse} 
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Breadcrumb Trail */}
        <div className="breadcrumb-container">
          <Link to="/" className="breadcrumb-root">
            <span>Admin</span>
          </Link>
          <ChevronRight size={14} />
          <span className="breadcrumb-current">
            <RouteIcon size={14} color="var(--primary)" />
            {currentDetails.title}
          </span>
        </div>
      </div>

      {/* Middle Section: Quick Search Input & Live Results Popover */}
      <div className="search-container" ref={searchRef}>
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input 
            ref={inputRef}
            type="text" 
            className="search-input" 
            placeholder="Quick search admin (⌘K)..." 
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
          />
          {searchQuery ? (
            <button 
              className="search-clear-btn" 
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
            >
              <X size={13} />
            </button>
          ) : (
            <span className="search-shortcut">⌘K</span>
          )}
        </div>

        {/* Quick Search Popover Dropdown */}
        {isSearchOpen && (
          <div className="search-results-dropdown">
            <div className="search-results-header">
              {searchQuery ? `Search Results (${filteredSearch.length})` : 'Quick Page Navigation'}
            </div>
            <div className="search-results-list">
              {filteredSearch.length === 0 ? (
                <div className="notification-empty" style={{ padding: '20px' }}>
                  <span>No matching pages or tools found</span>
                </div>
              ) : (
                filteredSearch.map((item, idx) => {
                  const ItemIcon = item.icon || Search;
                  return (
                    <div 
                      key={idx} 
                      className="search-result-item"
                      onClick={() => handleSelectSearchResult(item.path)}
                    >
                      <div className="search-result-icon">
                        <ItemIcon size={16} />
                      </div>
                      <div className="search-result-info">
                        <div className="search-result-title">{item.title}</div>
                        <div className="search-result-category">{item.category}</div>
                      </div>
                      <ChevronRight size={14} color="var(--text-muted)" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Notifications, Website Link & Profile */}
      <div className="header-right">

        {/* Real Interactive Notifications Container */}
        <div className="notification-container" ref={notificationRef}>
          <button 
            className="notification-btn" 
            onClick={() => setShowNotifications(prev => !prev)}
            title="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <div className="notification-dropdown-title">
                  <Bell size={16} color="var(--primary)" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="notification-unread-count">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button className="notification-mark-btn" onClick={markAllAsRead}>
                    <CheckCheck size={14} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="notification-filter-tabs">
                <button 
                  className={`notification-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All ({notifications.length})
                </button>
                <button 
                  className={`notification-tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
                  onClick={() => setActiveTab('unread')}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notification List */}
              <div className="notification-list">
                {filteredNotifications.length === 0 ? (
                  <div className="notification-empty">
                    <Inbox size={28} strokeWidth={1.5} color="var(--secondary)" />
                    <span>No notifications to show</span>
                  </div>
                ) : (
                  filteredNotifications.map((item) => {
                    const ItemIcon = item.icon || Bell;
                    return (
                      <div 
                        key={item.id}
                        className={`notification-item ${item.unread ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(item)}
                      >
                        <div className={`notification-icon-wrapper ${item.type}`}>
                          <ItemIcon size={16} />
                        </div>
                        <div className="notification-item-content">
                          <div className="notification-item-header">
                            <span className="notification-item-title">{item.title}</span>
                            <span className="notification-item-time">{item.time}</span>
                          </div>
                          <p className="notification-item-desc">{item.description}</p>
                        </div>
                        {item.unread && <span className="notification-unread-dot"></span>}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Notification Dropdown Footer */}
              <div className="notification-dropdown-footer">
                <button 
                  className="notification-footer-link"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/seminars');
                  }}
                >
                  <span>View Student Registrations</span>
                  <ExternalLink size={12} />
                </button>
                {notifications.length > 0 && (
                  <button className="notification-footer-link" onClick={clearAll} style={{ color: 'var(--secondary)' }}>
                    <Trash2 size={12} />
                    <span>Clear all</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Global Refresh Data Button */}
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-secondary" 
          style={{ padding: '7px 14px', fontSize: '12.5px', gap: '6px' }}
          title="Reload page to fetch latest live data"
        >
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>

        {/* Public Website Button */}
        <a 
          href="https://alphabitskill.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-secondary" 
          style={{ padding: '7px 14px', fontSize: '12.5px', gap: '6px' }}
          title="Open main public website in new tab"
        >
          <Globe size={14} />
          <span>View Site</span>
        </a>

        <div className="header-divider"></div>

        {/* Profile Card */}
        <div className="header-user-badge">
          <div className="header-user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.2' }}>
              {user?.name || 'Admin User'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {user?.email || 'admin@alphabitskill.com'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

