import { useState, useEffect } from 'react';
import { Plus, Trash2, Star, Check, X, Edit2 } from 'lucide-react';
import { adminApi } from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/UI';

const Testimonials = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    treatment: '',
    content: '',
    rating: 5,
    published: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTestimonials();
      if (res.data?.success) {
        const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.items || []);
        setItems(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({ displayName: '', treatment: '', content: '', rating: 5, published: true });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      displayName: item.displayName || '',
      treatment: item.treatment || '',
      content: item.content || '',
      rating: item.rating || 5,
      published: item.published !== undefined ? item.published : true,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await adminApi.updateTestimonial(editingItem._id, formData);
      } else {
        await adminApi.createTestimonial(formData);
      }
      setModalOpen(false);
      setEditingItem(null);
      setFormData({ displayName: '', treatment: '', content: '', rating: 5, published: true });
      fetchTestimonials();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await adminApi.deleteTestimonial(id);
      setItems((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
            Patient Reviews & Testimonials
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Review, publish, or add verified patient stories
          </p>
        </div>
        <button onClick={handleAddNew} className="btn btn-primary">
          <Plus size={18} /> Add Review
        </button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner text="Loading patient feedback..." />
          </div>
        ) : (!Array.isArray(items) || items.length === 0) ? (
          <div style={{ padding: '3rem' }}>
            <EmptyState title="No Reviews Yet" description="Add client testimonials to display on the public website." />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Patient Name</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Treatment</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Rating</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Review Text</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right', minWidth: '130px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(items) ? items : []).map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{item.displayName}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>{item.treatment || 'General'}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: 2, color: '#f59e0b' }}>
                        {[...Array(item.rating || 5)].map((_, i) => (
                          <Star key={i} size={14} fill="#f59e0b" />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', maxWidth: 300 }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.content}
                      </p>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-outline btn-sm"
                          style={{
                            borderColor: '#0ea5a0',
                            color: '#0f766e',
                            background: '#f0fdfa',
                            padding: '0.35rem 0.6rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Edit Review"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="btn btn-outline btn-sm"
                          style={{
                            borderColor: '#fecaca',
                            color: '#dc2626',
                            background: '#fef2f2',
                            padding: '0.35rem 0.55rem',
                          }}
                          title="Delete Review"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                {editingItem ? 'Edit Patient Review' : 'Add Patient Review'}
              </h3>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingItem(null);
                }}
                className="btn btn-outline btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Patient Name *</label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Jessica Taylor"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Treatment Received</label>
                <input
                  type="text"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Laser Teeth Whitening"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Rating (Stars)</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="form-control"
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Good</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Review Feedback *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="form-control"
                  placeholder="What did the patient say about their treatment?"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : (editingItem ? 'Update Review' : 'Add Review')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
