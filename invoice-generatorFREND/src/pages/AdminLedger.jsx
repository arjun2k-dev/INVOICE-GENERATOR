/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { invoiceApi } from '../api/invoiceApi';
import { StatusBadge } from '../components/StatusBadge';

export const AdminLedger = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // Tracks ID of row currently updating
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchGlobalLedger = async () => {
    setLoading(true);
    try {
      const data = await invoiceApi.getAdminLedger();
      setInvoices(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch enterprise ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalLedger();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setActionLoading(id);
    setError('');
    setSuccessMsg('');

    try {
      const updatedInvoice = await invoiceApi.updateInvoiceStatus(id, newStatus);
      
      // Update state locally for instantaneous UI response
      setInvoices((prevInvoices) =>
        prevInvoices.map((inv) => (inv.id === id ? updatedInvoice : inv))
      );

      setSuccessMsg(`Invoice #${updatedInvoice.invoiceNumber} status set to ${newStatus}.`);
    } catch (err) {
      setError(err.message || `Failed to update status for invoice ID ${id}.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 text-dark">
            <i className="bi bi-shield-lock-fill text-warning me-2"></i>
            Enterprise Admin Ledger
          </h2>
          <p className="text-muted mb-0">Global invoice audit and approval console</p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm mt-3 mt-md-0 d-flex align-items-center gap-1"
          onClick={fetchGlobalLedger}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise"></i> Refresh Data
        </button>
      </div>

      {/* Dynamic Alerts */}
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

      {/* Global Ledger Table */}
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-header bg-white py-3">
          <h5 className="card-title fw-bold mb-0 text-secondary">All Submitted Invoices</h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="text-muted small mt-2">Fetching global audit ledger...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-x text-muted display-4"></i>
              <p className="text-muted mt-2">No global invoice records found in database.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-4">ID</th>
                    <th scope="col">Invoice #</th>
                    <th scope="col">Submitted By</th>
                    <th scope="col">Vendor Name</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Created Date</th>
                    <th scope="col" className="text-center">Status</th>
                    <th scope="col" className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="ps-4 text-muted small">#{inv.id}</td>
                      <td className="fw-bold text-primary">{inv.invoiceNumber}</td>
                      <td className="fw-semibold text-dark">{inv.username}</td>
                      <td>{inv.vendorName}</td>
                      <td className="fw-semibold">${parseFloat(inv.amount).toFixed(2)}</td>
                      <td className="text-muted small">
                        {inv.createdDate ? new Date(inv.createdDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="text-end pe-4">
                        {actionLoading === inv.id ? (
                          <span className="spinner-border spinner-border-sm text-secondary" role="status"></span>
                        ) : (
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-success"
                              onClick={() => handleStatusUpdate(inv.id, 'APPROVED')}
                              disabled={inv.status === 'APPROVED'}
                              title="Approve Invoice"
                            >
                              <i className="bi bi-check-lg"></i> Approve
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleStatusUpdate(inv.id, 'REJECTED')}
                              disabled={inv.status === 'REJECTED'}
                              title="Reject Invoice"
                            >
                              <i className="bi bi-x-lg"></i> Reject
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              onClick={() => handleStatusUpdate(inv.id, 'PENDING')}
                              disabled={inv.status === 'PENDING'}
                              title="Reset to Pending"
                            >
                              <i className="bi bi-clock-history"></i> Reset
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};