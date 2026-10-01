import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'];

const initialForm = {
  department: '',
  title: '',
  location: '',
  jobType: ['Full Time'],
  experience: '',
  description: '',
  responsibilities: [],
  requirements: [],
  skills: [],
  status: 'draft',
  sortOrder: 0
};

// Simple internal helper for list fields (responsibilities, requirements, skills)
const ListField = ({ label, items = [], onChange, placeholder }) => {
  const [text, setText] = useState('');

  const handleAdd = () => {
    const val = text.trim();
    if (!val) return;
    if (!items.includes(val)) {
      onChange([...items, val]);
    }
    setText('');
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="input-group">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="input-field"
          style={{ flex: 1 }}
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button type="button" className="btn btn-secondary" onClick={handleAdd}>
          <Plus size={16} /> Add
        </button>
      </div>

      {items.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f1f5f9',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px'
              }}
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-muted)',
                  padding: '2px'
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
          location: job.location || '',
          jobType: Array.isArray(job.jobType) ? job.jobType : job.jobType ? [job.jobType] : [],
          experience: job.experience || '',
          description: job.description || '',
          responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
          requirements: Array.isArray(job.requirements) ? job.requirements : [],
          skills: Array.isArray(job.skills) ? job.skills : [],
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="input-group">
              <label htmlFor="location">Location</label>
              <input id="location" name="location" className="input-field" placeholder="e.g. Rajkot, Gujarat" value={formData.location} onChange={handleChange} maxLength={200} />
            </div>
            <fieldset className="input-group" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ marginBottom: '8px' }}>Job type</legend>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {JOB_TYPES.map((type) => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="checkbox"
                      checked={formData.jobType.includes(type)}
                      onChange={() => setFormData((previous) => ({
                        ...previous,
                        jobType: previous.jobType.includes(type)
                          ? previous.jobType.filter((item) => item !== type)
                          : [...previous.jobType, type]
                      }))}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="input-group">
              <label htmlFor="experience">Experience</label>
              <input id="experience" name="experience" className="input-field" placeholder="e.g. 1–3 Years" value={formData.experience} onChange={handleChange} maxLength={100} />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="description">About the Job / Description</label>
            <textarea id="description" name="description" className="input-field" rows="6" value={formData.description} onChange={handleChange} maxLength={5000} required />
          </div>

          <ListField
            label="Responsibilities"
            placeholder="Add a responsibility (e.g. Counsel students) and press Enter"
            items={formData.responsibilities}
            onChange={(items) => setFormData((prev) => ({ ...prev, responsibilities: items }))}
          />

          <ListField
            label="Requirements"
            placeholder="Add a requirement (e.g. Bachelor's degree) and press Enter"
            items={formData.requirements}
            onChange={(items) => setFormData((prev) => ({ ...prev, requirements: items }))}
          />

          <ListField
            label="Skills"
            placeholder="Add a skill (e.g. Communication) and press Enter"
            items={formData.skills}
            onChange={(items) => setFormData((prev) => ({ ...prev, skills: items }))}
          />

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