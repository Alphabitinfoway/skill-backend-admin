import React, { useCallback, useEffect, useState } from 'react';
import { BriefcaseBusiness, Edit2, Eye, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const jobStatuses = ['draft', 'published', 'closed'];

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/jobs');
      setJobs(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleStatusChange = async (id, status) => {
    try {
      const response = await api.patch(`/admin/jobs/${id}/status`, { status });
      if (response.data?.success) {
        setJobs((previous) => previous.map((job) => job._id === id ? response.data.data : job));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status');
    }
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete the ${job.title} job?`)) return;
    try {
      await api.delete(`/admin/jobs/${job._id}`);
      setJobs((previous) => previous.filter((item) => item._id !== job._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter((job) =>
    `${job.title} ${job.department}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Jobs ({jobs.length})</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Manage the roles shown on the careers page.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={fetchJobs} disabled={loading} className="btn btn-secondary" title="Refresh jobs">
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} /> Refresh
          </button>
          <Link to="/jobs/create" className="btn btn-primary">
            <Plus size={18} /> Create Job
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '480px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="search"
            className="input-field"
            placeholder="Search title or department..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={{ width: '100%', paddingLeft: '42px' }}
          />
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px', color: 'var(--text-muted)' }}>
            <BriefcaseBusiness size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '4px' }}>No jobs found</p>
            <p style={{ fontSize: '13px' }}>Create a job to show it on the careers page.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{job.title}</div>
                      <div style={{ maxWidth: '460px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }} title={job.description}>
                        {job.description}
                      </div>
                    </td>
                    <td>{job.department}</td>
                    <td>
                      <select
                        className="input-field"
                        aria-label={`Status for ${job.title}`}
                        value={job.status}
                        onChange={(event) => handleStatusChange(job._id, event.target.value)}
                        style={{ width: 'auto', minWidth: '125px', padding: '7px 10px', textTransform: 'capitalize' }}
                      >
                        {jobStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setSelectedJob(job)} className="btn-icon" title="View job">
                          <Eye size={16} />
                        </button>
                        <Link to={`/jobs/edit/${job._id}`} className="btn-icon" title="Edit job">
                          <Edit2 size={16} />
                        </Link>
                        <button type="button" onClick={() => handleDelete(job)} className="btn-icon" title="Delete job" style={{ color: 'var(--danger)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedJob && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-detail-title"
          onClick={() => setSelectedJob(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            className="card"
            onClick={(event) => event.stopPropagation()}
            style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
          >
            <button type="button" onClick={() => setSelectedJob(null)} className="btn-icon" title="Close job details" style={{ position: 'absolute', top: '18px', right: '18px' }}>
              <X size={18} />
            </button>
            <h2 id="job-detail-title" style={{ fontSize: '20px', margin: '0 40px 6px 0' }}>{selectedJob.title}</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 20px' }}>{selectedJob.department}</p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '20px', fontSize: '13px' }}>
              <span><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedJob.status}</span></span>
              <span><strong>Display order:</strong> {selectedJob.sortOrder ?? 0}</span>
              {selectedJob.createdAt && <span><strong>Created:</strong> {new Date(selectedJob.createdAt).toLocaleDateString()}</span>}
            </div>
            <h3 style={{ fontSize: '15px', marginBottom: '8px' }}>Description</h3>
            <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{selectedJob.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;