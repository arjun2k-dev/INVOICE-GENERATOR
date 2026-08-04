import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roles: ['user'],
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setFormData((prev) => ({ ...prev, roles: [selectedRole] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-5">
      <div className="card shadow-lg border-0 rounded-3 col-md-8 col-lg-5 p-4">
        <div className="text-center mb-4">
          <i className="bi bi-person-plus-fill text-success display-4"></i>
          <h3 className="fw-bold mt-2">Create Account</h3>
          <p className="text-muted small">Register for Enterprise Invoice Engine</p>
        </div>

        {error && (
          <div className="alert alert-danger small" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. john_doe"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Account Type / Role</label>
            <select
              className="form-select"
              value={formData.roles[0]}
              onChange={handleRoleChange}
            >
              <option value="user">Standard User (ROLE_USER)</option>
              <option value="admin">Administrator (ROLE_ADMIN)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 py-2 fw-bold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating Account...
              </>
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        <div className="text-center mt-4 small">
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" className="fw-semibold text-decoration-none">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};