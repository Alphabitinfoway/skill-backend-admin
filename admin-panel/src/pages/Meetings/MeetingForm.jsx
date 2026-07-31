import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, Video, Play, Link2, X, ExternalLink, Film } from 'lucide-react';
import api from '../../api/axios';

const getVideoEmbedDetails = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // YouTube match
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // Direct video file (MP4, WebM, Cloudinary, etc.)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed) || trimmed.includes('/video/upload/')) {
    return { type: 'direct', embedUrl: trimmed };
  }

  return { type: 'link', embedUrl: trimmed };
};

const SKILL_CATEGORIES = [
  {
    category: "Global",
    options: [
      { label: "🌟 All Skill Pages (Global)", value: "all" }
    ]
  },
  {
    category: "Coding Programs",
    options: [
      { label: "Full Stack Development (full-stack-development)", value: "full-stack-development" },
      { label: "Web Development (web-development)", value: "web-development" },
      { label: "Python for AI/ML (python-for-ai-ml)", value: "python-for-ai-ml" },
      { label: "Java Development (java-development)", value: "java-development" },
      { label: "Data Science & Analytics (data-science-analytics)", value: "data-science-analytics" },
      { label: "MERN Stack Development (mern-stack-development)", value: "mern-stack-development" },
      { label: ".NET Development (net-development)", value: "net-development" },
      { label: "Cyber Security (cyber-security)", value: "cyber-security" },
      { label: "Ethical Hacking (ethical-hacking)", value: "ethical-hacking" },
      { label: "QA Testing (qa-testing)", value: "qa-testing" },
      { label: "Gaming Development (gaming-development)", value: "gaming-development" },
      { label: "Cloud Computing (cloud-computing)", value: "cloud-computing" },
      { label: "Mobile App Development (mobile-app-development)", value: "mobile-app-development" }
    ]
  },
  {
    category: "Non-Coding Programs",
    options: [
      { label: "UI/UX Graphic Design (ui-ux-graphic-design)", value: "ui-ux-graphic-design" },
      { label: "ROR & Odoo & Golang (ror-odoo-golang)", value: "ror-odoo-golang" },
      { label: "E-Commerce (Shopify/WooCommerce) (e-commerce-shopify-woocommerce)", value: "e-commerce-shopify-woocommerce" },
      { label: "Digital Marketing (digital-marketing)", value: "digital-marketing" },
      { label: "Performance Marketing (performance-marketing)", value: "performance-marketing" },
      { label: "Social Media Marketing (social-media-marketing)", value: "social-media-marketing" }
    ]
  },
  {
    category: "Non-Tech Field",
    options: [
      { label: "Human Resources (HR) (human-resources-hr)", value: "human-resources-hr" },
      { label: "Business Development Executive (BDE) (business-development-executive-bde)", value: "business-development-executive-bde" },
      { label: "Account Manager (account-manager)", value: "account-manager" },
      { label: "Sales Executive (sales-executive)", value: "sales-executive" },
      { label: "Marketing Manager (marketing-manager)", value: "marketing-manager" },
      { label: "Brand Manager (brand-manager)", value: "brand-manager" },
      { label: "Purchase Manager (purchase-manager)", value: "purchase-manager" },
      { label: "Digital Marketing Manager (digital-marketing-manager)", value: "digital-marketing-manager" }
    ]
  }
];

const MeetingForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    videoUrl: '',
    skillSlug: 'all'
  });
  
  const [existingImage1, setExistingImage1] = useState(null);
  const [existingImage2, setExistingImage2] = useState(null);
  const [imageFile1, setImageFile1] = useState(null);
  const [imageFile2, setImageFile2] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      const fetchMeeting = async () => {
        try {
          const response = await api.get(`/admin/meetings/${id}`);
          const meetingData = response.data.data;
          setFormData({
            title: meetingData.title || '',
            subtitle: meetingData.subtitle || '',
            videoUrl: meetingData.videoUrl || '',
            skillSlug: meetingData.skillSlug || 'all'
          });
          if (meetingData.image1 && meetingData.image1 !== 'no-photo.jpg') {
            setExistingImage1(meetingData.image1.startsWith('http') ? meetingData.image1 : `http://localhost:5000/${meetingData.image1}`);
          }
          if (meetingData.image2 && meetingData.image2 !== 'no-photo.jpg') {
            setExistingImage2(meetingData.image2.startsWith('http') ? meetingData.image2 : `http://localhost:5000/${meetingData.image2}`);
          }
        } catch (error) {
          alert('Failed to fetch meeting details');
          navigate('/meetings');
        } finally {
          setFetching(false);
        }
      };
      fetchMeeting();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Please add a title';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot be more than 100 characters';
    }
    
    if (!formData.subtitle.trim()) {
      newErrors.subtitle = 'Please add a subtitle';
    } else if (formData.subtitle.length > 200) {
      newErrors.subtitle = 'Subtitle cannot be more than 200 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('subtitle', formData.subtitle);
    submitData.append('videoUrl', formData.videoUrl || '');
    submitData.append('skillSlug', formData.skillSlug || 'all');
    if (imageFile1) {
      submitData.append('image1', imageFile1);
    }
    if (imageFile2) {
      submitData.append('image2', imageFile2);
    }

    try {
      if (isEditing) {
        await api.put(`/admin/meetings/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/admin/meetings', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/meetings');
    } catch (error) {
      console.error(error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} meeting`;
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div>Loading...</div>;
  }

  const embedDetails = getVideoEmbedDetails(formData.videoUrl);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link to="/meetings" className="btn btn-secondary" style={{ padding: '10px' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{isEditing ? 'Edit Meeting' : 'Create New Meeting'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {isEditing ? 'Update the details of your meeting glance below.' : 'Draft a new meeting glance for your audience.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Main Content Column */}
          <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* General Info Card */}
            <div className="card">
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>General Information</h2>
              
              <div className="input-group">
                <label htmlFor="skillSlug">Target Skill Page / Course</label>
                <select
                  id="skillSlug"
                  name="skillSlug"
                  className="input-field"
                  style={{ fontSize: '15px', padding: '12px', cursor: 'pointer' }}
                  value={formData.skillSlug}
                  onChange={handleChange}
                >
                  {SKILL_CATEGORIES.map(group => (
                    <optgroup key={group.category} label={group.category}>
                      {group.options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                  Select specific skill page where this meeting & video will appear (e.g. Full Stack Development vs Web Development).
                </p>
              </div>

              <div className="input-group">
                <label htmlFor="title">Meeting Title / Heading</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="input-field"
                  style={{ fontSize: '16px', padding: '12px' }}
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. A Glance at yesterday's Meeting"
                />
                {errors.title && <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '4px' }}>{errors.title}</p>}
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="subtitle">Subtitle / Subheading</label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  className="input-field"
                  style={{ fontSize: '16px', padding: '12px' }}
                  value={formData.subtitle}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Discussing progress of batch MERN-04"
                />
                {errors.subtitle && <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '4px' }}>{errors.subtitle}</p>}
              </div>
            </div>

            {/* Enhanced Video Card */}
            <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '8px', 
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                  }}>
                    <Video size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', margin: 0 }}>Meeting Video Link</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                      Attach YouTube, Vimeo, or Cloudinary video link for frontend display
                    </p>
                  </div>
                </div>

                {formData.videoUrl && (
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                    color: '#6366f1',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Play size={12} fill="#6366f1" /> Active Link
                  </span>
                )}
              </div>

              {/* Video URL Input */}
              <div className="input-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="videoUrl" style={{ fontSize: '13px', fontWeight: '500' }}>Video URL</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Link2 size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    className="input-field"
                    style={{ fontSize: '14px', padding: '12px 40px 12px 38px', width: '100%' }}
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=... or https://res.cloudinary.com/..."
                  />
                  {formData.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))}
                      style={{ 
                        position: 'absolute', 
                        right: '12px', 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--text-muted)', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px'
                      }}
                      title="Clear video URL"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Live Video Preview Box */}
              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                marginTop: '12px'
              }}>
                {embedDetails ? (
                  <div>
                    <div style={{ 
                      padding: '10px 14px', 
                      background: 'rgba(99, 102, 241, 0.05)', 
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px'
                    }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Film size={15} style={{ color: '#6366f1' }} /> 
                        Live Video Preview ({embedDetails.type.toUpperCase()})
                      </span>
                      <a 
                        href={formData.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}
                      >
                        Open Link <ExternalLink size={12} />
                      </a>
                    </div>

                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#000' }}>
                      {embedDetails.type === 'youtube' || embedDetails.type === 'vimeo' ? (
                        <iframe
                          src={embedDetails.embedUrl}
                          title="Meeting Video Preview"
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : embedDetails.type === 'direct' ? (
                        <video 
                          controls 
                          src={embedDetails.embedUrl} 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <div style={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#fff',
                          padding: '20px',
                          textAlign: 'center'
                        }}>
                          <ExternalLink size={36} style={{ marginBottom: '10px', color: '#6366f1' }} />
                          <p style={{ margin: '0 0 8px', fontWeight: '500' }}>External Video Link Provided</p>
                          <a 
                            href={formData.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-primary" 
                            style={{ fontSize: '12px', padding: '6px 14px' }}
                          >
                            Test Video Link
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '32px 20px', 
                    textAlign: 'center', 
                    color: 'var(--text-muted)' 
                  }}>
                    <Video size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 6px', color: 'var(--text-main)' }}>
                      No Video URL Added
                    </p>
                    <p style={{ fontSize: '12px', margin: 0 }}>
                      Paste a YouTube URL, Vimeo link, or Cloudinary video link above to see the video preview.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Media & Actions Column */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Meeting Images</h2>
              
              {/* Image 1 Upload */}
              <div className="input-group">
                <label htmlFor="image1">First Image</label>
                <div style={{ 
                  border: '2px dashed var(--border-color)', 
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  textAlign: 'center',
                  background: 'var(--bg-main)',
                  marginBottom: '8px'
                }}>
                  {imageFile1 ? (
                    <p style={{ fontSize: '13px', color: 'var(--primary)', marginBottom: '8px', fontWeight: '500' }}>
                      Selected: {imageFile1.name}
                    </p>
                  ) : existingImage1 ? (
                    <div style={{ marginBottom: '8px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <img src={existingImage1} alt="Current Cover 1" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '100px', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                    </>
                  )}
                  <input
                    type="file"
                    id="image1"
                    name="image1"
                    className="input-field"
                    style={{ padding: '4px', fontSize: '12px' }}
                    onChange={(e) => setImageFile1(e.target.files[0])}
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Image 2 Upload */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="image2">Second Image</label>
                <div style={{ 
                  border: '2px dashed var(--border-color)', 
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  textAlign: 'center',
                  background: 'var(--bg-main)'
                }}>
                  {imageFile2 ? (
                    <p style={{ fontSize: '13px', color: 'var(--primary)', marginBottom: '8px', fontWeight: '500' }}>
                      Selected: {imageFile2.name}
                    </p>
                  ) : existingImage2 ? (
                    <div style={{ marginBottom: '8px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <img src={existingImage2} alt="Current Cover 2" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '100px', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                    </>
                  )}
                  <input
                    type="file"
                    id="image2"
                    name="image2"
                    className="input-field"
                    style={{ padding: '4px', fontSize: '12px' }}
                    onChange={(e) => setImageFile2(e.target.files[0])}
                    accept="image/*"
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-main) 0%, #e0e7ff 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <Link to="/meetings" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                  <Save size={18} />
                  {loading ? 'Saving...' : (isEditing ? 'Update' : 'Publish')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;
