import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import api from '../../api/axios';

const EMPTY_CONTENT = {
  seo: {
    title: '',
    description: '',
    keywords: [],
    h1: '',
    canonical: ''
  },
  hero: {
    subtitle: '',
    highlights: [],
    stats: []
  },
  about: {
    paragraphs: [],
    highlights: []
  },
  executionBenchmark: [],
  curriculum: [],
  projects: [],
  skills: [],
  eligibility: [],
  prerequisites: [],
  benefits: [],
  faqs: []
};

const makeSlug = (value) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9 -]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

const createEmptyContent = () => JSON.parse(JSON.stringify(EMPTY_CONTENT));

const getValueAtPath = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);

const setValueAtPath = (object, path, value) => {
  const [key, ...remainingKeys] = path.split('.');
  return {
    ...object,
    [key]: remainingKeys.length
      ? setValueAtPath(object[key] || {}, remainingKeys.join('.'), value)
      : value
  };
};

const asTextareaValue = (value) => Array.isArray(value) ? value.join('\n') : value || '';

const toLines = (value) => (Array.isArray(value) ? value : String(value || '').split('\n'))
  .map((item) => item.trim())
  .filter(Boolean);

const InternshipManager = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isForm = location.pathname !== '/internships';
  const isEditing = Boolean(id);

  const [internships, setInternships] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(!isForm);
  const [fetching, setFetching] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [content, setContent] = useState(createEmptyContent);
  const [slugEdited, setSlugEdited] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageRemoved, setImageRemoved] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/internships');
      setInternships(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isForm) {
      fetchInternships();
    }
  }, [isForm]);

  useEffect(() => {
    let isActive = true;

    if (!isEditing) {
      setFetching(false);
      setFormError('');
      setTitle('');
      setSlug('');
      setIsPublished(true);
      setContent(createEmptyContent());
      setSlugEdited(false);
      setImageFile(null);
      setImageUrl('');
      setImageRemoved(false);
      return () => {
        isActive = false;
      };
    }

    const fetchInternship = async () => {
      try {
        setFetching(true);
        setImageFile(null);
        setImageRemoved(false);
        const response = await api.get(`/admin/internships/${id}`);
        if (!isActive) return;

        const internship = response.data.data;
        const pageContent = { ...internship };
        const internshipTitle = pageContent.title;
        const internshipSlug = pageContent.slug;
        const published = pageContent.isPublished;
        const internshipImage = pageContent.image || '';
        delete pageContent._id;
        delete pageContent.id;
        delete pageContent.__v;
        delete pageContent.createdAt;
        delete pageContent.updatedAt;
        delete pageContent.title;
        delete pageContent.slug;
        delete pageContent.isPublished;
        delete pageContent.image;
        setTitle(internshipTitle || '');
        setSlug(internshipSlug || '');
        setSlugEdited(true);
        setIsPublished(published !== false);
        setImageUrl(internshipImage);
        const defaults = createEmptyContent();
        setContent({
          ...defaults,
          ...pageContent,
          seo: { ...defaults.seo, ...pageContent.seo },
          hero: { ...defaults.hero, ...pageContent.hero, stats: pageContent.hero?.stats || [] },
          about: {
            ...defaults.about,
            ...pageContent.about,
            paragraphs: asTextareaValue(pageContent.about?.paragraphs)
          }
        });
      } catch (requestError) {
        if (isActive) {
          setFormError(requestError.response?.data?.message || 'Failed to fetch internship details');
        }
      } finally {
        if (isActive) {
          setFetching(false);
        }
      }
    };

    fetchInternship();

    return () => {
      isActive = false;
    };
  }, [id, isEditing]);

  const filteredInternships = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return internships.filter((internship) =>
      internship.title?.toLowerCase().includes(term) ||
      internship.slug?.toLowerCase().includes(term)
    );
  }, [internships, searchTerm]);

  const handleTitleChange = (event) => {
    const value = event.target.value;
    setTitle(value);
    if (!slugEdited) setSlug(makeSlug(value));
  };

  const updateContentSection = (section, field, value) => {
    setContent((previous) => ({
      ...previous,
      [section]: { ...previous[section], [field]: value }
    }));
  };

  const updateCollectionItem = (collection, index, field, value) => {
    setContent((previous) => setValueAtPath(
      previous,
      collection,
      getValueAtPath(previous, collection).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    ));
  };

  const addCollectionItem = (collection, template) => {
    setContent((previous) => setValueAtPath(
      previous,
      collection,
      [...getValueAtPath(previous, collection), { ...template }]
    ));
  };

  const removeCollectionItem = (collection, index) => {
    setContent((previous) => setValueAtPath(
      previous,
      collection,
      getValueAtPath(previous, collection).filter((_, itemIndex) => itemIndex !== index)
    ));
  };

  const renderLinesField = (label, value, onChange, rows = 4) => (
    <div className="input-group">
      <label>{label}</label>
      <textarea
        className="input-field"
        rows={rows}
        value={asTextareaValue(value)}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter one item per line"
        style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
      />
      <small style={{ color: 'var(--text-muted)' }}>Enter one item per line.</small>
    </div>
  );

  const renderCollection = (collection, heading, template, fields) => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
        <h2 style={{ fontSize: '18px', margin: 0 }}>{heading} ({getValueAtPath(content, collection).length})</h2>
        <button type="button" className="btn btn-secondary" onClick={() => addCollectionItem(collection, template)}>
          <Plus size={16} />
          Add {heading.replace(/s$/, '')}
        </button>
      </div>
      {getValueAtPath(content, collection).length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No items added yet.</p>
      )}
      {getValueAtPath(content, collection).map((item, index) => (
        <div key={`${collection}-${index}`} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <strong style={{ color: 'var(--text-main)' }}>{heading.replace(/s$/, '')} {index + 1}</strong>
            <button type="button" className="btn btn-secondary" onClick={() => removeCollectionItem(collection, index)} style={{ color: 'var(--danger)' }}>
              <Trash2 size={15} />
              Remove
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 18px' }}>
            {fields.map((field) => (
              <div className="input-group" key={field.name} style={field.fullWidth ? { gridColumn: '1 / -1' } : undefined}>
                <label>{field.label}</label>
                {field.type === 'lines' ? (
                  <>
                    <textarea
                      className="input-field"
                      rows={field.rows || 4}
                      value={asTextareaValue(item[field.name])}
                      onChange={(event) => updateCollectionItem(collection, index, field.name, event.target.value)}
                      placeholder="Enter one item per line"
                      style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                    <small style={{ color: 'var(--text-muted)' }}>Enter one item per line.</small>
                  </>
                ) : field.type === 'textarea' ? (
                  <textarea
                    className="input-field"
                    rows={field.rows || 3}
                    value={item[field.name] || ''}
                    onChange={(event) => updateCollectionItem(collection, index, field.name, event.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                ) : (
                  <input
                    className="input-field"
                    value={item[field.name] || ''}
                    onChange={(event) => updateCollectionItem(collection, index, field.name, event.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const handleDelete = async (internshipId) => {
    if (!window.confirm('Are you sure you want to delete this internship?')) return;

    try {
      await api.delete(`/admin/internships/${internshipId}`);
      setInternships((previous) => previous.filter((internship) => internship._id !== internshipId));
    } catch (requestError) {
      alert(requestError.response?.data?.message || 'Failed to delete internship');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    if (!title.trim()) {
      setFormError('Please add an internship title.');
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setFormError('Slug must contain lowercase letters, numbers, and hyphens only.');
      return;
    }
    if (!content.hero.subtitle.trim()) {
      setFormError('Please add a hero subtitle.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');
      const pageContent = {
        ...content,
        seo: { ...content.seo, keywords: toLines(content.seo.keywords) },
        hero: { ...content.hero, highlights: toLines(content.hero.highlights) },
        about: {
          ...content.about,
          paragraphs: asTextareaValue(content.about.paragraphs).split('\n').map((paragraph) => paragraph.trim()).filter(Boolean),
          highlights: toLines(content.about.highlights)
        },
        curriculum: content.curriculum.map((module) => ({
          ...module,
          topics: toLines(module.topics),
          stack: toLines(module.stack)
        })),
        projects: content.projects.map((project) => ({
          ...project,
          highlights: toLines(project.highlights),
          stack: toLines(project.stack)
        })),
        skills: content.skills.map((skill) => ({ ...skill, items: toLines(skill.items) })),
        prerequisites: toLines(content.prerequisites)
      };
      const payload = {
        title: title.trim(),
        slug,
        isPublished,
        ...pageContent,
        ...(imageRemoved ? { image: '' } : {})
      };
      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEditing) {
        await api.put(`/admin/internships/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/admin/internships', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/internships');
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} internship`);
    } finally {
      setSaving(false);
    }
  };

  if (isForm) {
    if (fetching) {
      return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading internship...</div>;
    }

    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <Link to="/internships" className="btn btn-secondary" style={{ padding: '10px' }} title="Back to Internships">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{isEditing ? 'Edit Internship' : 'Create Internship'}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
              Manage internship page content and publishing status.
            </p>
          </div>
        </div>

        {formError && <div role="alert" style={{ color: 'var(--danger)', marginBottom: '16px' }}>{formError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Internship Details</h2>
            <div className="input-group">
              <label htmlFor="internship-title">Title</label>
              <input id="internship-title" className="input-field" value={title} onChange={handleTitleChange} maxLength={200} required />
            </div>
            <div className="input-group">
              <label htmlFor="internship-slug">URL Slug</label>
              <input
                id="internship-slug"
                className="input-field"
                value={slug}
                onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }}
                placeholder="ai-ml"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="internship-image">Internship Image</label>
              <input
                ref={imageInputRef}
                id="internship-image"
                className="input-field"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  setImageFile(event.target.files?.[0] || null);
                  if (event.target.files?.[0]) setImageRemoved(false);
                }}
              />
              <small style={{ color: 'var(--text-muted)' }}>JPEG, PNG, or WebP; maximum size 5 MB.</small>
              {(imagePreview || imageUrl) && (
                <div style={{ marginTop: '12px' }}>
                  <img
                    src={imagePreview || imageUrl}
                    alt="Internship preview"
                    style={{ display: 'block', maxWidth: '240px', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setImageFile(null);
                      setImageUrl('');
                      setImageRemoved(true);
                      if (imageInputRef.current) imageInputRef.current.value = '';
                    }}
                    style={{ marginTop: '8px', color: 'var(--danger)' }}
                  >
                    <Trash2 size={16} />
                    Remove image
                  </button>
                </div>
              )}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} />
              Published
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>SEO Details</h2>
              <div className="input-group">
                <label>Meta Title</label>
                <input className="input-field" value={content.seo.title} onChange={(event) => updateContentSection('seo', 'title', event.target.value)} />
              </div>
              <div className="input-group">
                <label>Meta Description</label>
                <textarea className="input-field" rows={3} value={content.seo.description} onChange={(event) => updateContentSection('seo', 'description', event.target.value)} style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              {renderLinesField('Keywords', content.seo.keywords, (value) => updateContentSection('seo', 'keywords', value), 3)}
              <div className="input-group">
                <label>H1</label>
                <input className="input-field" value={content.seo.h1} onChange={(event) => updateContentSection('seo', 'h1', event.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Canonical URL</label>
                <input className="input-field" value={content.seo.canonical} onChange={(event) => updateContentSection('seo', 'canonical', event.target.value)} />
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Hero Section</h2>
              <div className="input-group">
                <label>Subtitle</label>
                <textarea className="input-field" rows={3} value={content.hero.subtitle} onChange={(event) => updateContentSection('hero', 'subtitle', event.target.value)} required style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              {renderLinesField('Highlights', content.hero.highlights, (value) => updateContentSection('hero', 'highlights', value))}
            </div>
            {renderCollection('hero.stats', 'Hero Stats', { label: '', value: '', description: '' }, [
              { name: 'label', label: 'Label' },
              { name: 'value', label: 'Value' },
              { name: 'description', label: 'Description' }
            ])}
            {renderCollection('executionBenchmark', 'Execution Benchmarks', { label: '', value: '' }, [
              { name: 'label', label: 'Benchmark' },
              { name: 'value', label: 'Value' }
            ])}

            <div className="card">
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>About Section</h2>
              {renderLinesField('Paragraphs', content.about.paragraphs, (value) => updateContentSection('about', 'paragraphs', value), 7)}
              {renderLinesField('Highlights', content.about.highlights, (value) => updateContentSection('about', 'highlights', value))}
            </div>

            {renderCollection('curriculum', 'Curriculum Modules', {
              title: '', weeks: '', description: '', topics: [], stack: []
            }, [
              { name: 'title', label: 'Module Title' },
              { name: 'weeks', label: 'Weeks' },
              { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
              { name: 'topics', label: 'Topics', type: 'lines' },
              { name: 'stack', label: 'Technology Stack', type: 'lines' }
            ])}

            {renderCollection('projects', 'Projects', {
              category: '', title: '', description: '', highlights: [], stack: []
            }, [
              { name: 'category', label: 'Category' },
              { name: 'title', label: 'Project Title' },
              { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
              { name: 'highlights', label: 'Project Highlights', type: 'lines' },
              { name: 'stack', label: 'Technology Stack', type: 'lines' }
            ])}

            {renderCollection('skills', 'Skill Categories', { category: '', items: [] }, [
              { name: 'category', label: 'Category' },
              { name: 'items', label: 'Skills', type: 'lines' }
            ])}

            {renderCollection('eligibility', 'Eligibility Groups', {
              title: '', description: '', criteria: ''
            }, [
              { name: 'title', label: 'Group Title' },
              { name: 'description', label: 'Description', type: 'textarea' },
              { name: 'criteria', label: 'Criteria', type: 'textarea' }
            ])}

            {renderLinesField('Prerequisites & Setup Requirements', content.prerequisites, (value) => setContent((previous) => ({ ...previous, prerequisites: value })))}

            {renderCollection('benefits', 'Internship Benefits', { title: '', description: '' }, [
              { name: 'title', label: 'Benefit Title' },
              { name: 'description', label: 'Description', type: 'textarea' }
            ])}

            {renderCollection('faqs', 'Frequently Asked Questions', { question: '', answer: '' }, [
              { name: 'question', label: 'Question', type: 'textarea' },
              { name: 'answer', label: 'Answer', type: 'textarea' }
            ])}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Link to="/internships" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Internship'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            Internships ({internships.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            Create and manage internship pages from the backend.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchInternships} disabled={loading} className="btn btn-secondary" title="Refresh Internships">
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>
          <Link to="/internships/create" className="btn btn-primary">
            <Plus size={18} />
            Create Internship
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

      {error && <div role="alert" style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Internship</th>
              <th>Status</th>
              <th>Date Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading internships...</td></tr>
            ) : filteredInternships.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>No internships found</p>
                  <p style={{ fontSize: '14px' }}>Create an internship or change your search.</p>
                </td>
              </tr>
            ) : (
              filteredInternships.map((internship) => {
                const internshipId = internship._id || internship.id;
                return (
                  <tr key={internshipId}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>{internship.title}</div>
                      <div style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: '600' }}>/{internship.slug}</div>
                    </td>
                    <td>
                      <span
                        className={internship.isPublished ? 'badge badge-success' : 'badge'}
                        style={internship.isPublished ? undefined : { backgroundColor: '#f1f5f9', color: '#64748b' }}
                      >
                        {internship.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {internship.createdAt
                        ? new Date(internship.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <Link to={`/internships/edit/${internshipId}`} className="btn btn-secondary" style={{ padding: '8px' }} title="Edit Internship">
                          <Edit2 size={17} />
                        </Link>
                        <button onClick={() => handleDelete(internshipId)} className="btn btn-secondary" style={{ padding: '8px', color: 'var(--danger)' }} title="Delete Internship">
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
    </div>
  );
};

export default InternshipManager;
