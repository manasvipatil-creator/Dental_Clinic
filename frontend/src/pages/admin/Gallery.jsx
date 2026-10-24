import { useState, useEffect } from 'react';
import { Plus, Trash2, ImageIcon, Eye, X } from 'lucide-react';
import { adminApi, UPLOADS_URL } from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/UI';

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Clinic');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', title);
      formData.append('category', category);

      await adminApi.uploadGallery(formData);
      setModalOpen(false);
      setTitle('');
      setFile(null);
      fetchGallery();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this gallery photo?')) return;
    try {
      await adminApi.deleteGallery(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
            Photo Gallery
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Manage clinical facility photos, equipment, and before & after cases
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Upload Photo
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading gallery..." />
      ) : (!Array.isArray(items) || items.length === 0) ? (
        <div className="card" style={{ padding: '3rem' }}>
          <EmptyState title="No Photos Uploaded" description="Add images to showcase your modern clinic rooms and dental team." />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
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
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {item.title || 'Untitled Photo'}
                  </strong>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                    {item.category || 'Clinic'}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: '#ef4444', color: '#ef4444' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: 440, width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Upload Gallery Photo</h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-outline btn-sm">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Photo Title</label>
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-control"
                >
                  <option value="Clinic">Clinic & Facilities</option>
                  <option value="Equipment">High-Tech Equipment</option>
                  <option value="Cases">Before & After</option>
                  <option value="Team">Dental Team</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Image File *</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="btn btn-primary">
                  {uploading ? 'Uploading...' : 'Upload'}
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
