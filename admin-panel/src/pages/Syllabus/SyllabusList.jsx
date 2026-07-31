import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, FileText, ExternalLink } from 'lucide-react';
import api from '../../api/axios';

const SyllabusList = () => {
  const [syllabusList, setSyllabusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/syllabus').catch(() => ({ data: { data: [] } }));
      setSyllabusList(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch syllabus PDFs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this PDF document?')) {
      try {
        await api.delete(`/admin/syllabus/${id}`);
        setSyllabusList(syllabusList.filter(item => item.id !== id && item._id !== id));
      } catch (err) {
        alert('Failed to delete syllabus item');
      }
    }
  };

  const filteredItems = syllabusList.filter(item => {
    const term = debouncedSearchTerm.trim().toLowerCase();
    if (!term) return true;
    return (item.skillSlug || '').toLowerCase().includes(term) ||
           (item.title || '').toLowerCase().includes(term);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Syllabus PDFs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Upload and manage PDF documents for skill slugs.</p>
        </div>
        <Link to="/syllabus/create" className="btn btn-primary" style={{ padding: '12px 20px' }}>
          <Plus size={18} />
          Upload PDF
        </Link>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by skill slug..." 
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
              <th>Skill Slug</th>
              <th>PDF Document</th>
              <th>Uploaded Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Loading PDFs...</div>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <FileText size={48} style={{ opacity: 0.2, margin: '0 auto' }} />
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '4px' }}>No PDF files found</p>
                  <p style={{ fontSize: '14px' }}>Click "Upload PDF" to assign a PDF to a skill page slug.</p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item._id || item.id}>
                  <td>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '6px 12px', 
                      borderRadius: '16px', 
                      fontSize: '13px', 
                      fontWeight: '600',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      color: '#4f46e5'
                    }}>
                      {item.skillSlug}
                    </span>
                  </td>
                  <td>
                    {item.pdfUrl ? (
                      <a 
                        href={item.pdfUrl.startsWith('http') ? item.pdfUrl : `http://localhost:5000/${item.pdfUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ 
                          height: '36px',
                          padding: '0 12px',
                          borderRadius: '8px', 
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.2) 100%)', 
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#dc2626',
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '12px'
                        }} 
                        title="Open PDF in new tab"
                      >
                        <FileText size={16} style={{ color: '#dc2626' }} />
                        <span>View / Download PDF</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No file attached</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <Link to={`/syllabus/edit/${item._id || item.id}`} className="btn btn-secondary" style={{ padding: '8px', background: 'transparent' }} title="Edit PDF">
                        <Edit2 size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(item._id || item.id)} 
                        className="btn btn-secondary" 
                        style={{ padding: '8px', color: 'var(--danger)', background: 'transparent', borderColor: 'transparent' }}
                        title="Delete PDF"
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

export default SyllabusList;
