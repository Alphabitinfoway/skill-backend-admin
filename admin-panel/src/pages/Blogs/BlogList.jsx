import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, FileText, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBlogs = async () => {
    try {
      setLoading(true);
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
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await api.delete(`/admin/blogs/${id}`);
        setBlogs(blogs.filter(blog => blog.id !== id && blog._id !== id));
      } catch (err) {
        alert('Failed to delete blog');
      }
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Blogs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage and organize your blog posts.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchBlogs} 
            disabled={loading}
            className="btn btn-secondary" 
            style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
            title="Refresh Blogs List"
          >
            <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>
          <Link to="/blogs/create" className="btn btn-primary" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            Create Blog
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search blogs by title..." 
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
              <th>Blog Details</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Loading blogs...</div>
                </td>
              </tr>
            ) : filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <FileText size={48} style={{ opacity: 0.2, margin: '0 auto' }} />
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '4px' }}>No blogs found</p>
                  <p style={{ fontSize: '14px' }}>Try adjusting your search or create a new blog.</p>
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog) => (
                <tr key={blog._id || blog.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {blog.image && blog.image !== 'no-photo.jpg' ? (
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--bg-main)' }}>
                          <img src={blog.image.startsWith('http') ? blog.image : `http://localhost:5000/${blog.image}`} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>{blog.title}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/{blog.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success">Published</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    {new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <Link to={`/blogs/edit/${blog._id || blog.id}`} className="btn btn-secondary" style={{ padding: '8px', background: 'transparent' }} title="Edit Blog">
                        <Edit2 size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(blog._id || blog.id)} 
                        className="btn btn-secondary" 
                        style={{ padding: '8px', color: 'var(--danger)', background: 'transparent', borderColor: 'transparent' }}
                        title="Delete Blog"
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

export default BlogList;
