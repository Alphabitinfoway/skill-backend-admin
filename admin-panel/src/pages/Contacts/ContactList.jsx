import React, { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  Search,
  Mail,
  Phone,
  MessageSquare,
  AlertCircle,
  Eye,
  X,
  CheckCircle,
  Clock,
  RefreshCw,
  Send,
  Inbox
} from 'lucide-react';
import api from '../../api/axios';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected contact for detail modal
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/contacts');
      if (response.data?.success) {
        setContacts(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch contact messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.patch(`/admin/contacts/${id}/status`, { status: newStatus });
      if (response.data?.success) {
        setContacts((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
        );
        if (selectedContact && selectedContact._id === id) {
          setSelectedContact((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/admin/contacts/${id}`);
      setContacts((prev) => prev.filter((c) => c._id !== id));
      if (selectedContact && selectedContact._id === id) {
        setSelectedContact(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete contact message');
    }
  };

  const getInitials = (firstName, lastName) => {
    const first = (firstName || '').charAt(0).toUpperCase();
    const last = (lastName || '').charAt(0).toUpperCase();
    return `${first}${last}` || 'C';
  };

  const getStatusBadgeStyle = (status) => {
    const base = {
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-block'
    };
    switch (status) {
      case 'read':
        return { ...base, backgroundColor: '#e0f2fe', color: '#0284c7' };
      case 'responded':
        return { ...base, backgroundColor: '#d1fae5', color: '#059669' };
      case 'unread':
      default:
        return { ...base, backgroundColor: '#fef3c7', color: '#d97706' };
    }
  };

  // Filter contacts by search and status
  const filteredContacts = contacts.filter((item) => {
    const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
    const email = (item.email || '').toLowerCase();
    const subject = (item.subject || '').toLowerCase();
    const phone = (item.contactNumber || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      fullName.includes(search) ||
      email.includes(search) ||
      subject.includes(search) ||
      phone.includes(search);

    const matchesStatus = statusFilter ? item.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const totalMessages = contacts.length;
  const unreadMessages = contacts.filter((c) => c.status === 'unread').length;
  const readMessages = contacts.filter((c) => c.status === 'read').length;
  const respondedMessages = contacts.filter((c) => c.status === 'responded').length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              Contact Inquiries
            </h1>
            <span style={{
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--primary)',
              fontSize: '12px',
              fontWeight: '700',
              padding: '2px 10px',
              borderRadius: '12px',
              border: '1px solid rgba(79, 70, 229, 0.2)'
            }}>
              {totalMessages} Total
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            Review and respond to messages submitted by visitors through the contact form.
          </p>
        </div>

        <button
          onClick={fetchContacts}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
          title="Refresh Contact Messages"
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Total Messages Card */}
        <div
          className="card"
          onClick={() => setStatusFilter('')}
          style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            borderColor: statusFilter === '' ? 'var(--primary)' : 'var(--border-color)',
            boxShadow: statusFilter === '' ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : 'var(--shadow-sm)',
            transition: 'var(--transition)'
          }}
        >
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Messages</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>{totalMessages}</span>
          </div>
        </div>

        {/* Unread Card */}
        <div
          className="card"
          onClick={() => setStatusFilter('unread')}
          style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            borderColor: statusFilter === 'unread' ? '#d97706' : 'var(--border-color)',
            boxShadow: statusFilter === 'unread' ? '0 0 0 2px rgba(217, 119, 6, 0.2)' : 'var(--shadow-sm)',
            transition: 'var(--transition)'
          }}
        >
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unread</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#d97706', marginTop: '2px' }}>{unreadMessages}</span>
          </div>
        </div>

        {/* Read Card */}
        <div
          className="card"
          onClick={() => setStatusFilter('read')}
          style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            borderColor: statusFilter === 'read' ? '#0284c7' : 'var(--border-color)',
            boxShadow: statusFilter === 'read' ? '0 0 0 2px rgba(2, 132, 199, 0.2)' : 'var(--shadow-sm)',
            transition: 'var(--transition)'
          }}
        >
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Read</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>{readMessages}</span>
          </div>
        </div>

        {/* Responded Card */}
        <div
          className="card"
          onClick={() => setStatusFilter('responded')}
          style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            borderColor: statusFilter === 'responded' ? '#059669' : 'var(--border-color)',
            boxShadow: statusFilter === 'responded' ? '0 0 0 2px rgba(5, 150, 105, 0.2)' : 'var(--shadow-sm)',
            transition: 'var(--transition)'
          }}
        >
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Responded</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>{respondedMessages}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '420px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by name, email, phone, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '42px', paddingRight: searchTerm ? '36px' : '14px' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStatusFilter('')}
            className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '8px 14px', borderRadius: '10px' }}
          >
            All ({totalMessages})
          </button>
          <button
            onClick={() => setStatusFilter('unread')}
            className={`btn ${statusFilter === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '8px 14px', borderRadius: '10px', backgroundColor: statusFilter === 'unread' ? '#d97706' : undefined, color: statusFilter === 'unread' ? '#fff' : undefined, borderColor: statusFilter === 'unread' ? '#d97706' : undefined }}
          >
            Unread ({unreadMessages})
          </button>
          <button
            onClick={() => setStatusFilter('read')}
            className={`btn ${statusFilter === 'read' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '8px 14px', borderRadius: '10px', backgroundColor: statusFilter === 'read' ? '#0284c7' : undefined, color: statusFilter === 'read' ? '#fff' : undefined, borderColor: statusFilter === 'read' ? '#0284c7' : undefined }}
          >
            Read ({readMessages})
          </button>
          <button
            onClick={() => setStatusFilter('responded')}
            className={`btn ${statusFilter === 'responded' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '8px 14px', borderRadius: '10px', backgroundColor: statusFilter === 'responded' ? '#059669' : undefined, color: statusFilter === 'responded' ? '#fff' : undefined, borderColor: statusFilter === 'responded' ? '#059669' : undefined }}
          >
            Responded ({respondedMessages})
          </button>
        </div>
      </div>

      {/* Messages Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} style={{ margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '14px', fontWeight: '500' }}>Fetching contact messages...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--danger)' }}>
            <AlertCircle size={24} style={{ margin: '0 auto 8px auto' }} />
            <p>{error}</p>
            <button onClick={fetchContacts} className="btn btn-secondary" style={{ marginTop: '12px' }}>Try Again</button>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <Inbox size={40} style={{ opacity: 0.3, margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>No contact messages found</p>
            <p style={{ fontSize: '13px' }}>Try adjusting your search or status filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Contact Info</th>
                  <th>Subject / Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((item) => {
                  const initials = getInitials(item.firstName, item.lastName);
                  const statusStyle = getStatusBadgeStyle(item.status);

                  return (
                    <tr key={item._id}>
                      {/* Sender */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #7143FE 0%, #4f46e5 100%)',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px' }}>
                              {item.firstName} {item.lastName}
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Inquirer</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                          <a href={`mailto:${item.email}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={13} style={{ color: 'var(--text-muted)' }} /> {item.email}
                          </a>
                          {item.contactNumber && (
                            <a href={`tel:${item.contactNumber}`} style={{ color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={13} style={{ color: 'var(--text-muted)' }} /> {item.contactNumber}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Subject */}
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.subject}>
                          {item.subject || 'No Subject'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                          {item.message}
                        </div>
                      </td>

                      {/* Status Select */}
                      <td>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            outline: 'none',
                            ...statusStyle
                          }}
                        >
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                          <option value="responded">Responded</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <a
                            href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject || '')}`}
                            className="btn-icon"
                            title="Reply via Email"
                          >
                            <Send size={16} />
                          </a>
                          <button
                            onClick={() => {
                              setSelectedContact(item);
                              if (item.status === 'unread') {
                                handleStatusChange(item._id, 'read');
                              }
                            }}
                            className="btn-icon"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="btn-icon"
                            style={{ color: 'var(--danger)' }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '560px',
            padding: '28px',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            borderRadius: '18px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedContact(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex'
              }}
            >
              <X size={20} />
            </button>

            {/* Header Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7143FE 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getInitials(selectedContact.firstName, selectedContact.lastName)}
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                  {selectedContact.firstName} {selectedContact.lastName}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Submitted on {new Date(selectedContact.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Quick Detail Bar */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <a href={`mailto:${selectedContact.email}`} style={{ fontWeight: '700', color: 'var(--primary)', textDecoration: 'none' }}>
                  {selectedContact.email}
                </a>
              </div>
              {selectedContact.contactNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Contact Number:</span>
                  <a href={`tel:${selectedContact.contactNumber}`} style={{ fontWeight: '700', color: 'var(--text-main)', textDecoration: 'none' }}>
                    {selectedContact.contactNumber}
                  </a>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <select
                  value={selectedContact.status}
                  onChange={(e) => handleStatusChange(selectedContact._id, e.target.value)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="responded">Responded</option>
                </select>
              </div>
            </div>

            {/* Subject Box */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Subject
              </span>
              <div style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-main)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text-main)'
              }}>
                {selectedContact.subject || 'No Subject'}
              </div>
            </div>

            {/* Message Body */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Message Content
              </span>
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--bg-main)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'var(--text-main)',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                {selectedContact.message}
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a
                href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(selectedContact.subject || '')}`}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <Send size={15} />
                Send Reply Email
              </a>
              <button
                onClick={() => setSelectedContact(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactList;
