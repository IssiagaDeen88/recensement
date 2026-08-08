import React, { useEffect, useState } from 'react';
import api, { exportFile } from '../api';

const Sectors = () => {
  const [sectors, setSectors] = useState([]);
  const [name, setName] = useState('');
  const [manager, setManager] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem('user')) || null);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/sectors');
        setSectors(response.data);
      } catch (err) {
        setStatusMessage(err.response?.data?.message || 'Impossible de charger les secteurs');
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setSelectedSectorId(null);
    setName('');
    setManager('');
  };

  const handleEditSector = (sector) => {
    setSelectedSectorId(sector._id);
    setName(sector.name || '');
    setManager(sector.manager || '');
  };

  const handleDeleteSector = async (sectorId) => {
    if (!window.confirm('Supprimer ce secteur ?')) return;
    try {
      await api.delete(`/sectors/${sectorId}`);
      setStatusMessage('Secteur supprimé avec succès.');
      const response = await api.get('/sectors');
      setSectors(response.data);
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Erreur lors de la suppression du secteur');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSectorId) {
        await api.put(`/sectors/${selectedSectorId}`, { name, manager });
        setStatusMessage('Secteur mis à jour avec succès.');
      } else {
        await api.post('/sectors', { name, manager });
        setStatusMessage('Secteur ajouté avec succès.');
      }
      resetForm();
      const response = await api.get('/sectors');
      setSectors(response.data);
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Erreur lors de la création du secteur');
    }
  };

  if (!currentUser) {
    return <div className="container">Chargement...</div>;
  }

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="container">
        <p className="text-sm text-rose-600">Accès refusé : seuls les administrateurs peuvent gérer les secteurs.</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Secteurs</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Gestion des secteurs</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => exportFile('/sectors/export/excel', 'sectors.xlsx')}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={() => exportFile('/sectors/export/pdf', 'sectors.pdf', true)}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Export PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
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
                  <th>Secteur</th>
                  <th>Responsable</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sectors.map((sector) => (
                  <tr key={sector._id}>
                    <td>{sector.name}</td>
                    <td>{sector.manager || '—'}</td>
                    <td>{new Date(sector.createdAt).toLocaleDateString()}</td>
                    <td className="flex flex-wrap gap-2 py-2">
                      <button
                        type="button"
                        onClick={() => handleEditSector(sector)}
                        className="rounded-2xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSector(sector._id)}
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
            {selectedSectorId ? 'Modifier un secteur' : 'Ajouter un secteur'}
          </h3>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nom du secteur</label>
            <input
              type="text"
              className="mt-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Responsable</label>
            <input
              type="text"
              className="mt-2"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              {selectedSectorId ? 'Sauvegarder les modifications' : 'Ajouter le secteur'}
            </button>
            {selectedSectorId && (
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

export default Sectors;
