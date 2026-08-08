import React, { useEffect, useState } from 'react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats/dashboard');
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Impossible de charger les statistiques');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Tableau de bord</p>
        <h2 className="text-4xl font-semibold text-slate-900">Vue d'ensemble</h2>
      </header>
      {stats ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Ménages</p>
            <p className="mt-4 text-4xl font-semibold">{stats.householdsCount}</p>
          </div>
          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Personnes</p>
            <p className="mt-4 text-4xl font-semibold">{stats.peopleCount}</p>
          </div>
          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Agents actifs</p>
            <p className="mt-4 text-4xl font-semibold">{stats.agentsCount}</p>
          </div>
        </div>
      ) : error ? (
        <p className="text-rose-600">{error}</p>
      ) : (
        <p className="text-slate-500">Chargement...</p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-slate-50 p-6 shadow-sm shadow-slate-200">
          <h3 className="text-xl font-semibold text-slate-900">Répartition par quartier</h3>
          <ul className="mt-4 space-y-3">
            {stats?.byDistrict.map((item) => (
              <li key={item._id} className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-100">
                <span className="font-medium text-slate-700">{item._id}</span>
                <span className="ml-2 text-slate-500">{item.count}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl bg-slate-50 p-6 shadow-sm shadow-slate-200">
          <h3 className="text-xl font-semibold text-slate-900">Répartition par secteur</h3>
          <ul className="mt-4 space-y-3">
            {stats?.bySector.map((item) => (
              <li key={item._id} className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-100">
                <span className="font-medium text-slate-700">{item._id}</span>
                <span className="ml-2 text-slate-500">{item.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
