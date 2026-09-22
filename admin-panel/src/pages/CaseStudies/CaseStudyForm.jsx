import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, FileImage, Save, UploadCloud, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import RichTextEditor from '../../components/Blogs/RichTextEditor';

const CaseStudyForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ title: '', slug: '', metaTitle: '', metaDescription: '', content: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;

    const fetchCaseStudy = async () => {
      try {
        const response = await api.get(`/admin/case-studies/${id}`);
        const item = response.data.data;
        setFormData({
          title: item.title || '',
          slug: item.slug || '',
          metaTitle: item.metaTitle || '',
          metaDescription: item.metaDescription || '',
          content: item.content || ''
        });
        if (item.image && item.image !== 'no-photo.jpg') {
          setImagePreview(item.image.startsWith('http') ? item.image : `http://localhost:5000/${item.image}`);
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to fetch case study details');
        navigate('/case-studies');
      } finally {
        setFetching(false);
      }
    };

    fetchCaseStudy();
  }, [id, isEditing, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => {
      const next = { ...previous, [name]: value };
      if (name === 'title' && (!previous.slug || previous.slug === previous.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-'))) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      }
      return next;
    });
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
      alert('Only JPG, PNG, WebP, and SVG images are allowed');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors = {};
    if (!formData.title.trim()) nextErrors.title = 'Please add a title';
    if (formData.title.length > 200) nextErrors.title = 'Title cannot be more than 200 characters';
    if (!formData.content.trim() || formData.content === '<p></p>') nextErrors.content = 'Please add case study content';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => submitData.append(key, value || ''));
    if (imageFile) submitData.append('image', imageFile);

    try {
      const endpoint = isEditing ? `/admin/case-studies/${id}` : '/admin/case-studies';
      const request = isEditing ? api.put : api.post;
      await request(endpoint, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/case-studies');
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} case study`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading case study workspace...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link to="/case-studies" className="btn btn-secondary" style={{ padding: '10px' }} title="Back to Case Studies">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{isEditing ? 'Edit Case Study' : 'Create New Case Study'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage case study content, SEO details, and cover image.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: '24px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Case Study Details</h2>
              <div className="input-group">
                <label htmlFor="title">Title</label>
                <input id="title" name="title" className="input-field" value={formData.title} onChange={handleChange} placeholder="Case study title" />
                {errors.title && <p style={{ color: 'var(--danger)', fontSize: '13px' }}>{errors.title}</p>}
              </div>
              <div className="input-group">
                <label htmlFor="slug">URL Slug</label>
                <input id="slug" name="slug" className="input-field" value={formData.slug} onChange={handleChange} placeholder="case-study-slug" />
              </div>
              <div className="input-group">
                <label htmlFor="metaTitle">Meta Title</label>
                <input id="metaTitle" name="metaTitle" className="input-field" value={formData.metaTitle} onChange={handleChange} placeholder="SEO title (optional)" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="metaDescription">Meta Description</label>
                <textarea id="metaDescription" name="metaDescription" className="input-field" rows="3" value={formData.metaDescription} onChange={handleChange} placeholder="SEO description (optional)" />
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Content</h2>
              <RichTextEditor value={formData.content} onChange={(content) => setFormData((previous) => ({ ...previous, content }))} />
              {errors.content && <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '8px' }}>{errors.content}</p>}
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Cover Image</h2>
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); handleFileSelect(event.dataTransfer.files[0]); }}
              style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center' }}
            >
              {imagePreview ? (
                <div style={{ position: 'relative' }}>
                  <img src={imagePreview} alt="Case study preview" style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: '10px' }} />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="btn-icon" style={{ position: 'absolute', top: '8px', right: '8px', background: '#fff' }} title="Remove image">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <FileImage size={38} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
              )}
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '12px 0' }}>Upload a JPG, PNG, WebP, or SVG image.</p>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={(event) => handleFileSelect(event.target.files[0])} style={{ width: '100%', fontSize: '13px' }} />
              <UploadCloud size={16} style={{ marginTop: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Link to="/case-studies" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={17} />
            {loading ? 'Saving...' : (isEditing ? 'Update Case Study' : 'Publish Case Study')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseStudyForm;