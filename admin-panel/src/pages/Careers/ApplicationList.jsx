import React, { useCallback, useEffect, useState } from 'react';
import { Download, Eye, FileText, RefreshCw, Search, Trash2, X } from 'lucide-react';
import api from '../../api/axios';

const applicationStatuses = ['submitted', 'reviewing', 'shortlisted', 'rejected', 'hired'];

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/applications');
      setApplications(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (id, status) => {
    try {
      const response = await api.patch(`/admin/applications/${id}/status`, { status });
      if (response.data?.success) {
        setApplications((previous) => previous.map((application) =>
          application._id === id ? response.data.data : application
        ));
        setSelectedApplication((previous) => previous?._id === id ? response.data.data : previous);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status');
    }
  };

  const handleView = async (id) => {
    try {
      const response = await api.get(`/admin/applications/${id}`);
      setSelectedApplication(response.data?.data || null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch application');
    }
  };

  const handleResume = async (id) => {
    const resumeWindow = window.open('about:blank', '_blank');
    try {
      const response = await api.get(`/admin/applications/${id}/resume`);
      const resumeUrl = response.data?.data?.resume?.url;
      if (!resumeUrl) throw new Error('Resume URL is missing');
      if (resumeWindow) {
        resumeWindow.opener = null;
        resumeWindow.location = resumeUrl;
      } else {
        throw new Error('Allow pop-ups to open the resume');
      }
    } catch (err) {
      resumeWindow?.close();
      alert(err.response?.data?.message || err.message || 'Failed to open resume');
    }
  };

  const handleDelete = async (application) => {
    if (!window.confirm(`Delete the application from ${application.name}? The resume will also be deleted.`)) return;
    try {
      await api.delete(`/admin/applications/${application._id}`);
      setApplications((previous) => previous.filter((item) => item._id !== application._id));
      if (selectedApplication?._id === application._id) setSelectedApplication(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete application');
    }
  };

  const filteredApplications = applications.filter((application) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = [application.name, application.email, application.jobTitle, application.department]
      .some((value) => value?.toLowerCase().includes(term));
    return matchesSearch && (!statusFilter || application.status === statusFilter);
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Applications ({applications.length})</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Review candidates and manage their application status.</p>
        </div>
        <button onClick={fetchApplications} disabled={loading} className="btn btn-secondary" title="Refresh applications">
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} /> Refresh
        </button>
      </div>

      <div className="card" style={{ padding: '18px 20px', marginBottom: '24px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="search" className="input-field" placeholder="Search candidate or position..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} style={{ width: '100%', paddingLeft: '42px' }} />
        </div>
        <select className="input-field" aria-label="Filter applications by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ width: 'auto', minWidth: '180px' }}>
          <option value="">All statuses</option>
          {applicationStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading applications...</div>
        ) : filteredApplications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px', color: 'var(--text-muted)' }}>
            <FileText size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '4px' }}>No applications found</p>
            <p style={{ fontSize: '13px' }}>Applications submitted through the careers page will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{application.name}</div>
                      <a href={`mailto:${application.email}`} style={{ color: 'var(--primary)', fontSize: '12px', textDecoration: 'none' }}>{application.email}</a>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-main)', fontWeight: '500' }}>{application.jobTitle}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{application.department}</div>
                    </td>
                    <td>
                      <select
                        className="input-field"
                        aria-label={`Status for ${application.name}`}
                        value={application.status}
                        onChange={(event) => handleStatusChange(application._id, event.target.value)}
                        style={{ width: 'auto', minWidth: '140px', padding: '7px 10px', textTransform: 'capitalize' }}
                      >
                        {applicationStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => handleResume(application._id)} className="btn-icon" title="Open resume"><Download size={16} /></button>
                        <button type="button" onClick={() => handleView(application._id)} className="btn-icon" title="View application"><Eye size={16} /></button>
                        <button type="button" onClick={() => handleDelete(application)} className="btn-icon" title="Delete application" style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedApplication && (
        <div role="dialog" aria-modal="true" aria-labelledby="application-detail-title" onClick={() => setSelectedApplication(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" onClick={(event) => event.stopPropagation()} style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button type="button" onClick={() => setSelectedApplication(null)} className="btn-icon" title="Close details" style={{ position: 'absolute', top: '18px', right: '18px' }}><X size={18} /></button>
            <h2 id="application-detail-title" style={{ fontSize: '20px', margin: '0 40px 20px 0' }}>{selectedApplication.name}</h2>
            <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
              <div><strong>Position:</strong> {selectedApplication.jobTitle} · {selectedApplication.department}</div>
              <div><strong>Email:</strong> <a href={`mailto:${selectedApplication.email}`}>{selectedApplication.email}</a></div>
              <div><strong>Phone:</strong> <a href={`tel:${selectedApplication.phone}`}>{selectedApplication.phone}</a></div>
              <div><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedApplication.status}</span></div>
              {selectedApplication.coverLetter && <div><strong>Cover letter:</strong><p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{selectedApplication.coverLetter}</p></div>}
            </div>
            <button type="button" onClick={() => handleResume(selectedApplication._id)} className="btn btn-secondary" style={{ marginTop: '20px' }}><Download size={16} /> Open Resume</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationList;