import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

export const Alert = ({ type = 'info', children, onClose, className = '' }) => (
  <div className={`alert alert-${type} ${className}`} role="alert">
    <span style={{ flexShrink: 0 }}>{icons[type]}</span>
    <span style={{ flex: 1 }}>{children}</span>
    {onClose && (
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, padding: 0 }}>
        <X size={16} />
      </button>
    )}
  </div>
);

export const LoadingSpinner = ({ size = 'md', label = 'Loading...' }) => (
  <div className="page-loading" role="status" aria-label={label}>
    <div className={`loading-spinner ${size === 'sm' ? 'loading-spinner-sm' : ''}`} />
    {size !== 'sm' && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>{label}</p>}
  </div>
);

export const InlineSpinner = () => (
  <div className="loading-spinner loading-spinner-sm" style={{ display: 'inline-block' }} />
);

import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'Nothing here yet', description = '', icon, action }) => (
  <div className="empty-state">
    {icon || <Inbox size={56} />}
    <h3>{title}</h3>
    {description && <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>{description}</p>}
    {action}
  </div>
);

export const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="empty-state">
    <AlertCircle size={56} style={{ color: 'var(--danger)', opacity: 1 }} />
    <h3 style={{ color: 'var(--danger)' }}>Error</h3>
    <p style={{ color: 'var(--text-muted)' }}>{message}</p>
    {onRetry && (
      <button className="btn btn-outline" onClick={onRetry} style={{ marginTop: 'var(--space-4)' }}>
        Try Again
      </button>
    )}
  </div>
);

export const StatusBadge = ({ status }) => {
  const map = {
    pending: 'warning',
    confirmed: 'info',
    completed: 'success',
    cancelled: 'danger',
    published: 'success',
    unpublished: 'secondary',
    active: 'success',
    inactive: 'secondary',
    new: 'info',
    read: 'secondary',
    replied: 'success',
    archived: 'secondary',
    approved: 'success',
    unapproved: 'warning',
  };
  return (
    <span className={`badge badge-${map[status] || 'secondary'}`}>
      {status}
    </span>
  );
};

export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', danger = false }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)' }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;
  const pageNumbers = [];
  for (let i = 1; i <= pages; i++) pageNumbers.push(i);
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</button>
      {pageNumbers.map((p) => (
        <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === pages}>›</button>
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="card">
    <div className="skeleton" style={{ height: 180 }} />
    <div className="card-body">
      <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 14, width: '60%' }} />
    </div>
  </div>
);

// Toast context
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {icons[t.type] || <Info size={16} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
