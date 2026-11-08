import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, organisation, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-brand">
        <span className="brand-badge">GRO</span>
        <span className="brand-title">GroundOps Admin</span>
      </div>

      <nav className="nav-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/technicians"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Technicians & Invites
        </NavLink>
        <NavLink
          to="/invite"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          + Invite Technician
        </NavLink>
      </nav>

      <div className="nav-user">
        <div className="user-badge">
          <span className="user-name">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="org-tag">
            {organisation?.name} ({organisation?.organisationCode})
          </span>
        </div>
        <button onClick={handleLogout} className="btn-logout" title="Sign out of Admin Portal">
          Sign out
        </button>
      </div>
    </header>
  );
};
