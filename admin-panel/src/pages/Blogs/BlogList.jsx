import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, FileText, RefreshCw, BookOpen, ExternalLink } from 'lucide-react';
import api from '../../api/axios';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/blogs').catch(() => ({ data: { data: [] } }));
      setBlogs(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await api.delete(`/admin/blogs/${id}`);
        setBlogs(blogs.filter(blog => blog.id !== id && blog._id !== id));
      } catch (err) {
        alert('Failed to delete blog post');
      }
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* ── TOP HEADER BAR ── */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '16px',
        marginBottom: '28px' 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7143FE' }} />
            <span style={{ fontSize: '12px', color: '#7143FE', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Blog Posts Manager
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: 0 }}>
            Blog Articles ({blogs.length})
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={fetchBlogs} 
            disabled={loading}
            style={{ 
              padding: '10px 18px', 
              borderRadius: '12px', 
              background: '#FFFFFF', 
              border: '1px solid #E2E8F0', 
              color: '#475569', 
              fontWeight: '600', 
              fontSize: '13.5px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease' 
            }}
            title="Refresh Blogs List"
          >
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>

          <Link 
            to="/blogs/create" 
            style={{ 
              padding: '10px 20px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #7143FE 0%, #5B2ED7 100%)', 
              color: '#FFFFFF', 
              fontWeight: '700', 
              fontSize: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(113, 67, 254, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={18} />
            Create New Post
          </Link>
        </div>
      </div>

      {/* ── SEARCH FILTER CARD ── */}
      <div style={{ 
        background: '#FFFFFF', 
        borderRadius: '18px', 
        padding: '16px 20px', 
        marginBottom: '24px', 
        border: '1px solid #EAEAEF', 
        boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)' 
      }}>
        <div style={{ position: 'relative', maxWidth: '480px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input 
            type="text" 
            placeholder="Search posts by title or slug..." 
            style={{ 
              width: '100%', 
              padding: '10px 14px 10px 42px', 
              borderRadius: '10px', 
              border: '1px solid #CBD5E1', 
              fontSize: '14px',
              fontWeight: '500',
              outline: 'none',
              background: '#FAFAFD',
              color: '#1E293B' 
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div style={{ 
          background: '#FEE2E2', 
          border: '1px solid #FCA5A5', 
          color: '#DC2626', 
          padding: '12px 16px', 
          borderRadius: '12px', 
          marginBottom: '20px', 
          fontSize: '14px',
          fontWeight: '600' 
        }}>
          {error}
        </div>
      )}

      {/* ── TABLE WRAPPER ── */}
      <div style={{ 
        background: '#FFFFFF', 
        borderRadius: '20px', 
        border: '1px solid #EAEAEF', 
        boxShadow: '0 4px 20px -4px rgba(0,0,0,0.04)', 
        overflow: 'hidden' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '700' }}>
              <th style={{ padding: '16px 24px' }}>Blog Article Details</th>
              <th style={{ padding: '16px 20px' }}>Status</th>
              <th style={{ padding: '16px 20px' }}>Date Created</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ divideY: '1px solid #F1F5F9' }}>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <div style={{ width: '36px', height: '36px', border: '3px solid #7143FE', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  <div style={{ color: '#64748B', fontWeight: '600', fontSize: '14px' }}>Loading articles list...</div>
                </td>
              </tr>
            ) : filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '60px 24px', color: '#64748B' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F0EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#7143FE' }}>
                    <FileText size={32} />
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>No blog posts found</p>
                  <p style={{ fontSize: '14px', margin: 0 }}>Create a new blog article or adjust your search filter.</p>
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog) => (
                <tr key={blog._id || blog.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {blog.image && blog.image !== 'no-photo.jpg' ? (
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#E2E8F0', border: '1px solid #CBD5E1' }}>
                          <img src={blog.image.startsWith('http') ? blog.image : `http://localhost:5000/${blog.image}`} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#F0EBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7143FE', flexShrink: 0 }}>
                          <ImageIcon size={22} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '15px', marginBottom: '4px', lineHeight: '1.3' }}>
                          {blog.title}
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#7143FE', fontWeight: '600' }}>
                          /{blog.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#10B981', background: '#D1FAE5', padding: '4px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      ● Published
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#64748B', fontSize: '13.5px', fontWeight: '500' }}>
                    {new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <Link 
                        to={`/blogs/edit/${blog._id || blog.id}`} 
                        style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '10px', 
                          background: '#F0EBFF', 
                          color: '#7143FE', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }} 
                        title="Edit Blog"
                      >
                        <Edit2 size={16} />
                      </Link>

                      <button 
                        onClick={() => handleDelete(blog._id || blog.id)} 
                        style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '10px', 
                          background: '#FEE2E2', 
                          color: '#EF4444', 
                          border: 'none', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        title="Delete Blog"
                      >
                        <Trash2 size={16} />
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

export default BlogList;
