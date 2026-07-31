import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Calendar, Video } from 'lucide-react';
import api from '../../api/axios';

const MeetingList = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await api.delete(`/admin/meetings/${id}`);
        setMeetings(meetings.filter(m => m.id !== id && m._id !== id));
      } catch (err) {
        alert('Failed to delete meeting');
      }
    }
  };

  const filteredMeetings = meetings.filter(m => 
    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Meetings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage and organize your weekly meeting glances.</p>
        </div>
        <Link to="/meetings/create" className="btn btn-primary" style={{ padding: '12px 20px' }}>
          <Plus size={18} />
          Create Meeting
        </Link>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search meetings..." 
            style={{ width: '100%', paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Meeting Info</th>
              <th>Target Page</th>
              <th>Images / Media</th>
              <th>Date Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
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
                  <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '4px' }}>No meetings found</p>
                  <p style={{ fontSize: '14px' }}>Try adjusting your search or create a new meeting glance.</p>
                </td>
              </tr>
            ) : (
              filteredMeetings.map((meeting) => (
                <tr key={meeting._id || meeting.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>{meeting.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{meeting.subtitle}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      backgroundColor: meeting.skillSlug && meeting.skillSlug !== 'all' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                      color: meeting.skillSlug && meeting.skillSlug !== 'all' ? '#2563eb' : '#6b7280'
                    }}>
                      {meeting.skillSlug && meeting.skillSlug !== 'all' ? meeting.skillSlug : 'All Pages (Global)'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {/* Image 1 Preview */}
                      {meeting.image1 && meeting.image1 !== 'no-photo.jpg' ? (
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--bg-main)' }}>
                          <img src={meeting.image1.startsWith('http') ? meeting.image1 : `http://localhost:5000/${meeting.image1}`} alt="Image 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <ImageIcon size={18} />
                        </div>
                      )}
                      {/* Image 2 Preview */}
                      {meeting.image2 && meeting.image2 !== 'no-photo.jpg' ? (
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--bg-main)' }}>
                          <img src={meeting.image2.startsWith('http') ? meeting.image2 : `http://localhost:5000/${meeting.image2}`} alt="Image 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <ImageIcon size={18} />
                        </div>
                      )}
                      {/* Video Link Preview */}
                      {meeting.videoUrl ? (
                        <a 
                          href={meeting.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            height: '48px',
                            padding: '0 12px',
                            borderRadius: 'var(--radius-sm)', 
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(79, 70, 229, 0.2) 100%)', 
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#6366f1',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '12px',
                            transition: 'all 0.2s ease'
                          }} 
                          title="Click to open video"
                        >
                          <Video size={18} style={{ color: '#6366f1' }} />
                          <span>Watch</span>
                        </a>
                      ) : null}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    {new Date(meeting.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <Link to={`/meetings/edit/${meeting._id || meeting.id}`} className="btn btn-secondary" style={{ padding: '8px', background: 'transparent' }} title="Edit Meeting">
                        <Edit2 size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(meeting._id || meeting.id)} 
                        className="btn btn-secondary" 
                        style={{ padding: '8px', color: 'var(--danger)', background: 'transparent', borderColor: 'transparent' }}
                        title="Delete Meeting"
                      >
                        <Trash2 size={18} />
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
