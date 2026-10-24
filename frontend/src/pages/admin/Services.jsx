import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Stethoscope, Search, Upload, Image as ImageIcon } from 'lucide-react';
import { adminApi, UPLOADS_URL } from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/UI';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: 'General',
    price: '',
    duration: '30 mins',
    isActive: true,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getServices();
      if (res.data?.success) {
        const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.services || []);
        setServices(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openModal = (svc = null) => {
    setSelectedImage(null);
    if (svc) {
      setEditingService(svc);
      setFormData({
        title: svc.title || '',
        description: svc.fullDescription || svc.description || '',
        shortDescription: svc.shortDescription || '',
        category: svc.category || 'General',
        price: svc.price || '',
        duration: svc.duration || '30 mins',
        isActive: svc.published ?? svc.isActive ?? true,
      });
      setImagePreview(svc.image ? (svc.image.startsWith('/uploads') ? `${UPLOADS_URL}${svc.image}` : svc.image) : '');
    } else {
      setEditingService(null);
      setFormData({
        title: '',
        description: '',
        shortDescription: '',
        category: 'General',
        price: '',
        duration: '30 mins',
        isActive: true,
      });
      setImagePreview('');
    }
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('title', formData.title);
      dataPayload.append('shortDescription', formData.shortDescription);
      dataPayload.append('fullDescription', formData.description || formData.shortDescription || '');
      dataPayload.append('category', formData.category);
      dataPayload.append('price', formData.price);
      dataPayload.append('duration', formData.duration);
      dataPayload.append('published', String(formData.isActive ?? true));

      if (selectedImage) {
        dataPayload.append('image', selectedImage);
      }

      if (editingService) {
        await adminApi.updateService(editingService._id, dataPayload);
      } else {
        await adminApi.createService(dataPayload);
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await adminApi.deleteService(id);
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete service');
    }
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
            Dental Services
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Add, update, or remove treatments offered by the clinic (with images)
          </p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary" id="add-service-btn">
          <Plus size={18} /> Add New Service
        </button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner text="Loading treatments..." />
          </div>
        ) : (!Array.isArray(services) || services.length === 0) ? (
          <div style={{ padding: '3rem' }}>
            <EmptyState title="No Services Created" description="Click 'Add New Service' to add your first clinic treatment." />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Service &amp; Image</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Category</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Price &amp; Duration</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(services) ? services : []).map((svc) => (
                  <tr key={svc._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: 54,
                          height: 54,
                          borderRadius: '10px',
                          overflow: 'hidden',
                          background: 'var(--primary-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid var(--border)'
                        }}>
                          {svc.image ? (
                            <img
                              src={svc.image.startsWith('/uploads') ? `${UPLOADS_URL}${svc.image}` : svc.image}
                              alt={svc.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ fontSize: '1.4rem' }}>🦷</span>
                          )}
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            {svc.title}
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {svc.shortDescription || svc.description?.substring(0, 50)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge badge-neutral">{svc.category || 'General'}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {svc.price || 'Free Consultation'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {svc.duration || '30 mins'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${(svc.published ?? svc.isActive ?? true) ? 'badge-success' : 'badge-neutral'}`}>
                        {(svc.published ?? svc.isActive ?? true) ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => openModal(svc)} className="btn btn-outline btn-sm" title="Edit Service">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(svc._id)} className="btn btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} title="Delete Service">
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

      {/* Edit/Create Modal with Image Upload */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: 580, width: '100%', padding: '2rem', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                {editingService ? 'Edit Dental Service' : 'Add New Dental Service'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-outline btn-sm">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Service Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-control"
                  placeholder="e.g. Teeth Whitening & Cleaning"
                />
              </div>

              {/* Service Image Upload with Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Service Image
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '12px',
                    border: '1px dashed var(--border)',
                    overflow: 'hidden',
                    background: 'var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageIcon size={28} color="var(--text-light)" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="service-image-input"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="service-image-input"
                      className="btn btn-outline btn-sm"
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Upload size={14} />
                      {imagePreview ? 'Change Image' : 'Upload Service Image'}
                    </label>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      PNG, JPG, WebP up to 5MB.
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-control"
                  >
                    <option value="General">General</option>
                    <option value="Cosmetic">Cosmetic</option>
                    <option value="Orthodontics">Orthodontics</option>
                    <option value="Pediatric">Pediatric</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Price Display</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="form-control"
                    placeholder="e.g. $150 or Free Checkup"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Short Summary</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="form-control"
                  placeholder="One sentence description for service cards"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Full Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control"
                  placeholder="Detailed procedure explanation for patients..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                  Publish service on website
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" id="save-service-btn">
                  {saving ? 'Saving...' : (editingService ? 'Update Service' : 'Save Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
