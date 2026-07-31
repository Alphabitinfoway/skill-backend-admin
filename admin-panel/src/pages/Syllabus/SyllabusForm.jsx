import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Download, Link2, X } from 'lucide-react';
import api from '../../api/axios';

const SKILL_CATEGORIES = [
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

const SyllabusForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    skillSlug: 'full-stack-development',
    pdfUrl: ''
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [existingPdf, setExistingPdf] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      const fetchSyllabusItem = async () => {
        try {
          const response = await api.get(`/admin/syllabus/${id}`);
          const item = response.data.data;
          setFormData({
            skillSlug: item.skillSlug || 'full-stack-development',
            pdfUrl: item.pdfUrl || ''
          });
          if (item.pdfUrl) {
            setExistingPdf(item.pdfUrl.startsWith('http') ? item.pdfUrl : `http://localhost:5000/${item.pdfUrl}`);
          }
        } catch (error) {
          alert('Failed to fetch syllabus details');
          navigate('/syllabus');
        } finally {
          setFetching(false);
        }
      };
      fetchSyllabusItem();
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
    if (!formData.skillSlug.trim()) {
      newErrors.skillSlug = 'Please select or enter a skill slug';
    }
    if (!pdfFile && !formData.pdfUrl.trim() && !existingPdf) {
      newErrors.pdf = 'Please upload a PDF file or enter a PDF URL';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const submitData = new FormData();
    submitData.append('skillSlug', formData.skillSlug);
    submitData.append('pdfUrl', formData.pdfUrl || '');

    if (pdfFile) {
      submitData.append('pdf', pdfFile);
    }

    try {
      if (isEditing) {
        await api.put(`/admin/syllabus/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/admin/syllabus', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/syllabus');
    } catch (error) {
      console.error(error.response?.data || error.message);
      const msg = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} syllabus`;
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link to="/syllabus" className="btn btn-secondary" style={{ padding: '10px' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>
            {isEditing ? 'Edit PDF Syllabus' : 'Upload PDF Syllabus'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Select skill page slug and upload its PDF document.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Skill Slug Selection */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>1. Skill Slug</h2>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label htmlFor="skillSlug">Select Skill Page</label>
            <select
              id="skillSlug"
              name="skillSlug"
              className="input-field"
              style={{ fontSize: '15px', padding: '12px', cursor: 'pointer', marginBottom: '12px' }}
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

            <label htmlFor="customSlug" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Or type custom slug (e.g. full-stack-development):
            </label>
            <input
              type="text"
              id="customSlug"
              name="skillSlug"
              className="input-field"
              style={{ fontSize: '14px', padding: '10px' }}
              value={formData.skillSlug}
              onChange={handleChange}
              placeholder="full-stack-development"
              required
            />
            {errors.skillSlug && <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '4px' }}>{errors.skillSlug}</p>}
          </div>
        </div>

        {/* Step 2: PDF Upload */}
        <div className="card" style={{ borderLeft: '4px solid #ef4444', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText style={{ color: '#ef4444' }} /> 2. PDF Document
          </h2>

          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="pdf">Upload PDF File</label>
            <div style={{ 
              border: '2px dashed #fca5a5', 
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center',
              background: 'rgba(254, 242, 242, 0.5)'
            }}>
              {pdfFile ? (
                <div style={{ color: '#dc2626', fontWeight: '600', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FileText size={20} />
                  Selected PDF: {pdfFile.name}
                </div>
              ) : existingPdf || formData.pdfUrl ? (
                <div style={{ marginBottom: '12px' }}>
                  <a 
                    href={existingPdf || formData.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary"
                    style={{ color: '#dc2626', borderColor: '#fca5a5', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={16} /> View Current PDF
                  </a>
                </div>
              ) : (
                <FileText size={32} style={{ color: '#f87171', margin: '0 auto 12px' }} />
              )}

              <input
                type="file"
                id="pdf"
                name="pdf"
                className="input-field"
                style={{ padding: '8px', fontSize: '13px' }}
                onChange={(e) => setPdfFile(e.target.files[0])}
                accept=".pdf,application/pdf"
              />
            </div>
            {errors.pdf && <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '6px' }}>{errors.pdf}</p>}
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label htmlFor="pdfUrl" style={{ fontSize: '12px' }}>Or Paste PDF URL</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Link2 size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="url"
                id="pdfUrl"
                name="pdfUrl"
                className="input-field"
                style={{ fontSize: '14px', padding: '12px 40px 12px 38px', width: '100%' }}
                value={formData.pdfUrl}
                onChange={handleChange}
                placeholder="https://res.cloudinary.com/.../document.pdf"
              />
              {formData.pdfUrl && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, pdfUrl: '' }))}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-main) 0%, #e0e7ff 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <Link to="/syllabus" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
              <Save size={18} />
              {loading ? 'Saving...' : (isEditing ? 'Update PDF' : 'Save PDF')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SyllabusForm;
