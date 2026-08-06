/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { invoiceApi } from '../api/invoiceApi';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { createWebSocketClient } from '../api/websocketService';
import { LiveNotificationToast } from '../components/LiveNotificationToast';

export const UserDashboard = () => {
  const { user, token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeNotification, setActiveNotification] = useState(null);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    amount: '',
    vendorName: '',
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await invoiceApi.getMyInvoices();
      setInvoices(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();

    // Feature 2: Connect to STOMP for Real-Time User Notifications
    let _client = null;
    if (token && user?.username) {
      _client = createWebSocketClient(token, (client) => {
        // 🟢 STEP 2 FIX: Subscribe to the public user-specific topic matching backend broadcast
        client.subscribe(`/topic/notifications/${user.username}`, (message) => {
          const updatedInvoice = JSON.parse(message.body);

          // Update local status in table instantly without page refresh
          setInvoices((prev) =>
            prev.map((inv) => (Number(inv.id) === Number(updatedInvoice.invoiceId) ? { ...inv, status: updatedInvoice.status } : inv))
          );

          // Trigger Live Toast Notification
          setActiveNotification(updatedInvoice);
        });
      });
    }

    return () => {
      if (_client) {
        _client.deactivate();
      }
    };
  }, [token, user?.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      await invoiceApi.createInvoice(payload);
      
      setSuccessMsg('Invoice created successfully!');
      setFormData({ invoiceNumber: '', amount: '', vendorName: '' });

      const modalEl = document.getElementById('createInvoiceModal');
      const modalInstance = window.bootstrap?.Modal?.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();

      fetchInvoices();
    } catch (err) {
      setError(err.message || 'Failed to submit invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Toast Alert */}
      <LiveNotificationToast
        notification={activeNotification}
        onClose={() => setActiveNotification(null)}
      />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Invoice Dashboard</h2>
          <p className="text-muted mb-0">
            Welcome back, <span className="fw-semibold text-dark">{user?.username}</span>!
          </p>
        </div>
        <button
          className="btn btn-primary mt-3 mt-md-0 d-flex align-items-center gap-2 fw-semibold shadow-sm"
          data-bs-toggle="modal"
          data-bs-target="#createInvoiceModal"
        >
          <i className="bi bi-plus-circle-fill"></i> Create New Invoice
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show small" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show small" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Table */}
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-header bg-white py-3">
          <h5 className="card-title fw-bold mb-0 text-secondary">My Invoices</h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted display-4"></i>
              <p className="text-muted mt-2">No invoices submitted yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-4">Invoice #</th>
                    <th scope="col">Vendor Name</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Created Date</th>
                    <th scope="col" className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="ps-4 fw-bold text-primary">{inv.invoiceNumber}</td>
                      <td>{inv.vendorName}</td>
                      <td className="fw-semibold">${parseFloat(inv.amount).toFixed(2)}</td>
                      <td className="text-muted small">
                        {inv.createdDate ? new Date(inv.createdDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Create Invoice */}
      <div className="modal fade" id="createInvoiceModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-bold">New Invoice Submission</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Invoice Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    placeholder="e.g. INV-2026-001"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Vendor Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleChange}
                    placeholder="e.g. AWS"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary fw-bold" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};