import { fetchClient } from './fetchClient';

export const invoiceApi = {
  /**
   * Create a new invoice (ROLE_USER / ROLE_ADMIN)
   * @param {Object} invoiceData - { invoiceNumber, amount, vendorName }
   */
  createInvoice: (invoiceData) => {
    return fetchClient('/invoices', {
      method: 'POST',
      body: invoiceData,
    });
  },

  /**
   * Fetch current user's invoices (ROLE_USER / ROLE_ADMIN)
   */
  getMyInvoices: () => {
    return fetchClient('/invoices/my-invoices');
  },

  /**
   * Fetch single invoice by ID (ROLE_USER / ROLE_ADMIN)
   * @param {number|string} id
   */
  getInvoiceById: (id) => {
    return fetchClient(`/invoices/${id}`);
  },

  /**
   * Fetch global ledger (Strictly ROLE_ADMIN)
   */
  getAdminLedger: () => {
    return fetchClient('/invoices/admin/ledger');
  },

  /**
   * Update invoice approval status (Strictly ROLE_ADMIN)
   * @param {number|string} id
   * @param {string} status - "APPROVED" | "REJECTED" | "PENDING"
   */
  updateInvoiceStatus: (id, status) => {
    return fetchClient(`/invoices/admin/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },
};