import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem('user') || 'null'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm shadow-slate-200/60">
      <Link className="flex items-center gap-3" to="/">
        <img src={logo} alt="Logo Recensement" className="h-10 w-10 rounded-full object-cover" />
        <span className="text-sm font-semibold text-slate-900">Recensement Dounsy</span>
      </Link>
      <div className="flex flex-wrap items-center gap-4">
        <Link className="text-sm font-medium text-slate-700 transition hover:text-sky-600" to="/">Dashboard</Link>
        <Link className="text-sm font-medium text-slate-700 transition hover:text-sky-600" to="/households">Ménages</Link>
        <Link className="text-sm font-medium text-slate-700 transition hover:text-sky-600" to="/people">Personnes</Link>
        {currentUser?.role === 'ADMIN' && (
          <>
            <Link className="text-sm font-medium text-slate-700 transition hover:text-sky-600" to="/agents">Agents</Link>
            <Link className="text-sm font-medium text-slate-700 transition hover:text-sky-600" to="/districts">Quartiers</Link>
            <Link className="text-sm font-medium text-slate-700 transition hover:text-sky-600" to="/sectors">Secteurs</Link>
          </>
        )}
      </div>
      <button onClick={handleLogout} className="text-sm font-medium text-slate-700 transition hover:text-sky-600">Déconnexion</button>
    </nav>

  );
};

export default Navbar;
