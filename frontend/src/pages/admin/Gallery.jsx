import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ImageIcon, Eye, X, Check, AlertCircle } from 'lucide-react';
import { adminApi, UPLOADS_URL } from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/UI';

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Clinic');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getGallery();
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
    fetchGallery();
  }, []);

  const openUploadModal = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('Clinic');
    setFile(null);
    setPreviewUrl('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setCategory(item.category || 'Clinic');
    setFile(null);
    const existingImg = item.imageUrl?.startsWith('http') ? item.imageUrl : `${UPLOADS_URL}${item.imageUrl}`;
    setPreviewUrl(existingImg);
    setFormError('');
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        setFormError('Please select a valid image file (JPG, PNG, WebP)');
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setFormError('Image size must be less than 5MB');
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setFormError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Photo title is required');
      return;
    }

    if (!editingItem && !file) {
      setFormError('Please select an image file to upload');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      if (file) {
        formData.append('image', file);
      }

      if (editingItem) {
        await adminApi.updateGallery(editingItem._id, formData);
        setSuccessMsg('Gallery photo updated successfully!');
      } else {
        await adminApi.uploadGallery(formData);
        setSuccessMsg('New photo added to gallery successfully!');
      }

      setModalOpen(false);
      fetchGallery();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save gallery photo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, photoTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${photoTitle || 'this photo'}"?`)) return;
    try {
      await adminApi.deleteGallery(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      setSuccessMsg('Photo deleted from gallery');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete photo');
    }
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
            Photo Gallery
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Manage clinical facility photos, equipment, and before &amp; after cases
          </p>
        </div>
        <button onClick={openUploadModal} className="btn btn-primary" id="upload-photo-btn">
          <Plus size={18} /> Upload Photo
        </button>
      </div>

      {successMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.85rem 1.25rem', background: '#ecfdf5',
          border: '1px solid #10b981', borderRadius: 'var(--radius-md)',
          color: '#065f46', fontSize: '0.9rem', marginBottom: '1.5rem',
        }}>
          <Check size={18} color="#10b981" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading gallery..." />
      ) : (!Array.isArray(items) || items.length === 0) ? (
        <div className="card" style={{ padding: '3rem' }}>
          <EmptyState title="No Photos Uploaded" description="Add images to showcase your modern clinic rooms and dental team." />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {(Array.isArray(items) ? items : []).map((item) => (
            <div key={item._id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 180, background: '#f1f5f9', position: 'relative' }}>
                <img
                  src={item.imageUrl?.startsWith('http') ? item.imageUrl : `${UPLOADS_URL}${item.imageUrl}`}
                  alt={item.title || 'Clinic photo'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title || 'Untitled Photo'}
                  </strong>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                    {item.category || 'Clinic'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    onClick={() => openEditModal(item)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.4rem 0.65rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    title="Edit Photo"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.title)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.4rem 0.6rem', borderColor: '#ef4444', color: '#ef4444' }}
                    title="Delete Photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: '2rem', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                {editingItem ? 'Edit Gallery Photo' : 'Upload Gallery Photo'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-outline btn-sm">
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444', borderRadius: 'var(--radius-md)',
                color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem',
              }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                  placeholder="e.g. Modern Operatory Suite"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-control"
                >
                  <option value="Clinic">Clinic &amp; Facilities</option>
                  <option value="Equipment">High-Tech Equipment</option>
                  <option value="Cases">Before &amp; After</option>
                  <option value="Team">Dental Team</option>
                  <option value="General">General</option>
                </select>
              </div>

              {previewUrl && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    {file ? 'New Image Preview:' : 'Current Image:'}
                  </span>
                  <div style={{ width: '100%', height: 180, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#f1f5f9', border: '1px solid var(--border)' }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {editingItem ? 'Replace Image (Optional)' : 'Image File *'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required={!editingItem}
                  onChange={handleFileChange}
                  className="form-control"
                />
                {editingItem && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    Leave empty if you want to keep the current photo.
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ minWidth: 120, justifyContent: 'center' }}>
                  {saving ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="loading-spinner loading-spinner-sm" style={{ borderTopColor: '#fff', width: 14, height: 14 }} />
                      Saving...
                    </span>
                  ) : editingItem ? (
                    'Save Changes'
                  ) : (
                    'Upload Photo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
