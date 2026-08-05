import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, Search, Download, Calendar, Users, Award, BookOpen, AlertCircle, X, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

const SeminarList = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering, Search and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Statistics and Batches list
  const [stats, setStats] = useState(null);
  const [batches, setBatches] = useState([]);

  // Ref to hold debounce timer
  const debounceTimerRef = useRef(null);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/seminars/stats');
      if (response.data?.success) {
        setStats(response.data.data);
        if (response.data.data?.byBatch) {
          setBatches(Object.keys(response.data.data.byBatch));
        }
      }
    } catch (err) {
      console.error('Failed to fetch statistics', err);
    }
  };

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/seminars', {
        params: {
          page,
          limit,
          status: statusFilter,
          batch: batchFilter,
          search: activeSearch
        }
      });
      if (response.data?.success) {
        setRegistrations(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, batchFilter, activeSearch]);

  // Debounce search input typing (300ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setActiveSearch((prev) => {
        if (prev !== searchTerm) {
          setPage(1);
          return searchTerm;
        }
        return prev;
      });
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch registrations when filters, active search query, or page change
  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Load stats once on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Handle immediate manual form submission for search query
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setPage(1);
    setActiveSearch(searchTerm);
  };

  // Clear search field
  const handleClearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchTerm('');
    setActiveSearch('');
    setPage(1);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.put(`/admin/seminars/${id}`, { status: newStatus });
      if (response.data?.success) {
        setRegistrations(registrations.map(reg => 
          (reg._id === id || reg.id === id) ? { ...reg, status: newStatus } : reg
        ));
        // Refresh stats to update counter cards
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this registration?')) {
      try {
        await api.delete(`/admin/seminars/${id}`);
        // Refresh current list and stats
        fetchRegistrations();
        fetchStats();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete registration');
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/seminars/export', {
        params: {
          status: statusFilter,
          batch: batchFilter,
          search: activeSearch
        },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Determine file name
      const contentDisposition = response.headers['content-disposition'];
      let filename = `seminar_registrations_${Date.now()}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV registrations file.');
    }
  };

  const getStatusBadgeStyle = (status) => {
    const base = {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-block'
    };
    switch (status) {
      case 'attended':
        return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'no-show':
        return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'cancelled':
        return { ...base, backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'registered':
      default:
        return { ...base, backgroundColor: '#e0f2fe', color: '#075985' };
    }
  };

  return (
    <div>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Seminar Registrations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Monitor and manage registrations for educational seminars.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => { fetchRegistrations(); fetchStats(); }} 
            disabled={loading}
            className="btn btn-secondary" 
            style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
            title="Refresh Registrations Data"
          >
            <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>
          <button onClick={handleExportCSV} className="btn btn-primary" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <Users size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Registered</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.total || 0}</span>
            </div>
          </div>
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669' }}>
              <Calendar size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Registered Today</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{stats.todayCount || 0}</span>
            </div>
          </div>
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Award size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Attended</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{stats.byStatus?.attended || 0}</span>
            </div>
          </div>
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#dc2626' }}>
              <AlertCircle size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No-Show / Cancelled</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                {(stats.byStatus?.['no-show'] || 0) + (stats.byStatus?.cancelled || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by name, email, phone, college, course..." 
              style={{ width: '100%', paddingLeft: '40px', paddingRight: searchTerm ? '36px' : '12px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
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
                  padding: '2px'
                }}
                title="Clear Search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Batch Filter Dropdown */}
          <div style={{ minWidth: '160px' }}>
            <select
              value={batchFilter}
              onChange={(e) => { setBatchFilter(e.target.value); setPage(1); }}
              className="input-field"
              style={{ width: '100%' }}
            >
              <option value="">All Batches</option>
              {batches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ minWidth: '160px' }}>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input-field"
              style={{ width: '100%' }}
            >
              <option value="">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="attended">Attended</option>
              <option value="no-show">No-Show</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </form>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontWeight: '500' }}>{error}</div>}

      {/* Main Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Contact Info</th>
              <th>College & Course</th>
              <th>City & Source</th>
              <th>Seminar Batch</th>
              <th>Status</th>
              <th>Registered On</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Loading registrations...</div>
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <BookOpen size={48} style={{ opacity: 0.2, margin: '0 auto' }} />
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '4px' }}>No registrations found</p>
                  <p style={{ fontSize: '14px' }}>Try adjusting your filters or search keywords.</p>
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg._id || reg.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{reg.name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>{reg.phone}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{reg.email}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>{reg.course}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{reg.college}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>{reg.city}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Source: {reg.source}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{reg.seminarBatch}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={getStatusBadgeStyle(reg.status)}>{reg.status}</span>
                      <select 
                        value={reg.status} 
                        onChange={(e) => handleStatusChange(reg._id || reg.id, e.target.value)}
                        className="input-field" 
                        style={{ padding: '2px 4px', fontSize: '11px', height: 'auto', width: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}
                      >
                        <option value="registered">Registered</option>
                        <option value="attended">Attended</option>
                        <option value="no-show">No-Show</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {new Date(reg.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleDelete(reg._id || reg.id)} 
                        className="btn btn-secondary" 
                        style={{ padding: '8px', color: 'var(--danger)', background: 'transparent', borderColor: 'transparent' }}
                        title="Delete Registration"
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

      {/* Pagination Controls */}
      {!loading && registrations.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Showing {registrations.length} of {total} registrations
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setPage(p => Math.max(p - 1, 1))} 
              disabled={page === 1}
              style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', fontWeight: '500' }}>
              Page {page} of {totalPages || 1}
            </span>
            <button 
              className="btn btn-secondary" 
              onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
              disabled={page >= totalPages}
              style={{ opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeminarList;
