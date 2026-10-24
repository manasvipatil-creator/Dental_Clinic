import { useState, useEffect } from 'react';
import { FileText, Save, CheckCircle } from 'lucide-react';
import { adminApi } from '../../services/api';
import { LoadingSpinner } from '../../components/UI';

const Content = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [heroTitle, setHeroTitle] = useState('Precision Dentistry. Radiant Smiles.');
  const [heroSubtitle, setHeroSubtitle] = useState('Experience modern, gentle dental care backed by advanced digital diagnostics and dedicated specialists.');
  const [aboutBody, setAboutBody] = useState('At SmileCraft Dental Clinic, we believe every patient deserves a healthy, radiant smile created with comfort and clinical precision.');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await adminApi.getAllContent();
        if (res.data?.data) {
          const hero = res.data.data.find((c) => c.key === 'home-hero');
          if (hero) {
            setHeroTitle(hero.title || '');
            setHeroSubtitle(hero.subtitle || '');
          }
          const about = res.data.data.find((c) => c.key === 'about-overview');
          if (about) {
            setAboutBody(about.body || '');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        adminApi.upsertContent('home-hero', { section: 'home', title: heroTitle, subtitle: heroSubtitle, published: true }),
        adminApi.upsertContent('about-overview', { section: 'about', title: 'About SmileCraft Dental Clinic', body: aboutBody, published: true }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading CMS content..." />;

  return (
    <div className="admin-page" style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
          Website Content (CMS)
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
          Customize home page banner messaging, mission statement, and clinic text
        </p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: '2rem' }}>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', color: '#10b981', marginBottom: '1.5rem' }}>
            <CheckCircle size={18} />
            <span>Content published successfully!</span>
          </div>
        )}

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          Homepage Hero Banner
        </h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Main Headline
          </label>
          <input
            type="text"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="form-control"
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Subheadline / Description
          </label>
          <textarea
            rows={2}
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="form-control"
          />
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          About Us Section
        </h3>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            About Clinic Description
          </label>
          <textarea
            rows={5}
            value={aboutBody}
            onChange={(e) => setAboutBody(e.target.value)}
            className="form-control"
          />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ minWidth: 160 }}>
          <Save size={16} />
          {saving ? 'Publishing...' : 'Save & Publish'}
        </button>
      </form>
    </div>
  );
};

export default Content;
