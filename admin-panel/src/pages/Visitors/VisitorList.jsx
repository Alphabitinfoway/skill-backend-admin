import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Users,
  Eye,
  RefreshCw,
  Search,
  Clock,
  Laptop,
  AlertCircle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import api from '../../api/axios';

const VisitorList = () => {
  const [stats, setStats] = useState({
    totalUnique: 0,
    todayUnique: 0,
    totalImpressions: 0,
    recentVisitors: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchVisitorStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/visitors/stats');
      if (response.data?.success) {
        setStats({
          totalUnique: response.data.data.totalUnique || 0,
          todayUnique: response.data.data.todayUnique || 0,
          totalImpressions: response.data.data.totalImpressions || 0,
          recentVisitors: response.data.data.recentVisitors || []
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch visitor analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitorStats();
  }, [fetchVisitorStats]);

  const filteredVisitors = stats.recentVisitors.filter((v) => {
    const term = searchTerm.toLowerCase();
    return (
      (v.ip || '').toLowerCase().includes(term) ||
      (v.userAgent || '').toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Unique Visitor Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Track unique website visitors based on IP address and monitor live impressions.
          </p>
        </div>

        <button
          onClick={fetchVisitorStats}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          Refresh Stats
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fecaca' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {/* Total Unique Visitors */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>TOTAL UNIQUE VISITORS</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
              <Globe size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>
            {loading ? '...' : stats.totalUnique.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
            Tracked by unique IP address
          </div>
        </div>

        {/* Today's Unique Visitors */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>NEW TODAY (LAST 24H)</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#d1fae5', color: '#059669' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>
            {loading ? '...' : stats.todayUnique.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: '600' }}>
            New IPs in past 24 hours
          </div>
        </div>

        {/* Total Page Impressions */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>TOTAL PAGE IMPRESSIONS</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Eye size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>
            {loading ? '...' : stats.totalImpressions.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#d97706', marginTop: '4px', fontWeight: '600' }}>
            Includes repeat page visits
          </div>
        </div>
      </div>

      {/* Controls / Filter */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            Recent Visitor Logs
          </h2>

          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search IP or User Agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 20px' }}>IP Address</th>
                <th style={{ padding: '12px 20px' }}>Visits</th>
                <th style={{ padding: '12px 20px' }}>First Visit</th>
                <th style={{ padding: '12px 20px' }}>Last Visited</th>
                <th style={{ padding: '12px 20px' }}>Device / User Agent</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    Loading visitor logs...
                  </td>
                </tr>
              ) : filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    No visitor records found.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>
                          {item.ip}
                        </span>
                        {item.ip === '127.0.0.1' && (
                          <span style={{ fontSize: '10px', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                            Localhost
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '12px', fontWeight: '700', fontSize: '12px' }}>
                        {item.visitCount || 1} {item.visitCount === 1 ? 'visit' : 'visits'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '12.5px' }}>
                      {formatDate(item.createdAt)}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '12.5px' }}>
                      {formatDate(item.lastVisitedAt)}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px' }} title={item.userAgent}>
                      {item.userAgent || 'Unknown'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisitorList;
