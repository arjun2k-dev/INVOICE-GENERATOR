// src/components/LiveNotificationToast.jsx

export const LiveNotificationToast = ({ notification, onClose }) => {
  if (!notification) return null;

  const getBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-warning text-dark';
    }
  };

  return (
    <div
      className="position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 1100 }}
    >
      <div className="toast show shadow-lg border-0" role="alert">
        <div className="toast-header bg-dark text-white d-flex justify-content-between">
          <span className="fw-bold">
            <i className="bi bi-bell-fill me-2 text-warning"></i>
            Invoice Status Update
          </span>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
          ></button>
        </div>
        <div className="toast-body bg-white text-dark">
          <p className="mb-1">
            Invoice <strong>#{notification.invoiceNumber}</strong> for{' '}
            <strong>{notification.vendorName}</strong> has been updated.
          </p>
          <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
            <span className="small text-muted">
              Amount: ${parseFloat(notification.amount || 0).toFixed(2)}
            </span>
            <span className={`badge ${getBadgeClass(notification.status)}`}>
              {notification.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};