import { Link } from 'react-router-dom';

export const Unauthorized = () => {
  return (
    <div className="container text-center d-flex flex-column justify-content-center align-items-center min-vh-100">
      <i className="bi bi-shield-x text-danger display-1 mb-3"></i>
      <h1 className="fw-bold">403 - Access Denied</h1>
      <p className="text-muted max-w-md">
        You do not have administrative privileges to view this enterprise ledger route.
      </p>
      <Link to="/dashboard" className="btn btn-primary mt-3">
        <i className="bi bi-arrow-left me-2"></i>Return to Dashboard
      </Link>
    </div>
  );
};