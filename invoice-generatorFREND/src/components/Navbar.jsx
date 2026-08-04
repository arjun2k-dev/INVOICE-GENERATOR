import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid px-4">
        <NavLink className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/dashboard">
          <i className="bi bi-receipt-cutoff text-primary fs-4"></i>
          <span>InvoiceEngine</span>
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`}
                to="/dashboard"
              >
                <i className="bi bi-speedometer2 me-1"></i> My Invoices
              </NavLink>
            </li>

            {hasRole('ROLE_ADMIN') && (
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`}
                  to="/admin/ledger"
                >
                  <i className="bi bi-shield-lock-fill me-1 text-warning"></i> Enterprise Ledger
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="text-light fw-semibold small">{user?.username}</div>
              <div className="text-muted extra-small">
                {user?.roles?.map((role) => (
                  <span key={role} className="badge bg-secondary me-1">
                    {role.replace('ROLE_', '')}
                  </span>
                ))}
              </div>
            </div>

            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};