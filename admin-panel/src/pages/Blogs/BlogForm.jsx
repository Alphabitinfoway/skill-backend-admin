import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  UploadCloud,
  X,
  BookOpen,
  Clock,
  FileImage,
  Sparkles,
  PenTool,
  Eye,
  User,
  FileText,
  HelpCircle,
  Search,
  Globe,
  Monitor,
  Smartphone,
  Columns,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import RichTextEditor from '../../components/Blogs/RichTextEditor';

/* ── Helper to convert legacy plain text / block text to HTML ───────────── */
function convertLegacyTextToHtml(text) {
  if (!text || !text.trim()) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return text;

  const blocks = text.split(/\r?\n\r?\n/).map((b) => b.trim()).filter(Boolean);
  const htmlParts = blocks.map((block) => {
    const takeawayMatch = block.match(/^(key takeaway|takeaway|summary|pro tip|important|note|highlights|conclusion)[:\-]?\s*(.*)/i);
    if (takeawayMatch) {
      return `<blockquote>${takeawayMatch[2] || block}</blockquote>`;
    }

    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const bulletRegex = /^([•\-\*]|->|>|\d+[\.\)])\s+/;
    if (lines.some((l) => bulletRegex.test(l))) {
      const itemsHtml = lines.map((l) => `<li>${l.replace(bulletRegex, '')}</li>`).join('');
      return `<ul>${itemsHtml}</ul>`;
    }

    const isMarkdownHeading = /^#{1,4}\s+/.test(block);
    const isHeading =
      isMarkdownHeading ||
      (block.length < 95 && !block.endsWith('.') && !block.endsWith(',') && !block.includes('\n')) ||
      /^(quick answer|why is|should you|full stack vs|common mistakes|career opportunities|salary expectations|is full stack|frequently asked|final thoughts|ready to start|skills employers)/i.test(block);

    if (isHeading) {
      const cleanHeading = block.replace(/^#{1,4}\s+/, '').trim();
      return `<h2>${cleanHeading}</h2>`;
    }

    return `<p>${block.replace(/\n/g, '<br />')}</p>`;
  });

  return htmlParts.join('\n');
}

const BlogForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    content: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeViewMode, setActiveViewMode] = useState('split'); // 'write', 'preview', or 'split'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' or 'mobile'
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  const getWordCount = (html) => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>/g, ' ').trim();
    return text ? text.split(/\s+/).length : 0;
  };

  const getCharCount = (html) => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length;
  };

  const getReadingTime = (html) => {
    const words = getWordCount(html);
    return Math.max(1, Math.ceil(words / 200));
  };

  useEffect(() => {
    if (isEditing) {
      const fetchBlog = async () => {
        try {
          const response = await api.get(`/admin/blogs/${id}`);
          const blogData = response.data.data;
          const rawContent = blogData.content || '';
          
          setFormData({
            title: blogData.title || '',
            slug: blogData.slug || '',
            metaTitle: blogData.metaTitle || '',
            metaDescription: blogData.metaDescription || '',
            content: convertLegacyTextToHtml(rawContent)
          });

          if (blogData.image && blogData.image !== 'no-photo.jpg') {
            const imgUrl = blogData.image.startsWith('http') ? blogData.image : `http://localhost:5000/${blogData.image}`;
            setImagePreview(imgUrl);
          }
        } catch (error) {
          alert('Failed to fetch blog details');
          navigate('/blogs');
        } finally {
          setFetching(false);
        }
      };
      fetchBlog();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const nextState = { ...prev, [name]: value };
      // Auto generate slug from title if user hasn't typed a custom slug
      if (name === 'title' && (!prev.slug || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-'))) {
        nextState.slug = value.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      }
      return nextState;
    });
  };

  const handleContentChange = (htmlContent) => {
    setFormData((prev) => ({ ...prev, content: htmlContent }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
      alert('Only JPG, PNG, WebP, and SVG images are allowed');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Please add a title';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot be more than 200 characters';
    }
    
    if (!formData.content.trim() || formData.content === '<p></p>') {
      newErrors.content = 'Please add some blog content';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('metaTitle', formData.metaTitle || '');
    submitData.append('metaDescription', formData.metaDescription || '');
    submitData.append('content', formData.content);

    if (formData.slug) {
      submitData.append('slug', formData.slug);
    }
    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      if (isEditing) {
        await api.put(`/admin/blogs/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/admin/blogs', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/blogs');
    } catch (error) {
      console.error(error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} blog`;
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #7143FE', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Loading article workspace...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Calculate layout grid columns based on activeViewMode
  const showEditor = activeViewMode === 'write' || activeViewMode === 'split';
  const showPreview = activeViewMode === 'preview' || activeViewMode === 'split';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* ── TOP CONTROL HEADER BAR ── */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        justifySpaceBetween: 'space-between', 
        gap: '16px', 
        marginBottom: '24px',
        padding: '16px 24px',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #EAEAEF',
        boxShadow: '0 4px 20px -4px rgba(113, 67, 254, 0.06)'
      }}>
        {/* Left: Back Link & Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link 
            to="/blogs" 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: '#F4F2FF', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#7143FE',
              transition: 'all 0.2s ease',
              textDecoration: 'none'
            }}
            title="Back to Blogs List"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', color: '#7143FE', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Blog Studio • {isEditing ? 'Editor' : 'Creator'}
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '2px 0 0', color: '#111827', fontFamily: 'Inter, sans-serif' }}>
              {isEditing ? 'Edit Blog Article' : 'Create New Article'}
            </h1>
          </div>
        </div>

        {/* Center: View Switcher (Write / Split / Preview) */}
        <div style={{ display: 'flex', background: '#F1F1F5', padding: '4px', borderRadius: '14px', border: '1px solid #E4E4E9' }}>
          <button
            type="button"
            onClick={() => setActiveViewMode('write')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: activeViewMode === 'write' ? '#FFFFFF' : 'transparent',
              color: activeViewMode === 'write' ? '#7143FE' : '#64748B',
              boxShadow: activeViewMode === 'write' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <PenTool size={15} /> Write
          </button>

          <button
            type="button"
            onClick={() => setActiveViewMode('split')}
            className="hidden lg-flex"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: activeViewMode === 'split' ? '#FFFFFF' : 'transparent',
              color: activeViewMode === 'split' ? '#7143FE' : '#64748B',
              boxShadow: activeViewMode === 'split' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Columns size={15} /> Split Screen
          </button>

          <button
            type="button"
            onClick={() => setActiveViewMode('preview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: activeViewMode === 'preview' ? '#FFFFFF' : 'transparent',
              color: activeViewMode === 'preview' ? '#7143FE' : '#64748B',
              boxShadow: activeViewMode === 'preview' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Eye size={15} /> Live Preview
          </button>
        </div>

        {/* Right: Actions (Cancel, Save/Publish) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link 
            to="/blogs" 
            style={{ 
              padding: '10px 20px', 
              borderRadius: '12px', 
              border: '1px solid #E2E8F0', 
              background: '#FFFFFF', 
              color: '#475569', 
              fontWeight: '600', 
              fontSize: '14px', 
              textDecoration: 'none',
              transition: 'all 0.2s ease' 
            }}
          >
            Cancel
          </Link>

          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={loading}
            style={{ 
              padding: '10px 24px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #7143FE 0%, #5B2ED7 100%)', 
              color: '#FFFFFF', 
              fontWeight: '700', 
              fontSize: '14px', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              boxShadow: '0 4px 14px rgba(113, 67, 254, 0.35)',
              opacity: loading ? 0.8 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <Save size={18} />
            {loading ? 'Saving Post...' : (isEditing ? 'Update Article' : 'Publish Article')}
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE CONTENT GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: activeViewMode === 'split' ? 'repeat(12, 1fr)' : '1fr',
        gap: '28px',
        alignItems: 'start'
      }}>

        {/* ── LEFT COLUMN: FORM CONTROLS ── */}
        {showEditor && (
          <div style={{ 
            gridColumn: activeViewMode === 'split' ? 'span 7' : 'span 12',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px' 
          }}>
            
            {/* Card 1: Blog Title & Slug */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #EAEAEF',
              boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F0EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7143FE' }}>
                  <PenTool size={16} />
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#111827' }}>Article Essentials</h2>
              </div>

              {/* Title Field */}
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="title" style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', display: 'block' }}>
                  Article Title <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Master Full Stack Development in 2026: Complete Career Roadmap"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '15px',
                    fontWeight: '600',
                    borderRadius: '12px',
                    border: errors.title ? '2px solid #EF4444' : '1px solid #CBD5E1',
                    outline: 'none',
                    background: '#FAFAFD',
                    color: '#1E293B',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
                {errors.title && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '13px', marginTop: '6px', fontWeight: '600' }}>
                    <AlertCircle size={14} /> {errors.title}
                  </div>
                )}
              </div>

              {/* Custom Slug Field with Live URL Badge */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="slug" style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>Custom URL Slug</label>
                  <span style={{ fontSize: '11px', color: '#7143FE', fontWeight: '700', background: '#F0EBFF', padding: '2px 8px', borderRadius: '6px' }}>
                    Auto Generated
                  </span>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '14px', fontSize: '13px', color: '#94A3B8', fontWeight: '500' }}>
                    alphabitskill.com/blog/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="full-stack-development-roadmap-2026"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 175px',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                      background: '#FAFAFD',
                      color: '#7143FE'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Cover Image Banner Upload */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #EAEAEF',
              boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F0EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7143FE' }}>
                    <FileImage size={16} />
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#111827' }}>Featured Cover Image</h2>
                </div>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Recommended: 1200 x 630 px</span>
              </div>

              {!imagePreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #7143FE',
                    borderRadius: '18px',
                    padding: '36px 20px',
                    textAlign: 'center',
                    background: '#F9F8FF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg, image/png, image/webp, image/svg+xml"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                  <div style={{ width: '56px', height: '56px', background: '#F0EBFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#7143FE', boxShadow: '0 4px 12px rgba(113, 67, 254, 0.15)' }}>
                    <UploadCloud size={28} />
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                    Drag & drop high quality cover image here, or <span style={{ color: '#7143FE', textDecoration: 'underline' }}>browse file</span>
                  </p>
                  <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '6px', margin: 0 }}>
                    Supports JPG, PNG, WebP or SVG format. Maximum filesize 5MB.
                  </p>
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  <img
                    src={imagePreview}
                    alt="Cover Preview"
                    style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%)', 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    justifyContent: 'space-between', 
                    padding: '16px' 
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '8px' }}>
                      ✓ Cover Image Set
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ 
                          fontSize: '13px', 
                          fontWeight: '600', 
                          padding: '8px 16px', 
                          borderRadius: '10px', 
                          background: '#FFFFFF', 
                          color: '#1E293B', 
                          border: 'none', 
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{ 
                          padding: '8px 12px', 
                          borderRadius: '10px', 
                          background: '#EF4444', 
                          color: '#FFFFFF', 
                          border: 'none', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                        }}
                        title="Remove Image"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg, image/png, image/webp, image/svg+xml"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Card 3: Rich Text Content Editor */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #EAEAEF',
              boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F0EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7143FE' }}>
                    <FileText size={16} />
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#111827' }}>
                    Article Content <span style={{ color: '#EF4444' }}>*</span>
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#7143FE', background: '#F0EBFF', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> Est. ~{getReadingTime(formData.content)} min read
                  </span>
                </div>
              </div>
              
              <RichTextEditor 
                value={formData.content} 
                onChange={handleContentChange} 
              />
              
              {errors.content && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '13px', marginTop: '10px', fontWeight: '600' }}>
                  <AlertCircle size={14} /> {errors.content}
                </div>
              )}

              {/* Dynamic Stats Panel */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: '12px', 
                marginTop: '16px', 
                paddingTop: '14px', 
                borderTop: '1px solid #F1F5F9', 
                fontSize: '12.5px', 
                color: '#64748B' 
              }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                    <FileText size={14} style={{ color: '#7143FE' }} /> Words: <strong style={{ color: '#1E293B' }}>{getWordCount(formData.content)}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                    <Sparkles size={14} style={{ color: '#7143FE' }} /> Characters: <strong style={{ color: '#1E293B' }}>{getCharCount(formData.content)}</strong>
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  💡 Tip: Use Headings (H2) and lists for better readability & SEO ranking.
                </div>
              </div>
            </div>

            {/* Card 4: SEO Metadata & Google SERP Snippet Preview */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #EAEAEF',
              boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F0EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7143FE' }}>
                    <Globe size={16} />
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#111827' }}>SEO & Search Metadata</h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (formData.title && !formData.metaTitle) {
                      setFormData(prev => ({ ...prev, metaTitle: prev.title }));
                    }
                  }}
                  style={{ 
                    fontSize: '12.5px', 
                    color: '#7143FE', 
                    background: '#F0EBFF', 
                    border: '1px solid #C4B5FD', 
                    padding: '6px 14px', 
                    borderRadius: '10px', 
                    cursor: 'pointer', 
                    fontWeight: '700',
                    transition: 'all 0.2s ease' 
                  }}
                >
                  Auto-Fill Meta Title
                </button>
              </div>

              {/* Meta Title */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="metaTitle" style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>Meta Title</label>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: formData.metaTitle.length > 70 ? '#EF4444' : '#64748B' }}>
                    {formData.metaTitle.length}/70 chars
                  </span>
                </div>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Development Course in Rajkot & Ahmedabad | Alphabit Skill"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    background: '#FAFAFD',
                    color: '#1E293B'
                  }}
                />
              </div>

              {/* Meta Description */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="metaDescription" style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>Meta Description</label>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: formData.metaDescription.length > 160 ? '#EF4444' : '#64748B' }}>
                    {formData.metaDescription.length}/160 chars
                  </span>
                </div>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  rows={3}
                  value={formData.metaDescription}
                  onChange={handleChange}
                  placeholder="e.g. Learn Full Stack Development with hands-on projects, industry expert mentors, and 100% placement support at Alphabit Skill..."
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: '13.5px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    background: '#FAFAFD',
                    color: '#1E293B',
                    resize: 'vertical',
                    lineHeight: '1.5'
                  }}
                />
              </div>

              {/* Google SERP Live Snippet Box */}
              <div style={{ 
                background: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                borderRadius: '14px', 
                padding: '16px', 
                fontFamily: 'arial, sans-serif' 
              }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  🔍 Google Search Result Snippet Preview
                </div>
                <div style={{ fontSize: '13px', color: '#202124', marginBottom: '2px', wordBreak: 'break-all' }}>
                  alphabitskill.com › blog › {formData.slug || 'article-slug'}
                </div>
                <div style={{ fontSize: '17px', color: '#1a0dab', fontWeight: '500', lineHeight: '1.3', marginBottom: '4px', cursor: 'pointer' }}>
                  {formData.metaTitle || formData.title || 'Your Article Title Will Appear Here'}
                </div>
                <div style={{ fontSize: '13px', color: '#4d5156', lineHeight: '1.5' }}>
                  {formData.metaDescription || 'Add a compelling meta description to optimize your blog post for search engine clicks and organic traffic.'}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── RIGHT COLUMN: REAL-TIME LIVE PREVIEW ── */}
        {showPreview && (
          <div style={{ 
            gridColumn: activeViewMode === 'split' ? 'span 5' : 'span 12',
            position: activeViewMode === 'split' ? 'sticky' : 'static',
            top: '24px'
          }}>
            
            {/* Device Header Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                <h3 style={{ fontSize: '12.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Real-time Live Sync Preview
                </h3>
              </div>

              {/* Desktop vs Mobile Device Switcher */}
              <div style={{ display: 'flex', background: '#E2E8F0', padding: '2px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    background: previewDevice === 'desktop' ? '#FFFFFF' : 'transparent',
                    color: previewDevice === 'desktop' ? '#7143FE' : '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}
                  title="Desktop Preview Width"
                >
                  <Monitor size={13} /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    background: previewDevice === 'mobile' ? '#FFFFFF' : 'transparent',
                    color: previewDevice === 'mobile' ? '#7143FE' : '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}
                  title="Mobile Viewport Width"
                >
                  <Smartphone size={13} /> Mobile
                </button>
              </div>
            </div>

            {/* Device Mockup Frame Container */}
            <div style={{
              margin: previewDevice === 'mobile' ? '0 auto' : '0',
              maxWidth: previewDevice === 'mobile' ? '380px' : '100%',
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(113, 67, 254, 0.08)',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              
              {/* Fake Browser Address Bar Header */}
              <div style={{
                background: '#F1F5F9',
                padding: '10px 16px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F56', display: 'inline-block' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFBD2E', display: 'inline-block' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27C93F', display: 'inline-block' }} />
                </div>

                <div style={{
                  flex: 1,
                  background: '#FFFFFF',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: '#64748B',
                  border: '1px solid #CBD5E1',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  🔒 https://alphabitskill.com/blog/{formData.slug || 'preview'}
                </div>
              </div>

              {/* Scrollable Live Article Viewport */}
              <div style={{ maxHeight: '720px', overflowY: 'auto', background: '#F8FAFC', padding: '20px' }}>
                
                {/* Article Header Card */}
                <div style={{ background: '#FFFFFF', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  
                  {/* Banner Image Preview */}
                  <div style={{ width: '100%', height: previewDevice === 'mobile' ? '180px' : '220px', background: '#E2E8F0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Blog Cover Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                        <FileImage size={36} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                        <p style={{ fontSize: '12px', margin: 0, fontWeight: '500' }}>Cover Image Banner</p>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '20px' }}>
                    
                    {/* Article Title */}
                    <h1 style={{ 
                      fontSize: previewDevice === 'mobile' ? '18px' : '22px', 
                      fontWeight: '800', 
                      lineHeight: '1.3', 
                      color: '#0F172A', 
                      margin: '0 0 14px' 
                    }}>
                      {formData.title || 'Untitled Article Title'}
                    </h1>

                    {/* Article Meta Bar */}
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      gap: '10px', 
                      paddingBottom: '14px', 
                      marginBottom: '16px', 
                      borderBottom: '1px solid #F1F5F9', 
                      fontSize: '12px', 
                      color: '#64748B' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#7143FE', color: '#FFFFFF', fontWeight: '800', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          AS
                        </div>
                        <span style={{ fontWeight: '700', color: '#1E293B' }}>Alphabit Skill Team</span>
                      </div>

                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        <BookOpen size={13} /> {getReadingTime(formData.content)} min read
                      </span>
                    </div>

                    {/* Meta Description Banner */}
                    {formData.metaDescription && (
                      <div style={{ 
                        padding: '12px 16px', 
                        background: '#F0EBFF', 
                        borderLeft: '4px solid #7143FE', 
                        borderRadius: '10px', 
                        fontSize: '13px', 
                        color: '#4C1D95', 
                        fontWeight: '500',
                        marginBottom: '18px' 
                      }}>
                        {formData.metaDescription}
                      </div>
                    )}

                    {/* Formatted Article Prose Content */}
                    <div className="blog-prose-content" style={{ fontSize: '14px', lineHeight: '1.75', color: '#334155' }}>
                      {formData.content && formData.content !== '<p></p>' ? (
                        <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                      ) : (
                        <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94A3B8', fontStyle: 'italic', fontSize: '13px' }}>
                          Start typing in the Rich Text Editor to preview real-time formatted content layout here...
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default BlogForm;
