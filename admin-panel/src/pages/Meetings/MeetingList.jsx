import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Calendar, Video, Filter, X, Layers, Sparkles, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

const getWatchableUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
  }
  return trimmed;
};

const MeetingList = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedSlugFilter, setSelectedSlugFilter] = useState('all');

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/meetings').catch(() => ({ data: { data: [] } }));
      setMeetings(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting glance?')) {
      try {
        await api.delete(`/admin/meetings/${id}`);
        setMeetings(meetings.filter(m => m.id !== id && m._id !== id));
      } catch (err) {
        alert('Failed to delete meeting');
      }
    }
  };

  // Get unique list of skill slugs from meetings
  const uniqueSlugs = Array.from(
    new Set(meetings.map(m => m.skillSlug || 'all'))
  ).filter(Boolean);

  const filteredMeetings = meetings.filter(m => {
    const term = debouncedSearchTerm.trim().toLowerCase();

    const matchesSearch = !term || 
      (m.title || '').toLowerCase().includes(term) ||
      (m.subtitle || '').toLowerCase().includes(term) ||
      (m.skillSlug || '').toLowerCase().includes(term);

    const mSlug = (m.skillSlug || 'all').trim().toLowerCase();
    const filterSlug = selectedSlugFilter.trim().toLowerCase();
    const matchesSlug = filterSlug === 'all' || mSlug === filterSlug;

    return matchesSearch && matchesSlug;
  });

  const isFiltered = searchTerm.trim() !== '' || selectedSlugFilter !== 'all';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* 🌟 Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Meetings Glance
            </h1>
            <span style={{ 
              backgroundColor: 'rgba(79, 70, 229, 0.1)', 
              color: '#4f46e5', 
              fontSize: '12px', 
              fontWeight: '700',
              padding: '2px 10px',
              borderRadius: '12px',
              border: '1px solid rgba(79, 70, 229, 0.2)'
            }}>
              {meetings.length} Total
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            Manage weekly live meeting glances, media thumbnails, and target skill page slugs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchMeetings} 
            disabled={loading}
            className="btn btn-secondary" 
            style={{ padding: '11px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
            title="Refresh Meetings Data"
          >
            <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>
          <Link to="/meetings/create" className="btn btn-primary" style={{ padding: '11px 20px', borderRadius: '10px' }}>
            <Plus size={18} />
            Create Meeting Glance
          </Link>
        </div>
      </div>

      {/* 🔍 Search & Slug Filter Card */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search meetings by title, subtitle, or slug..." 
              style={{ width: '100%', paddingLeft: '42px', paddingRight: searchTerm ? '36px' : '14px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '50%'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Slug Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '240px' }}>
            <Filter size={18} style={{ color: 'var(--text-muted)' }} />
            <select
              className="input-field"
              style={{ padding: '10px 14px', fontSize: '14px', cursor: 'pointer', flex: 1 }}
              value={selectedSlugFilter}
              onChange={(e) => setSelectedSlugFilter(e.target.value)}
            >
              <option value="all">All Slugs (Show All)</option>
              {uniqueSlugs.map(slug => (
                <option key={slug} value={slug}>
                  {slug === 'all' ? 'All Pages (Global)' : slug}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedSlugFilter('all');
              }}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '600',
                padding: '9px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <X size={14} /> Clear Filter
            </button>
          )}
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}

      {/* 📊 Meetings Data Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Meeting Info</th>
              <th style={{ width: '20%' }}>Target Page</th>
              <th style={{ width: '20%' }}>Images / Media</th>
              <th style={{ width: '10%' }}>Date Created</th>
              <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Loading meetings...</div>
                </td>
              </tr>
            ) : filteredMeetings.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <Calendar size={48} style={{ opacity: 0.2, margin: '0 auto' }} />
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>No meeting glances found</p>
                  <p style={{ fontSize: '14px', marginBottom: '16px' }}>Try adjusting your search query or slug filter.</p>
                  {isFiltered && (
                    <button 
                      onClick={() => { setSearchTerm(''); setSelectedSlugFilter('all'); }}
                      className="btn btn-secondary"
                      style={{ fontSize: '13px' }}
                    >
                      Reset Filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredMeetings.map((meeting) => (
                <tr key={meeting._id || meeting.id}>
                  {/* Meeting Info (Title & Subtitle) */}
                  <td>
                    <div style={{ paddingRight: '12px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14.5px', marginBottom: '4px' }}>
                        {meeting.title}
                      </div>
                      <div style={{ 
                        fontSize: '12.5px', 
                        color: 'var(--text-muted)', 
                        lineHeight: '1.4',
                        maxWidth: '380px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }} title={meeting.subtitle}>
                        {meeting.subtitle}
                      </div>
                    </div>
                  </td>

                  {/* Target Page (Skill Slug) */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px', 
                      borderRadius: '16px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      backgroundColor: meeting.skillSlug && meeting.skillSlug !== 'all' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(100, 116, 139, 0.08)',
                      color: meeting.skillSlug && meeting.skillSlug !== 'all' ? '#2563eb' : '#64748b',
                      border: meeting.skillSlug && meeting.skillSlug !== 'all' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(100, 116, 139, 0.2)'
                    }}>
                      <Layers size={13} />
                      {meeting.skillSlug && meeting.skillSlug !== 'all' ? meeting.skillSlug : 'All Pages (Global)'}
                    </span>
                  </td>

                  {/* Images & Video Media */}
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {/* Image 1 Preview */}
                      {meeting.image1 && meeting.image1 !== 'no-photo.jpg' ? (
                        <div style={{ 
                          width: '44px', 
                          height: '44px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          backgroundColor: '#f1f5f9',
                          border: '1px solid var(--border-color)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          flexShrink: 0
                        }}>
                          <img 
                            src={meeting.image1.startsWith('http') ? meeting.image1 : `http://localhost:5000/${meeting.image1}`} 
                            alt="Img 1" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                          <ImageIcon size={16} />
                        </div>
                      )}

                      {/* Image 2 Preview */}
                      {meeting.image2 && meeting.image2 !== 'no-photo.jpg' ? (
                        <div style={{ 
                          width: '44px', 
                          height: '44px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          backgroundColor: '#f1f5f9',
                          border: '1px solid var(--border-color)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          flexShrink: 0
                        }}>
                          <img 
                            src={meeting.image2.startsWith('http') ? meeting.image2 : `http://localhost:5000/${meeting.image2}`} 
                            alt="Img 2" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                          <ImageIcon size={16} />
                        </div>
                      )}

                      {/* Video Watch Button */}
                      {meeting.videoUrl ? (
                        <a 
                          href={getWatchableUrl(meeting.videoUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            height: '44px',
                            padding: '0 12px',
                            borderRadius: '8px', 
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.2) 100%)', 
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#6366f1',
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '5px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '12px',
                            whiteSpace: 'nowrap'
                          }} 
                          title="Watch video clip"
                        >
                          <Video size={16} style={{ color: '#6366f1' }} />
                          <span>Watch</span>
                        </a>
                      ) : null}
                    </div>
                  </td>

                  {/* Date Created */}
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {new Date(meeting.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <Link 
                        to={`/meetings/edit/${meeting._id || meeting.id}`} 
                        className="btn btn-secondary" 
                        style={{ padding: '8px', background: 'transparent' }} 
                        title="Edit Meeting Glance"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(meeting._id || meeting.id)} 
                        className="btn btn-secondary" 
                        style={{ padding: '8px', color: 'var(--danger)', background: 'transparent', borderColor: 'transparent' }}
                        title="Delete Meeting Glance"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MeetingList;
