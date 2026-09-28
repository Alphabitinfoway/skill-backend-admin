import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const initialForm = { department: '', title: '', description: '', status: 'draft', sortOrder: 0 };

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;

    const fetchJob = async () => {
      try {
        const response = await api.get(`/admin/jobs/${id}`);
        const job = response.data.data;
        setFormData({
          department: job.department || '',
          title: job.title || '',
          description: job.description || '',
          status: job.status || 'draft',
          sortOrder: job.sortOrder ?? 0
        });
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to fetch job');
        navigate('/jobs');
      } finally {
        setFetching(false);
      }
    };

    fetchJob();
  }, [id, isEditing, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const payload = { ...formData, sortOrder: Number(formData.sortOrder) || 0 };
    try {
      if (isEditing) {
        await api.put(`/admin/jobs/${id}`, payload);
      } else {
        await api.post('/admin/jobs', payload);
      }
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} job`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading job...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link to="/jobs" className="btn btn-secondary" style={{ padding: '10px' }} title="Back to jobs">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{isEditing ? 'Edit Job' : 'Create Job'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Job details are shown on the public careers page when published.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          {error && <div role="alert" style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}
          <div className="input-group">
            <label htmlFor="department">Department</label>
            <input id="department" name="department" className="input-field" value={formData.department} onChange={handleChange} maxLength={120} required />
          </div>
          <div className="input-group">
            <label htmlFor="title">Job title</label>
            <input id="title" name="title" className="input-field" value={formData.title} onChange={handleChange} maxLength={160} required />
          </div>
          <div className="input-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" className="input-field" rows="7" value={formData.description} onChange={handleChange} maxLength={5000} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="input-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" className="input-field" value={formData.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="sortOrder">Display order</label>
              <input id="sortOrder" name="sortOrder" type="number" step="1" className="input-field" value={formData.sortOrder} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Link to="/jobs" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={17} /> {loading ? 'Saving...' : isEditing ? 'Update Job' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;