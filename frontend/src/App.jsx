import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Households from './pages/Households.jsx';
import People from './pages/People.jsx';
import Agents from './pages/Agents.jsx';
import Districts from './pages/Districts.jsx';
import Sectors from './pages/Sectors.jsx';
import Navbar from './components/Navbar.jsx';

const App = () => {
  const token = localStorage.getItem('token');
  const currentUser = token ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <Router>
      {token && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/households" element={token ? <Households /> : <Navigate to="/login" replace />} />
        <Route path="/people" element={token ? <People /> : <Navigate to="/login" replace />} />
        <Route path="/agents" element={token && isAdmin ? <Agents /> : <Navigate to={token ? '/' : '/login'} replace />} />
        <Route path="/districts" element={token && isAdmin ? <Districts /> : <Navigate to={token ? '/' : '/login'} replace />} />
        <Route path="/sectors" element={token && isAdmin ? <Sectors /> : <Navigate to={token ? '/' : '/login'} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
