import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Eye, 
  Edit3, 
  HelpCircle,
  Sparkles,
  Columns,
  Maximize2,
  CheckCircle2,
  FileText,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Type,
  AlignLeft,
  Lightbulb,
  Milestone,
  List,
  HelpCircle as FaqIcon,
  MousePointerClick
} from 'lucide-react';
import api from '../../api/axios';

/* ─── Convert Text Content to Structured Visual Blocks ─────────────── */
function parseTextToBlocks(text) {
  if (!text || !text.trim()) {
    return [
      { id: Date.now() + 1, type: 'heading', value: 'Quick Answer' },
      { id: Date.now() + 2, type: 'paragraph', value: 'Write your introductory section paragraph here...' }
    ];
  }

  const rawBlocks = text
    .split(/\r?\n\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const parsed = [];

  rawBlocks.forEach((block, index) => {
    const lower = block.toLowerCase();
    
    // Skip raw meta lines if present
    if (lower.startsWith("meta title") || lower.startsWith("meta description") || lower.startsWith("url\n") || lower === "url") {
      return;
    }

    // Takeaway Match
    const takeawayMatch = block.match(/^(key takeaway|takeaway|summary|pro tip|important|note|highlights|conclusion)[:\-]?\s*(.*)/i);
    if (takeawayMatch) {
      parsed.push({
        id: Date.now() + index + Math.random(),
        type: 'takeaway',
        label: takeawayMatch[1],
        value: takeawayMatch[2] || block
      });
      return;
    }

    // Stage / Step Match
    const stageMatch = block.match(/^(stage|step|phase|part|module)\s*(\d+)?[:\-]?\s*(.*)/i);
    if (stageMatch) {
      parsed.push({
        id: Date.now() + index + Math.random(),
        type: 'stage',
        num: stageMatch[2] || '1',
        title: stageMatch[3] || block
      });
      return;
    }

    // CTA Banner Match
    if (block.startsWith("👉") || lower.startsWith("cta:") || lower.startsWith("[cta]")) {
      const cleanText = block.replace(/^(👉|cta:|\[cta\])\s*(Primary CTA:|Secondary CTA:)?\s*/i, "").trim();
      parsed.push({
        id: Date.now() + index + Math.random(),
        type: 'cta',
        value: cleanText
      });
      return;
    }

    // Bullet List Match
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const bulletRegex = /^([•\-\*]|->|>|\d+[\.\)])\s+/;
    if (lines.some(l => bulletRegex.test(l))) {
      const cleanItems = lines.map(l => l.replace(bulletRegex, "")).join("\n");
      parsed.push({
        id: Date.now() + index + Math.random(),
        type: 'bullets',
        value: cleanItems
      });
      return;
    }

    // FAQ Q&A Match
    const faqMatch = block.match(/^([^\?]{5,120}\?)\s*(.+)$/s);
    if (faqMatch && !/^(should you|why is|what does)/i.test(block)) {
      parsed.push({
        id: Date.now() + index + Math.random(),
        type: 'faq',
        question: faqMatch[1].trim(),
        answer: faqMatch[2].trim()
      });
      return;
    }

    // Heading Match
    const isMarkdownHeading = /^#{1,4}\s+/.test(block);
    const isHeading =
      isMarkdownHeading ||
      (block.length < 95 && !block.endsWith(".") && !block.endsWith(",") && !block.includes("\n")) ||
      /^(quick answer|why is|should you|full stack vs|common mistakes|career opportunities|salary expectations|is full stack|frequently asked|final thoughts|ready to start|skills employers)/i.test(block);

    if (isHeading) {
      parsed.push({
        id: Date.now() + index + Math.random(),
        type: 'heading',
        value: block.replace(/^#{1,4}\s+/, "").trim()
      });
      return;
    }

    // Standard Paragraph
    parsed.push({
      id: Date.now() + index + Math.random(),
      type: 'paragraph',
      value: block
    });
  });

  return parsed.length > 0 ? parsed : [
    { id: Date.now(), type: 'paragraph', value: text }
  ];
}

/* ─── Convert Visual Blocks back to Clean Text Content ─────────────── */
function blocksToTextContent(blocks) {
  return blocks.map(b => {
    if (b.type === 'heading') {
      return b.value.trim();
    }
    if (b.type === 'takeaway') {
      return `Key Takeaway: ${b.value.trim()}`;
    }
    if (b.type === 'stage') {
      return `Stage ${b.num || 1}: ${b.title.trim()}`;
    }
    if (b.type === 'bullets') {
      const items = b.value.split(/\r?\n/).map(i => i.trim()).filter(Boolean);
      return items.map(item => `• ${item}`).join('\n');
    }
    if (b.type === 'faq') {
      return `${b.question.trim()} ${b.answer.trim()}`;
    }
    if (b.type === 'cta') {
      return `👉 Primary CTA: ${b.value.trim()}`;
    }
    return b.value.trim();
  }).filter(Boolean).join('\n\n');
}

/* ─── Live Preview Renderer for Admin Panel ───────────────────────── */
function PreviewRenderer({ content, title, image }) {
  if (!content) {
    return (
      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '40px 20px', textAlign: 'center' }}>
        No content written yet. Add sections in "Visual Builder" or switch to "Write" mode.
      </div>
    );
  }

  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    return (
      <div 
        style={{ fontSize: '15px', lineHeight: '1.85', color: '#333' }}
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  const rawBlocks = content
    .split(/\r?\n\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const blocks = rawBlocks.filter((b) => {
    const lower = b.toLowerCase();
    return !lower.startsWith("meta title") && !lower.startsWith("meta description") && !lower.startsWith("url\n") && lower !== "url";
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '15px', lineHeight: '1.85', color: '#333' }}>
      {blocks.map((block, idx) => {
        // Meta header block
        if (block.toLowerCase().startsWith("last updated") || block.toLowerCase().startsWith("written by")) {
          const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
          return (
            <div key={idx} style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px',
              padding: '10px 14px', borderRadius: '10px', background: '#F0F0F5',
              border: '1px solid #E0E0E8', fontSize: '13px', color: '#555', fontWeight: '500'
            }}>
              {lines.map((line, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {i > 0 && <span style={{ color: '#CCC' }}>•</span>}
                  {line}
                </span>
              ))}
            </div>
          );
        }

        // Key Takeaway / Highlight Box
        const takeawayMatch = block.match(/^(key takeaway|takeaway|summary|pro tip|important|note|highlights|conclusion)[:\-]?\s*(.*)/i);
        if (takeawayMatch) {
          const label = takeawayMatch[1].toUpperCase();
          const takeawayText = takeawayMatch[2] || block;
          return (
            <div key={idx} style={{
              margin: '12px 0', padding: '16px 20px', borderRadius: '14px',
              background: '#F3EFFF', borderLeft: '4px solid #7143FE',
              color: '#111', fontWeight: '500', boxShadow: '0 2px 8px rgba(113,67,254,0.06)'
            }}>
              <span style={{ color: '#7143FE', fontWeight: '700', display: 'block', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ✦ {label}
              </span>
              {takeawayText}
            </div>
          );
        }

        // Comparison Table block
        if ((block.includes("Your Goal") && block.includes("Recommended Learning Path")) || block.includes("| --- |")) {
          const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          const rows = [];
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes("---") || lines[i] === "Your Goal" || lines[i] === "Recommended Learning Path") continue;
            const parts = lines[i].includes("|") ? lines[i].split("|").map(p => p.trim()).filter(Boolean) : null;
            if (parts && parts.length >= 2) {
              rows.push({ goal: parts[0], path: parts[1] });
            } else if (i + 1 < lines.length) {
              rows.push({ goal: lines[i], path: lines[i + 1] });
              i++;
            }
          }
          if (rows.length > 0) {
            return (
              <div key={idx} style={{ margin: '16px 0', borderRadius: '14px', border: '1px solid #E4E4E9', overflow: 'hidden', background: '#FFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#F4F2FF', borderBottom: '1px solid #E0DAFE', color: '#7143FE', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800' }}>
                      <th style={{ padding: '12px 16px' }}>Your Goal</th>
                      <th style={{ padding: '12px 16px' }}>Recommended Learning Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: rIdx === rows.length - 1 ? 'none' : '1px solid #F0F0F5' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#111' }}>{r.goal}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#F0EBFF', color: '#7143FE', fontWeight: '700', fontSize: '12px' }}>
                            {r.path}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // Stage / Step Sub-Headings
        const stageMatch = block.match(/^(stage|step|phase|part|module)\s*(\d+)?[:\-]?\s*(.*)/i);
        if (stageMatch) {
          const badgeLabel = stageMatch[1].toUpperCase();
          const stageNum = stageMatch[2] || "";
          const stageTitle = stageMatch[3] || block;

          return (
            <div key={idx} style={{ marginTop: '16px', marginBottom: '8px', padding: '12px 16px', borderRadius: '12px', background: '#F7F5FF', borderLeft: '4px solid #7143FE', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ padding: '6px 12px', borderRadius: '8px', background: '#7143FE', color: '#FFF', fontWeight: '800', fontSize: '13px' }}>
                {badgeLabel} {stageNum}
              </span>
              <span style={{ fontWeight: '700', color: '#111', fontSize: '16px' }}>
                {stageTitle}
              </span>
            </div>
          );
        }

        // CTA block
        if (block.startsWith("👉") || block.toLowerCase().startsWith("cta:") || block.toLowerCase().startsWith("[cta]")) {
          const text = block.replace(/^(👉|cta:|\[cta\])\s*(Primary CTA:|Secondary CTA:)?\s*/i, "");
          const isSecondary = block.toLowerCase().includes("secondary") || block.toLowerCase().includes("counseling");
          return (
            <div key={idx} style={{
              margin: '16px 0', padding: '16px 20px', borderRadius: '14px',
              background: isSecondary ? '#F0EBFF' : '#7143FE',
              color: isSecondary ? '#7143FE' : '#FFF', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              border: isSecondary ? '1px solid #7143FE' : 'none'
            }}>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>👉 {text}</span>
              <span style={{
                padding: '8px 18px', borderRadius: '20px',
                background: isSecondary ? '#7143FE' : '#FFF',
                color: isSecondary ? '#FFF' : '#7143FE',
                fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap'
              }}>
                {isSecondary ? "Book Session" : "Explore Course"}
              </span>
            </div>
          );
        }

        // FAQ Q&A Match
        const faqMatch = block.match(/^([^\?]{5,120}\?)\s*(.+)$/s);
        if (faqMatch && !/^(should you|why is|what does)/i.test(block)) {
          return (
            <div key={idx} style={{ margin: '8px 0', padding: '14px 18px', borderRadius: '12px', background: '#FFF', border: '1px solid #E4E4E9' }}>
              <div style={{ fontWeight: '700', color: '#111', marginBottom: '6px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#F4F2FF', color: '#7143FE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>Q</span>
                {faqMatch[1]}
              </div>
              <div style={{ color: '#444', fontSize: '14px', lineHeight: '1.7', paddingLeft: '30px' }}>
                {faqMatch[2]}
              </div>
            </div>
          );
        }

        // Section Headings
        const isMarkdownHeading = /^#{1,4}\s+/.test(block);
        const cleanHeadingText = block.replace(/^#{1,4}\s+/, "").trim();

        const isHeading =
          isMarkdownHeading ||
          (block.length < 95 && !block.endsWith(".") && !block.endsWith(",") && !block.includes("\n")) ||
          /^(quick answer|why is|should you|full stack vs|common mistakes|career opportunities|salary expectations|is full stack|frequently asked|final thoughts|ready to start|skills employers)/i.test(block);

        if (isHeading) {
          return (
            <h2 key={idx} style={{ fontSize: '22px', fontWeight: '700', color: '#111', marginTop: '24px', marginBottom: '10px' }}>
              {cleanHeadingText}
            </h2>
          );
        }

        // List block
        const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const bulletRegex = /^([•\-\*]|->|>|\d+[\.\)])\s+/;
        const hasBulletLines = lines.some(l => bulletRegex.test(l));

        if (hasBulletLines) {
          return (
            <ul key={idx} style={{ paddingLeft: '12px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lines.map((line, lIdx) => (
                <li key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#333' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7143FE', marginTop: '9px', flexShrink: 0 }} />
                  <span>{line.replace(bulletRegex, "")}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Standard Paragraph
        return (
          <p key={idx} style={{ color: '#333', marginBottom: '10px' }}>
            {lines.map((line, lIdx) => {
              const labelMatch = line.match(/^([^—:]{3,45})([—:])\s*(.*)$/);
              if (labelMatch && !line.startsWith("http") && !line.toLowerCase().startsWith("stage")) {
                return (
                  <span key={lIdx} style={{ display: 'block', marginBottom: '6px' }}>
                    <strong style={{ color: '#111', fontWeight: '700' }}>{labelMatch[1]}{labelMatch[2]} </strong>
                    {labelMatch[3]}
                  </span>
                );
              }
              return (
                <span key={lIdx} style={{ display: lIdx > 0 ? 'block' : 'inline', marginTop: lIdx > 0 ? '6px' : '0' }}>
                  {line}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

/* ─── Main Blog Form Component ─────────────────────────────────────── */
const BlogForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    ctaLink: '',
    content: ''
  });

  const [blocks, setBlocks] = useState([]);
  const [existingImage, setExistingImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'write' | 'preview' | 'split'

  useEffect(() => {
    if (isEditing) {
      const fetchBlog = async () => {
        try {
          const response = await api.get(`/admin/blogs/${id}`);
          const blogData = response.data.data;
          const loadedContent = blogData.content || '';
          setFormData({
            title: blogData.title || '',
            slug: blogData.slug || '',
            metaTitle: blogData.metaTitle || '',
            metaDescription: blogData.metaDescription || '',
            ctaLink: blogData.ctaLink || '',
            content: loadedContent
          });
          setBlocks(parseTextToBlocks(loadedContent));
          if (blogData.image && blogData.image !== 'no-photo.jpg') {
            const imgUrl = blogData.image.startsWith('http') ? blogData.image : `http://localhost:5000/${blogData.image}`;
            setExistingImage(imgUrl);
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
    } else {
      // Default initial blocks for new post
      setBlocks([
        { id: 1, type: 'heading', value: 'Why Is Full Stack Development Still in Demand?' },
        { id: 2, type: 'paragraph', value: 'Digital transformation is no longer limited to large technology companies. Businesses of every size depend on modern web applications.' },
        { id: 3, type: 'takeaway', value: 'Full Stack Development provides career flexibility and prepares you for a wide range of software development opportunities.' }
      ]);
    }
  }, [id, isEditing, navigate]);

  // Synchronize blocks to formData.content when blocks update in Visual Builder
  const syncBlocksToContent = (updatedBlocks) => {
    setBlocks(updatedBlocks);
    const generatedText = blocksToTextContent(updatedBlocks);
    setFormData(prev => ({ ...prev, content: generatedText }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If typing in raw write mode, update visual blocks too
    if (name === 'content') {
      setBlocks(parseTextToBlocks(value));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  /* Visual Block Operations */
  const addBlock = (type) => {
    const newBlock = {
      id: Date.now() + Math.random(),
      type,
      value: type === 'heading' ? 'Section Heading Title' :
             type === 'takeaway' ? 'Write key takeaway message here...' :
             type === 'bullets' ? 'Point One\nPoint Two\nPoint Three' :
             type === 'cta' ? 'Explore Full Stack Course' : 'Write text details here...',
      num: '1',
      title: 'Stage Title',
      question: 'Is Full Stack Development worth learning?',
      answer: 'Yes, it provides broad skills and excellent career flexibility.'
    };
    syncBlocksToContent([...blocks, newBlock]);
  };

  const updateBlock = (id, key, val) => {
    const updated = blocks.map(b => b.id === id ? { ...b, [key]: val } : b);
    syncBlocksToContent(updated);
  };

  const deleteBlock = (id) => {
    const updated = blocks.filter(b => b.id !== id);
    syncBlocksToContent(updated);
  };

  const moveBlock = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    syncBlocksToContent(updated);
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
    
    const finalContent = formData.content || blocksToTextContent(blocks);
    if (!finalContent.trim()) {
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
    submitData.append('ctaLink', formData.ctaLink || '');
    submitData.append('content', finalContent);
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

  const wordCount = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;
  const charCount = formData.content.length;

  if (fetching) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading blog details...</div>;
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/blogs" className="btn btn-secondary" style={{ padding: '10px', borderRadius: '12px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
              {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {isEditing ? 'Update your article details and content below.' : 'Draft a beautifully structured blog post using simple visual sections.'}
            </p>
          </div>
        </div>

        {/* Top Save / Cancel Action */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/blogs" className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px' }}>Cancel</Link>
          <button 
            type="button" 
            onClick={handleSubmit} 
            className="btn btn-primary" 
            disabled={loading} 
            style={{ padding: '10px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} />
            {loading ? 'Saving...' : (isEditing ? 'Update Blog' : 'Publish Blog')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* ── LEFT COLUMN: Title, Visual Section Builder / Raw Editor / Live Preview ── */}
          <div style={{ flex: '1 1 720px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Title Card */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="title" style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Blog Title <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="input-field"
                  style={{ fontSize: '17px', fontWeight: '600', padding: '14px 16px', borderRadius: '12px' }}
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Should You Learn Full Stack Development in 2026? Honest Guide"
                />
                {errors.title && <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '6px' }}>{errors.title}</p>}
              </div>
            </div>

            {/* Main Content Card with Mode Tabs */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
              
              {/* Tab Mode Selector Header */}
              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
              }}>
                <div style={{ display: 'flex', background: '#F0F0F5', padding: '4px', borderRadius: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('builder')}
                    style={{
                      padding: '9px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px',
                      background: activeTab === 'builder' ? '#7143FE' : 'transparent',
                      color: activeTab === 'builder' ? '#FFF' : '#555',
                      boxShadow: activeTab === 'builder' ? '0 2px 8px rgba(113,67,254,0.3)' : 'none'
                    }}
                  >
                    <LayoutGrid size={15} /> 🧩 Easy Visual Builder
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('write')}
                    style={{
                      padding: '9px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                      background: activeTab === 'write' ? '#FFF' : 'transparent',
                      color: activeTab === 'write' ? '#7143FE' : '#555',
                      boxShadow: activeTab === 'write' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                    }}
                  >
                    <Edit3 size={15} /> 📝 Raw Text
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    style={{
                      padding: '9px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                      background: activeTab === 'preview' ? '#FFF' : 'transparent',
                      color: activeTab === 'preview' ? '#7143FE' : '#555',
                      boxShadow: activeTab === 'preview' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                    }}
                  >
                    <Eye size={15} /> 👁️ Live Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('split')}
                    style={{
                      padding: '9px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                      background: activeTab === 'split' ? '#FFF' : 'transparent',
                      color: activeTab === 'split' ? '#7143FE' : '#555',
                      boxShadow: activeTab === 'split' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                    }}
                  >
                    <Columns size={15} /> ↔️ Split View
                  </button>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                  {wordCount} words · {charCount} chars
                </div>
              </div>

              {/* ── MODE 1: EASY VISUAL BUILDER (Easiest way to write blogs!) ── */}
              {activeTab === 'builder' ? (
                <div>
                  <div style={{ background: '#F8F7FF', border: '1px solid #E8E2FF', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', fontSize: '13px', color: '#555', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={18} style={{ color: '#7143FE', flexShrink: 0 }} />
                    <span>
                      <strong>Super Easy Mode:</strong> Add sections one by one below. The frontend website automatically formats them into beautiful cards, purple callouts, and badge components!
                    </span>
                  </div>

                  {/* List of Section Blocks */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    {blocks.map((block, idx) => (
                      <div 
                        key={block.id} 
                        style={{ 
                          border: '1px solid #E2E2EC', borderRadius: '14px', padding: '18px', 
                          background: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', position: 'relative' 
                        }}
                      >
                        {/* Block Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #F0F0F5', paddingBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px' }}>
                            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#7143FE', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                              {idx + 1}
                            </span>
                            {block.type === 'heading' && <span style={{ color: '#111' }}>📌 Section Heading</span>}
                            {block.type === 'paragraph' && <span style={{ color: '#333' }}>📝 Paragraph Content</span>}
                            {block.type === 'takeaway' && <span style={{ color: '#7143FE' }}>💡 Key Takeaway Card</span>}
                            {block.type === 'stage' && <span style={{ color: '#059669' }}>🚀 Stage / Step Badge Card</span>}
                            {block.type === 'bullets' && <span style={{ color: '#7143FE' }}>• Bullet List Items</span>}
                            {block.type === 'faq' && <span style={{ color: '#2563EB' }}>❓ FAQ Accordion Card</span>}
                            {block.type === 'cta' && <span style={{ color: '#D97706' }}>👉 Action CTA Banner</span>}
                          </div>

                          {/* Block Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => moveBlock(idx, -1)}
                              disabled={idx === 0}
                              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #E0E0E0', background: '#FFF', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1 }}
                              title="Move Up"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlock(idx, 1)}
                              disabled={idx === blocks.length - 1}
                              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #E0E0E0', background: '#FFF', cursor: idx === blocks.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === blocks.length - 1 ? 0.4 : 1 }}
                              title="Move Down"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBlock(block.id)}
                              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}
                              title="Delete Block"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Block Inputs Based on Type */}
                        {block.type === 'heading' && (
                          <input
                            type="text"
                            className="input-field"
                            value={block.value}
                            onChange={(e) => updateBlock(block.id, 'value', e.target.value)}
                            placeholder="e.g. Why Is Full Stack Development Still in Demand?"
                            style={{ fontSize: '16px', fontWeight: '700', padding: '10px 14px', borderRadius: '10px' }}
                          />
                        )}

                        {block.type === 'paragraph' && (
                          <textarea
                            className="input-field"
                            rows={4}
                            value={block.value}
                            onChange={(e) => updateBlock(block.id, 'value', e.target.value)}
                            placeholder="Write your paragraph content here..."
                            style={{ fontSize: '14px', lineHeight: '1.7', padding: '12px 14px', borderRadius: '10px', resize: 'vertical' }}
                          />
                        )}

                        {block.type === 'takeaway' && (
                          <textarea
                            className="input-field"
                            rows={2}
                            value={block.value}
                            onChange={(e) => updateBlock(block.id, 'value', e.target.value)}
                            placeholder="Write your key takeaway or highlight summary message..."
                            style={{ fontSize: '14px', lineHeight: '1.6', padding: '12px 14px', borderRadius: '10px', borderLeft: '4px solid #7143FE', background: '#F9F7FF' }}
                          />
                        )}

                        {block.type === 'stage' && (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                              type="text"
                              className="input-field"
                              value={block.num}
                              onChange={(e) => updateBlock(block.id, 'num', e.target.value)}
                              placeholder="Num (e.g. 1)"
                              style={{ width: '80px', fontSize: '14px', padding: '10px', borderRadius: '10px', textAlign: 'center', fontWeight: '700' }}
                            />
                            <input
                              type="text"
                              className="input-field"
                              value={block.title}
                              onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                              placeholder="Stage Title (e.g. Understanding the Fundamentals)"
                              style={{ flex: 1, fontSize: '15px', fontWeight: '600', padding: '10px 14px', borderRadius: '10px' }}
                            />
                          </div>
                        )}

                        {block.type === 'bullets' && (
                          <div>
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                              Write list points (one per line):
                            </label>
                            <textarea
                              className="input-field"
                              rows={4}
                              value={block.value}
                              onChange={(e) => updateBlock(block.id, 'value', e.target.value)}
                              placeholder="Solve real-world problems&#10;Think logically and analytically&#10;Debug applications efficiently"
                              style={{ fontSize: '14px', lineHeight: '1.6', padding: '12px 14px', borderRadius: '10px', resize: 'vertical' }}
                            />
                          </div>
                        )}

                        {block.type === 'faq' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input
                              type="text"
                              className="input-field"
                              value={block.question}
                              onChange={(e) => updateBlock(block.id, 'question', e.target.value)}
                              placeholder="Question (e.g. Is Full Stack Development worth learning in 2026?)"
                              style={{ fontSize: '14px', fontWeight: '600', padding: '10px 14px', borderRadius: '10px' }}
                            />
                            <textarea
                              className="input-field"
                              rows={2}
                              value={block.answer}
                              onChange={(e) => updateBlock(block.id, 'answer', e.target.value)}
                              placeholder="Answer text details..."
                              style={{ fontSize: '14px', lineHeight: '1.6', padding: '10px 14px', borderRadius: '10px' }}
                            />
                          </div>
                        )}

                        {block.type === 'cta' && (
                          <input
                            type="text"
                            className="input-field"
                            value={block.value}
                            onChange={(e) => updateBlock(block.id, 'value', e.target.value)}
                            placeholder="CTA Action Text (e.g. Explore the Complete Full Stack Learning Roadmap)"
                            style={{ fontSize: '14px', fontWeight: '600', padding: '10px 14px', borderRadius: '10px', background: '#F0EBFF', color: '#7143FE' }}
                          />
                        )}

                      </div>
                    ))}
                  </div>

                  {/* Add New Block Selector Toolbar */}
                  <div style={{ background: '#F4F2FF', padding: '16px 20px', borderRadius: '16px', border: '1px solid #E0DAFE' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#7143FE', marginBottom: '12px' }}>
                      + Add Next Section Block:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => addBlock('heading')}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #DCDCDC', background: '#FFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Type size={14} /> + Heading
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('paragraph')}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #DCDCDC', background: '#FFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <AlignLeft size={14} /> + Paragraph
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('takeaway')}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #7143FE', background: '#FFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#7143FE', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Lightbulb size={14} /> + Key Takeaway
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('stage')}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #059669', background: '#ECFDF5', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Milestone size={14} /> + Stage Badge
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('bullets')}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #DCDCDC', background: '#FFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <List size={14} /> + Bullet List
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('faq')}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #2563EB', background: '#EFF6FF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <FaqIcon size={14} /> + FAQ Q&A
                      </button>
                      <button
                        type="button"
                        onClick={() => addBlock('cta')}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #7143FE', background: '#7143FE', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <MousePointerClick size={14} /> + CTA Banner
                      </button>
                    </div>
                  </div>

                </div>
              ) : activeTab === 'split' ? (
                /* SIDE-BY-SIDE SPLIT VIEW */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: '680px' }}>
                  <div>
                    <textarea
                      ref={textareaRef}
                      id="content"
                      name="content"
                      className="input-field"
                      value={formData.content}
                      onChange={handleChange}
                      required
                      placeholder="Write your article content here..."
                      style={{ 
                        width: '100%', height: '100%', resize: 'vertical', fontSize: '15px', lineHeight: '1.75', 
                        padding: '18px', borderRadius: '12px', fontFamily: 'inherit', minHeight: '650px' 
                      }}
                    />
                  </div>
                  <div style={{ 
                    background: '#F9F9FB', border: '1px solid #EAEAEA', borderRadius: '12px', 
                    padding: '24px', overflowY: 'auto', maxHeight: '680px' 
                  }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#7143FE', fontWeight: '700', marginBottom: '12px' }}>
                      Live Preview (Frontend UI)
                    </div>
                    <PreviewRenderer content={formData.content} title={formData.title} image={imagePreview} />
                  </div>
                </div>
              ) : activeTab === 'write' ? (
                /* WRITE MODE */
                <div>
                  <textarea
                    ref={textareaRef}
                    id="content"
                    name="content"
                    className="input-field"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    placeholder="Write your article content here... Separate paragraphs with empty lines. Headings, bullet points, and takeaways are automatically detected and styled."
                    rows={26}
                    style={{ 
                      width: '100%', resize: 'vertical', fontSize: '15px', lineHeight: '1.75', 
                      padding: '20px', borderRadius: '14px', fontFamily: 'inherit', minHeight: '600px' 
                    }}
                  />
                  {errors.content && <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '6px' }}>{errors.content}</p>}

                  {/* Character & Word Count */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span>💡 Tip: Switch to "Easy Visual Builder" above to edit section cards visually!</span>
                    <span style={{ fontWeight: '600', background: '#F0EBFF', color: '#7143FE', padding: '4px 12px', borderRadius: '20px' }}>
                      {wordCount} words · {charCount} characters
                    </span>
                  </div>
                </div>
              ) : (
                /* LIVE PREVIEW MODE */
                <div style={{ 
                  background: '#F9F9FB', border: '1px solid #EAEAEA', borderRadius: '14px', 
                  padding: '24px sm:32px', minHeight: '550px' 
                }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#7143FE', fontWeight: '700', marginBottom: '12px' }}>
                    Live Preview (Frontend Appearance)
                  </div>
                  {formData.title && (
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111', lineHeight: '1.3', marginBottom: '20px' }}>
                      {formData.title}
                    </h1>
                  )}
                  {imagePreview && (
                    <div style={{ width: '100%', height: '260px', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px', background: '#DDD' }}>
                      <img src={imagePreview} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <PreviewRenderer content={formData.content} title={formData.title} image={imagePreview} />
                </div>
              )}

            </div>
          </div>

          {/* ── RIGHT SIDEBAR: Cover Image, Slug, Meta, CTA Link, Formatting Hints ── */}
          <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Cover Image Upload Card */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Cover Image Banner</h2>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <div style={{ 
                  border: '2px dashed var(--border-color)', 
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  background: 'var(--bg-main)'
                }}>
                  {imagePreview ? (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ borderRadius: '10px', overflow: 'hidden', maxHeight: '160px', marginBottom: '10px', border: '1px solid var(--border-color)' }}>
                        <img src={imagePreview} alt="Selected Cover" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                      </div>
                      <p style={{ fontSize: '12px', color: '#7143FE', fontWeight: '600', wordBreak: 'break-all' }}>
                        {imageFile ? imageFile.name : 'Current Image'}
                      </p>
                    </div>
                  ) : (
                    <div style={{ padding: '10px 0' }}>
                      <ImageIcon size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Upload blog cover banner image
                      </p>
                    </div>
                  )}

                  <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' }}>
                    <ImageIcon size={16} /> {imagePreview ? 'Change Image' : 'Select Image'}
                    <input
                      type="file"
                      id="image"
                      name="image"
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Writing Hints & Details Card */}
            <div className="card" style={{ padding: '22px', borderRadius: '16px', background: '#F8F7FF', border: '1px solid #E4DCFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <HelpCircle size={20} style={{ color: '#7143FE' }} />
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>
                  Easy Section Builder Guide
                </h2>
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '14px', lineHeight: '1.4' }}>
                Use <strong>🧩 Easy Visual Builder</strong> on the left to add sections cleanly. No coding or syntax required!
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #EAEAEA' }}>
                  <span style={{ fontWeight: '700', color: '#7143FE', display: 'block', marginBottom: '2px' }}>📌 Headings & Paragraphs:</span>
                  <span style={{ fontSize: '11px', color: '#555' }}>Add headings & paragraphs to structure your article cleanly.</span>
                </div>

                <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #EAEAEA' }}>
                  <span style={{ fontWeight: '700', color: '#7143FE', display: 'block', marginBottom: '2px' }}>💡 Key Takeaways:</span>
                  <span style={{ fontSize: '11px', color: '#555' }}>Creates highlighted purple takeaway callout cards.</span>
                </div>

                <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #EAEAEA' }}>
                  <span style={{ fontWeight: '700', color: '#7143FE', display: 'block', marginBottom: '2px' }}>🚀 Stages & Steps:</span>
                  <span style={{ fontSize: '11px', color: '#555' }}>Creates roadmap stage badges (Stage 1, Step 1, etc.).</span>
                </div>

                <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #EAEAEA' }}>
                  <span style={{ fontWeight: '700', color: '#7143FE', display: 'block', marginBottom: '2px' }}>❓ FAQ Accordions:</span>
                  <span style={{ fontSize: '11px', color: '#555' }}>Creates interactive collapsible Q&A accordions.</span>
                </div>
              </div>
            </div>

            {/* Custom Slug Card */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>URL Slug</h2>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="slug" style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Custom Slug (Optional)</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  className="input-field"
                  style={{ fontSize: '14px', padding: '10px 14px', borderRadius: '8px' }}
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="e.g. should-you-learn-full-stack-development-2026"
                />
                {errors.slug && <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '4px' }}>{errors.slug}</p>}
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                  Leave blank to auto-generate slug from title.
                </p>
              </div>
            </div>

            {/* SEO Meta Settings Card */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} style={{ color: '#7143FE' }} /> SEO Metadata
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.title && !formData.metaTitle) {
                      setFormData(prev => ({ ...prev, metaTitle: prev.title }));
                    }
                  }}
                  style={{ fontSize: '12px', color: '#7143FE', background: '#F0EBFF', border: '1px solid #7143FE', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Auto-Fill
                </button>
              </div>

              {/* Meta Title */}
              <div className="input-group" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="metaTitle" style={{ fontSize: '13px', fontWeight: '600' }}>Meta Title</label>
                  <span style={{ fontSize: '11px', color: formData.metaTitle.length > 70 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {formData.metaTitle.length}/70 chars
                  </span>
                </div>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  className="input-field"
                  style={{ fontSize: '14px', padding: '10px 14px', borderRadius: '8px' }}
                  value={formData.metaTitle}
                  onChange={handleChange}
                  placeholder="e.g. Should You Learn Full Stack Development in 2026? Honest Guide"
                />
              </div>

              {/* Meta Description */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="metaDescription" style={{ fontSize: '13px', fontWeight: '600' }}>Meta Description</label>
                  <span style={{ fontSize: '11px', color: formData.metaDescription.length > 160 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {formData.metaDescription.length}/160 chars
                  </span>
                </div>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  rows={3}
                  className="input-field"
                  style={{ fontSize: '13px', padding: '10px 14px', borderRadius: '8px', resize: 'vertical' }}
                  value={formData.metaDescription}
                  onChange={handleChange}
                  placeholder="e.g. A realistic look at full stack development in 2026 — who it's actually for..."
                />
              </div>
            </div>

            {/* CTA Button Link Card */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                👉 CTA Button Target URL
              </h2>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="ctaLink" style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Course / Page Link (Optional)</label>
                <input
                  type="text"
                  id="ctaLink"
                  name="ctaLink"
                  className="input-field"
                  style={{ fontSize: '14px', padding: '10px 14px', borderRadius: '8px' }}
                  value={formData.ctaLink}
                  onChange={handleChange}
                  placeholder="e.g. /courses/full-stack or /register"
                />
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                  Target link URL for CTA buttons inside this blog post (defaults to <code>/register</code> if left blank).
                </p>
              </div>
            </div>

            {/* Bottom Actions Card */}
            <div className="card" style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, #F5F5F7 0%, #ECE9FF 100%)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to="/blogs" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', borderRadius: '10px' }}>Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} />
                  {loading ? 'Saving...' : (isEditing ? 'Update Blog' : 'Publish Blog')}
                </button>
              </div>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
};

export default BlogForm;
