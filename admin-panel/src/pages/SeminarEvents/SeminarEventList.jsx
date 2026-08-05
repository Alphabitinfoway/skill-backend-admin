import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Calendar, MapPin, CheckCircle2, Circle, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

const SeminarEventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/seminar-events');
      if (response.data?.success) {
        setEvents(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch seminar events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this seminar event?')) {
      try {
        await api.delete(`/admin/seminar-events/${id}`);
        setEvents(events.filter(e => e.id !== id && e._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete seminar event');
      }
    }
  };

  const handleActivate = async (id) => {
    try {
      const response = await api.patch(`/admin/seminar-events/${id}/activate`);
      if (response.data?.success) {
        // Refresh list to update all active statuses
        fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate seminar event');
    }
  };

  const filteredEvents = events.filter(e => 
    e.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.batchId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venue?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Seminar Events</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Configure seminar topics, dates, venues, and set active event details.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchEvents} 
            disabled={loading}
            className="btn btn-secondary" 
            style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
            title="Refresh Seminar Events Data"
          >
            <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>
          <Link to="/seminar-events/create" className="btn btn-primary" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            Create Seminar Event
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search events by topic, batch, venue..." 
            style={{ width: '100%', paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontWeight: '500' }}>{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Topic & Batch</th>
              <th>Date & Time</th>
              <th>Venue & Mode</th>
              <th>Seats & Signups</th>
              <th>Active Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Loading seminar events...</div>
                </td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <Calendar size={48} style={{ opacity: 0.2, margin: '0 auto' }} />
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '4px' }}>No seminar events found</p>
                  <p style={{ fontSize: '14px' }}>Create your first seminar event to showcase on the registration page.</p>
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event._id || event.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px' }}>{event.topic}</div>
                      <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '500' }}>
                        Batch ID: <span style={{ fontFamily: 'monospace' }}>{event.batchId}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {event.startTime} - {event.endTime}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                      {event.venue}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Mode: <span style={{ fontWeight: '500' }}>{event.mode || 'Offline'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                      {event.registeredCount || 0} / {event.totalSeats}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {event.seatsLeft !== undefined ? `${event.seatsLeft} seats left` : ''}
                    </div>
                  </td>
                  <td>
                    {event.isActive ? (
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        backgroundColor: '#d1fae5', 
                        color: '#065f46',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircle2 size={14} /> Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivate(event._id || event.id)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Set as current active seminar on landing page"
                      >
                        <Circle size={14} /> Set Active
                      </button>
                    )}
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <Link to={`/seminar-events/edit/${event._id || event.id}`} className="btn btn-secondary" style={{ padding: '8px', background: 'transparent' }} title="Edit Seminar Event">
                        <Edit2 size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(event._id || event.id)} 
                        className="btn btn-secondary" 
                        style={{ padding: '8px', color: 'var(--danger)', background: 'transparent', borderColor: 'transparent' }}
                        title="Delete Seminar Event"
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

export default SeminarEventList;
