import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Award, 
  BookOpen, 
  Video, 
  ArrowRight, 
  TrendingUp,
  Calendar,
  MapPin,
  Sparkles,
  AlertCircle,
  Edit,
  RefreshCw,
  Clock,
  Globe,
  Zap,
  PlusCircle,
  CheckCircle2,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import api from '../api/axios';

const Dashboard = () => {
  const [seminarStats, setSeminarStats] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [seminarEvents, setSeminarEvents] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, regsRes, eventsRes, blogsRes, meetingsRes] = await Promise.allSettled([
          api.get('/admin/seminars/stats'),
          api.get('/admin/seminars', { params: { limit: 5, page: 1 } }),
          api.get('/admin/seminar-events'),
          api.get('/admin/blogs'),
          api.get('/admin/meetings')
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
          setSeminarStats(statsRes.value.data.data);
        }

        if (regsRes.status === 'fulfilled' && regsRes.value.data?.success) {
          setRecentRegistrations(regsRes.value.data.data || []);
        }

        if (eventsRes.status === 'fulfilled' && eventsRes.value.data?.success) {
          setSeminarEvents(eventsRes.value.data.data || []);
        }

        if (blogsRes.status === 'fulfilled' && blogsRes.value.data?.success) {
          setBlogs(blogsRes.value.data.data || []);
        }

        if (meetingsRes.status === 'fulfilled' && meetingsRes.value.data?.success) {
          setMeetings(meetingsRes.value.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalRegistered = seminarStats?.total || 0;
  const todayCount = seminarStats?.todayCount || 0;
  const attendedCount = seminarStats?.byStatus?.attended || 0;
  const noShowCount = (seminarStats?.byStatus?.['no-show'] || 0) + (seminarStats?.byStatus?.cancelled || 0);

  const activeEvent = seminarEvents.find(e => e.isActive);
  const occupancyPercent = activeEvent 
    ? Math.min(100, Math.round(((activeEvent.registeredCount || 0) / (activeEvent.totalSeats || 100)) * 100))
    : 0;

  // Avatar helper
  const getAvatarColor = (name) => {
    const gradients = [
      'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
    ];
    if (!name) return gradients[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return gradients[Math.abs(hash) % gradients.length];
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getStatusBadgeStyle = (status) => {
    const base = {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11.5px',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    };
    switch (status) {
      case 'attended':
        return { ...base, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.25)' };
      case 'no-show':
        return { ...base, backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.25)' };
      case 'cancelled':
        return { ...base, backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#b91c1c', border: '1px solid rgba(239, 68, 68, 0.25)' };
      case 'registered':
      default:
        return { ...base, backgroundColor: 'rgba(79, 70, 229, 0.12)', color: '#4338ca', border: '1px solid rgba(79, 70, 229, 0.25)' };
    }
  };

  const metrics = [
    {
      title: 'Total Registrations',
      value: loading ? '...' : totalRegistered,
      badge: todayCount > 0 ? `+${todayCount} Today` : 'Active',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      badgeColor: '#059669',
      icon: Users,
      color: '#4f46e5',
      bgColor: '#e0e7ff',
      link: '/seminars'
    },
    {
      title: 'Attended Students',
      value: loading ? '...' : attendedCount,
      badge: totalRegistered > 0 ? `${Math.round((attendedCount / totalRegistered) * 100)}% Turnout` : '0%',
      badgeBg: 'rgba(37, 99, 235, 0.12)',
      badgeColor: '#2563eb',
      icon: Award,
      color: '#059669',
      bgColor: '#d1fae5',
      link: '/seminars'
    },
    {
      title: 'Seminar Events',
      value: loading ? '...' : seminarEvents.length,
      badge: activeEvent ? `Live: ${activeEvent.batchId}` : 'No Active',
      badgeBg: activeEvent ? 'rgba(124, 58, 237, 0.12)' : 'rgba(100, 116, 139, 0.12)',
      badgeColor: activeEvent ? '#7c3aed' : '#64748b',
      icon: Calendar,
      color: '#7c3aed',
      bgColor: '#f3e8ff',
      link: '/seminar-events'
    },
    {
      title: 'Published Blogs',
      value: loading ? '...' : blogs.length,
      badge: 'Articles',
      badgeBg: 'rgba(2, 132, 199, 0.12)',
      badgeColor: '#0284c7',
      icon: FileText,
      color: '#0284c7',
      bgColor: '#e0f2fe',
      link: '/blogs'
    },
    {
      title: 'Meeting Glances',
      value: loading ? '...' : meetings.length,
      badge: 'Events',
      badgeBg: 'rgba(217, 119, 6, 0.12)',
      badgeColor: '#d97706',
      icon: Video,
      color: '#d97706',
      bgColor: '#fef3c7',
      link: '/meetings'
    }
  ];

  const recentBlogsList = [...blogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Dashboard Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Welcome back! Monitor live seminar events, student signups, blogs, and meetings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/seminar-events/create" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} />
            Seminar Events
          </Link>
          <Link to="/seminars" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} />
            Student Registrations
          </Link>
        </div>
      </div>

      {/* 1. Interactive Active Seminar Event Hero Card */}
      <div style={{ 
        marginBottom: '28px', 
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: activeEvent ? '0 20px 30px -8px rgba(79, 70, 229, 0.3)' : 'var(--shadow-md)',
        background: activeEvent 
          ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)' 
          : 'var(--bg-card)',
        border: activeEvent ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid var(--border-color)',
        color: activeEvent ? '#ffffff' : 'var(--text-main)',
        position: 'relative'
      }}>
        {activeEvent ? (
          <div style={{ padding: '28px' }}>
            {/* Top Bar: Live Tag & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                  border: '1px solid rgba(52, 211, 153, 0.5)',
                  color: '#6ee7b7', 
                  padding: '5px 14px', 
                  borderRadius: '20px', 
                  fontSize: '12px', 
                  fontWeight: '700',
                  letterSpacing: '0.04em'
                }}>
                  <span className="live-pulse-dot"></span>
                  LIVE ON LANDING PAGE
                </span>

                <span style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.12)', 
                  padding: '5px 12px', 
                  borderRadius: '20px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: '#e0e7ff',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                  Batch: <strong>{activeEvent.batchId}</strong>
                </span>

                <span style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.12)', 
                  padding: '5px 12px', 
                  borderRadius: '20px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: '#e0e7ff',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                  Mode: <strong>{activeEvent.mode || 'Offline'}</strong>
                </span>
              </div>

              <div>
                <Link 
                  to="/seminar-events" 
                  style={{ 
                    color: '#ffffff', 
                    fontSize: '13px', 
                    textDecoration: 'none', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'var(--transition)'
                  }}
                >
                  <RefreshCw size={14} /> Switch Active Event
                </Link>
              </div>
            </div>

            {/* Event Details & Occupancy Widget */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '14px', lineHeight: '1.3', color: '#ffffff' }}>
                  {activeEvent.topic}
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#e0e7ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={16} style={{ color: '#818cf8' }} />
                    <span><strong>Date:</strong> {new Date(activeEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={16} style={{ color: '#818cf8' }} />
                    <span><strong>Time:</strong> {activeEvent.startTime} – {activeEvent.endTime}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={16} style={{ color: '#818cf8' }} />
                    <span><strong>Venue:</strong> {activeEvent.venue}</span>
                  </div>

                  {activeEvent.venueMapLink && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                      <Globe size={16} style={{ color: '#818cf8' }} />
                      <a href={activeEvent.venueMapLink} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', textDecoration: 'underline', fontWeight: '500' }}>
                        View Location Map →
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Box: Live Seat Progress */}
              <div style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.25)', 
                padding: '22px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#e0e7ff' }}>Live Seat Occupancy</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#34d399' }}>{occupancyPercent}% Filled</span>
                  </div>

                  {/* Animated Seat Progress Bar */}
                  <div style={{ height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${occupancyPercent}%`, 
                      background: 'linear-gradient(90deg, #34d399 0%, #10b981 100%)',
                      borderRadius: '5px',
                      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#c7d2fe' }}>
                    <span>Registered: <strong style={{ color: '#ffffff' }}>{activeEvent.registeredCount || 0}</strong></span>
                    <span>Total Seats: <strong style={{ color: '#ffffff' }}>{activeEvent.totalSeats}</strong></span>
                    <span>Available: <strong style={{ color: '#6ee7b7' }}>{activeEvent.seatsLeft !== undefined ? activeEvent.seatsLeft : activeEvent.totalSeats}</strong></span>
                  </div>
                </div>

                {/* Quick Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link 
                    to={`/seminar-events/edit/${activeEvent._id || activeEvent.id}`} 
                    className="btn" 
                    style={{ 
                      backgroundColor: '#ffffff', 
                      color: '#4338ca', 
                      fontWeight: '700', 
                      flex: 1, 
                      justifyContent: 'center',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <Edit size={15} /> Edit Event
                  </Link>

                  <Link 
                    to={`/seminars?batch=${encodeURIComponent(activeEvent.batchId)}`} 
                    className="btn" 
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.18)', 
                      color: '#ffffff', 
                      fontWeight: '600', 
                      flex: 1, 
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <Users size={15} /> View Signups ({activeEvent.registeredCount || 0})
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '2px', color: 'var(--text-main)' }}>No Active Seminar Event Configured</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Configure an active seminar event so topic, date, venue, and seat availability appear on the public registration card.</p>
              </div>
            </div>
            <Link to="/seminar-events/create" className="btn btn-primary" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} />
              Create Seminar Event
            </Link>
          </div>
        )}
      </div>

      {/* 2. Modern Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Link key={index} to={metric.link} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="dash-kpi-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: '12px', 
                    backgroundColor: metric.bgColor, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: metric.color,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                  }}>
                    <Icon size={22} />
                  </div>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    padding: '4px 10px', 
                    borderRadius: '14px', 
                    backgroundColor: metric.badgeBg, 
                    color: metric.badgeColor 
                  }}>
                    {metric.badge}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>
                    {metric.title}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {metric.value}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Quick Action Shortcuts Section */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="var(--primary)" />
          Quick Management Launchpad
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <Link to="/seminar-events" className="quick-action-btn">
            <div className="quick-action-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
              <Calendar size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div>Manage Events</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>Batches & Venues</div>
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </Link>

          <Link to="/seminars" className="quick-action-btn">
            <div className="quick-action-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
              <Users size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div>Student List</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>Verify Signups</div>
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </Link>

          <Link to="/blogs" className="quick-action-btn">
            <div className="quick-action-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <FileText size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div>Blog Articles</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>Publish & Edit</div>
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </Link>

          <Link to="/meetings" className="quick-action-btn">
            <div className="quick-action-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Video size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div>Meeting Glances</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>Session Clips</div>
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" />
          </Link>
        </div>
      </div>

      {/* 4. Main Content Layout - 2 Columns */}
      <div className="dashboard-grid-layout">
        
        {/* Left Column: Recent Student Registrations */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px', color: 'var(--text-main)' }}>Recent Student Registrations</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Latest students registered for upcoming skill seminars</p>
            </div>
            <Link to="/seminars" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View All Registrations <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>Loading recent registrations...</p>
          ) : recentRegistrations.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Users size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p style={{ fontSize: '14px' }}>No registrations received yet.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ boxShadow: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Contact Info</th>
                    <th>Seminar Batch</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRegistrations.map((reg) => (
                    <tr key={reg._id || reg.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="avatar-circle" style={{ background: getAvatarColor(reg.name) }}>
                            {getInitials(reg.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px', whiteSpace: 'nowrap' }}>{reg.name}</div>
                            {reg.college && (
                              <div 
                                style={{ 
                                  fontSize: '11px', 
                                  color: 'var(--text-muted)', 
                                  maxWidth: '200px', 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap' 
                                }}
                                title={reg.college}
                              >
                                {reg.college}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{reg.phone}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{reg.email}</div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', color: '#334155', display: 'inline-block', whiteSpace: 'nowrap' }}>
                          {reg.seminarBatch}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span style={getStatusBadgeStyle(reg.status)}>
                          {reg.status === 'attended' && <CheckCircle2 size={12} />}
                          {reg.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', whiteSpace: 'nowrap' }}>
                        {new Date(reg.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Status Breakdown & Recent Blogs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* Seminar Status Breakdown */}
          <div className="card" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              <TrendingUp size={18} color="var(--primary)" />
              Registration Turnout
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Registered</span>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{seminarStats?.byStatus?.registered || 0}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${totalRegistered > 0 ? ((seminarStats?.byStatus?.registered || 0) / totalRegistered) * 100 : 0}%`, 
                    backgroundColor: '#4f46e5',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease' 
                  }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Attended</span>
                  <span style={{ fontWeight: '700', color: '#059669' }}>{attendedCount}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${totalRegistered > 0 ? (attendedCount / totalRegistered) * 100 : 0}%`, 
                    backgroundColor: '#059669',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease' 
                  }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>No-Show / Cancelled</span>
                  <span style={{ fontWeight: '700', color: '#dc2626' }}>{noShowCount}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${totalRegistered > 0 ? (noShowCount / totalRegistered) * 100 : 0}%`, 
                    backgroundColor: '#dc2626',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease' 
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Blogs */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                <FileText size={18} color="var(--primary)" />
                Recent Articles
              </h3>
              <Link to="/blogs" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Manage All →
              </Link>
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading blogs...</p>
            ) : recentBlogsList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No blogs available.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentBlogsList.map((blog) => (
                  <div key={blog._id || blog.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px', color: 'var(--text-main)' }}>
                      {blog.title}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '500' }}>
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
