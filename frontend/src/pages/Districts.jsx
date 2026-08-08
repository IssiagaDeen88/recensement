import React, { useEffect, useState } from 'react';
import api, { exportFile } from '../api';

const Districts = () => {
  const [districts, setDistricts] = useState([]);
  const [name, setName] = useState('');
  const [manager, setManager] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem('user')) || null);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/districts');
        setDistricts(response.data);
      } catch (err) {
        setStatusMessage(err.response?.data?.message || 'Impossible de charger les quartiers');
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setSelectedDistrictId(null);
    setName('');
    setManager('');
  };

  const handleEditDistrict = (district) => {
    setSelectedDistrictId(district._id);
    setName(district.name || '');
    setManager(district.manager || '');
  };

  const handleDeleteDistrict = async (districtId) => {
    if (!window.confirm('Supprimer ce quartier ?')) return;
    try {
      await api.delete(`/districts/${districtId}`);
      setStatusMessage('Quartier supprimé avec succès.');
      const response = await api.get('/districts');
      setDistricts(response.data);
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Erreur lors de la suppression du quartier');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedDistrictId) {
        await api.put(`/districts/${selectedDistrictId}`, { name, manager });
        setStatusMessage('Quartier mis à jour avec succès.');
      } else {
        await api.post('/districts', { name, manager });
        setStatusMessage('Quartier ajouté avec succès.');
      }
      resetForm();
      const response = await api.get('/districts');
      setDistricts(response.data);
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Erreur lors de l enregistrement du quartier');
    }
  };

  if (!currentUser) {
    return <div className="container">Chargement...</div>;
  }

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="container">
        <p className="text-sm text-rose-600">Accès refusé : seuls les administrateurs peuvent gérer les quartiers.</p>
      </div>
    );
  }

  return (
    <div className="container space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Quartiers</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Gestion des quartiers</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => exportFile('/districts/export/excel', 'districts.xlsx')}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={() => exportFile('/districts/export/pdf', 'districts.pdf', true)}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Export PDF
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Imprimer
          </button>
        </div>
      </div>
      {statusMessage && <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">{statusMessage}</div>}
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="table-card">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Quartier</th>
                  <th>Responsable</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {districts.map((district) => (
                  <tr key={district._id}>
                    <td>{district.name}</td>
                    <td>{district.manager || '—'}</td>
                    <td>{new Date(district.createdAt).toLocaleDateString()}</td>
                    <td className="flex flex-wrap gap-2 py-2">
                      <button
                        type="button"
                        onClick={() => handleEditDistrict(district)}
                        className="rounded-2xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDistrict(district._id)}
                        className="rounded-2xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-slate-50 p-6 shadow-sm shadow-slate-200">
          <h3 className="text-xl font-semibold text-slate-900">
            {selectedDistrictId ? 'Modifier un quartier' : 'Ajouter un quartier'}
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nom du quartier</label>
            <input
              type="text"
              className="mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Responsable du quartier</label>
            <input
              type="text"
              className="mt-2"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              {selectedDistrictId ? 'Sauvegarder les modifications' : 'Ajouter le quartier'}
            </button>
            {selectedDistrictId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Districts;
