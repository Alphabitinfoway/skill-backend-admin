import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Eye, FileText, Image as ImageIcon, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import api from '../../api/axios';

const getImageUrl = (image) => {
  if (!image || image === 'no-photo.jpg') return '';
  if (/^https?:\/\//i.test(image)) return image;

  const apiOrigin = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${apiOrigin}/${image.replace(/^\/+/, '')}`;
};

const CaseStudyList = () => {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
  const [previewImageError, setPreviewImageError] = useState(false);

  const fetchCaseStudies = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/case-studies');
      setCaseStudies(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch case studies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this case study?')) return;

    try {
      await api.delete(`/admin/case-studies/${id}`);
      setCaseStudies((previous) => previous.filter((item) => item._id !== id && item.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete case study');
    }
  };

  const filteredCaseStudies = caseStudies.filter((item) => {
    const term = searchTerm.toLowerCase();
    return item.title?.toLowerCase().includes(term) || item.slug?.toLowerCase().includes(term);
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            Case Studies ({caseStudies.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            Create and manage published case studies from the backend.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchCaseStudies} disabled={loading} className="btn btn-secondary" title="Refresh Case Studies">
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>
          <Link to="/case-studies/create" className="btn btn-primary">
            <Plus size={18} />
            Create Case Study
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '480px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="search"
            className="input-field"
            placeholder="Search by title or slug..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={{ width: '100%', paddingLeft: '42px' }}
          />
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Case Study</th>
              <th>Status</th>
              <th>Date Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading case studies...</td></tr>
            ) : filteredCaseStudies.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <FileText size={42} style={{ opacity: 0.25, margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>No case studies found</p>
                  <p style={{ fontSize: '14px' }}>Create a case study or change your search.</p>
                </td>
              </tr>
            ) : (
              filteredCaseStudies.map((caseStudy) => {
                const id = caseStudy._id || caseStudy.id;
                return (
                  <tr key={id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {caseStudy.image && caseStudy.image !== 'no-photo.jpg' ? (
                          <img
                            src={getImageUrl(caseStudy.image)}
                            alt={caseStudy.title}
                            style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                          />
                        ) : (
                          <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: '#f0ebff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>{caseStudy.title}</div>
                          <div style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: '600' }}>/{caseStudy.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-success">Published</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {new Date(caseStudy.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => { setPreviewImageError(false); setSelectedCaseStudy(caseStudy); }}
                          className="btn btn-secondary"
                          style={{ padding: '8px' }}
                          title="View Case Study"
                        >
                          <Eye size={17} />
                        </button>
                        <Link to={`/case-studies/edit/${id}`} className="btn btn-secondary" style={{ padding: '8px' }} title="Edit Case Study">
                          <Edit2 size={17} />
                        </Link>
                        <button onClick={() => handleDelete(id)} className="btn btn-secondary" style={{ padding: '8px', color: 'var(--danger)' }} title="Delete Case Study">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Detail Preview Modal ── */}
      {selectedCaseStudy && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-preview-title"
          onClick={() => setSelectedCaseStudy(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="card"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '860px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 0,
              borderRadius: '16px',
            }}
          >
            {/* ── Close Button ── */}
            <button
              type="button"
              onClick={() => setSelectedCaseStudy(null)}
              className="btn-icon"
              title="Close preview"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                zIndex: 10,
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <X size={18} />
            </button>

            {/* ── Cover Image ── */}
            <div
              style={{
                width: '100%',
                background: '#f1f5f9',
                borderRadius: '16px 16px 0 0',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                maxHeight: '420px',
                padding: '0',
              }}
            >
              {getImageUrl(selectedCaseStudy.image) && !previewImageError ? (
                <img
                  src={getImageUrl(selectedCaseStudy.image)}
                  alt={selectedCaseStudy.title}
                  onError={() => setPreviewImageError(true)}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '420px',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : (
                <div style={{
                  height: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}>
                  <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>No cover image</div>
                </div>
              )}
            </div>

            {/* ── Modal Body ── */}
            <div style={{ padding: '28px 32px 36px' }}>

              {/* Badges Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'var(--primary-bg)',
                  color: 'var(--primary)',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  border: '1px solid rgba(79,70,229,0.18)',
                }}>
                  Case Study
                </span>
                <span className="badge badge-success">Published</span>
              </div>

              {/* Title */}
              <h2
                id="case-study-preview-title"
                style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  lineHeight: '1.3',
                  color: 'var(--text-main)',
                  marginBottom: '16px',
                }}
              >
                {selectedCaseStudy.title}
              </h2>

              {/* Meta Chips Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: '#f1f5f9', border: '1px solid var(--border-color)',
                  color: 'var(--primary)', fontSize: '12px', fontWeight: '600',
                  padding: '5px 11px', borderRadius: '6px',
                }}>
                  <FileText size={12} />
                  /{selectedCaseStudy.slug}
                </span>
                {selectedCaseStudy.createdAt && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: '#f1f5f9', border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500',
                    padding: '5px 11px', borderRadius: '6px',
                  }}>
                    📅 {new Date(selectedCaseStudy.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                {selectedCaseStudy.metaTitle && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: '#f1f5f9', border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500',
                    padding: '5px 11px', borderRadius: '6px',
                  }}>
                    🏷️ {selectedCaseStudy.metaTitle}
                  </span>
                )}
              </div>

              {/* SEO / Meta Description Callout */}
              {selectedCaseStudy.metaDescription && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderLeft: '4px solid var(--primary)',
                  borderRadius: '0 8px 8px 0',
                  padding: '14px 18px',
                  marginBottom: '28px',
                }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '700',
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                    color: 'var(--primary)', marginBottom: '6px',
                  }}>
                    SEO Description
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.65', margin: 0 }}>
                    {selectedCaseStudy.metaDescription}
                  </p>
                </div>
              )}

              {/* Section Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                <span style={{
                  fontSize: '11px', fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--text-muted)', whiteSpace: 'nowrap', padding: '0 4px',
                }}>
                  Content
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              </div>

              {/* Rich Text Content */}
              <div
                className="case-study-preview-content"
                dangerouslySetInnerHTML={{ __html: selectedCaseStudy.content || '<p>No content available.</p>' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseStudyList;