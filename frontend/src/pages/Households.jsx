import React, { useEffect, useState } from 'react';
import api, { exportFile } from '../api';

const Households = () => {
  const [households, setHouseholds] = useState([]);
  const [search, setSearch] = useState('');
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [formData, setFormData] = useState({
    headName: '',
    address: '',
    district: '',
    sector: '',
    phone: '',
    censusDate: '',
  });
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [householdResponse, districtResponse, sectorResponse] = await Promise.all([
          api.get(`/households${search ? `?search=${encodeURIComponent(search)}` : ''}`),
          api.get('/districts'),
          api.get('/sectors'),
        ]);
        setHouseholds(householdResponse.data);
        setDistricts(districtResponse.data);
        setSectors(sectorResponse.data);
      } catch (err) {
        setStatusMessage(err.response?.data?.message || 'Impossible de charger les données');
      }
    };
    load();
  }, [search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/households', formData);
      setStatusMessage('Ménage ajouté avec succès.');
      setFormData({ headName: '', address: '', district: '', sector: '', phone: '', censusDate: '' });
      const response = await api.get(`/households${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setHouseholds(response.data);
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Erreur lors de la création du ménage');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Ménages</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Gestion des ménages</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="max-w-md"
            placeholder="Recherche par numéro, chef ou adresse"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" onClick={handlePrint} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Imprimer
          </button>
        </div>
      </div>
      {statusMessage && <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">{statusMessage}</div>}
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="table-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Liste des ménages</h3>
            <div className="flex flex-wrap gap-3">
                <button
                type="button"
                onClick={() => exportFile('/households/export/excel', 'households.xlsx')}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Export Excel
              </button>
              <button
                type="button"
                onClick={() => exportFile('/households/export/pdf', 'households.pdf', true)}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Export PDF
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Chef</th>
                  <th>Quartier</th>
                  <th>Secteur</th>
                  <th>Agent</th>
                </tr>
              </thead>
              <tbody>
                {households.map((household) => (
                  <tr key={household._id}>
                    <td>{household.number}</td>
                    <td>{household.headName}</td>
                    <td>{household.district}</td>
                    <td>{household.sector}</td>
                    <td>{household.agent ? `${household.agent.firstName} ${household.agent.lastName}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-slate-50 p-6 shadow-sm shadow-slate-200">
          <h3 className="text-xl font-semibold text-slate-900">Ajouter un ménage</h3>
          <div>
            <p className="text-sm text-slate-500">Le numéro du ménage est généré automatiquement à partir du quartier, du secteur et d'une séquence.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Chef de ménage</label>
            <input name="headName" value={formData.headName} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Adresse</label>
            <input name="address" value={formData.address} onChange={handleChange} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Quartier</label>
              <select name="district" value={formData.district} onChange={handleChange} required>
                <option value="">Sélectionner</option>
                {districts.map((district) => (
                  <option key={district._id} value={district.name}>{district.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Secteur</label>
              <select name="sector" value={formData.sector} onChange={handleChange} required>
                <option value="">Sélectionner</option>
                {sectors.map((sector) => (
                  <option key={sector._id} value={sector.name}>{sector.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Téléphone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date du recensement</label>
            <input name="censusDate" value={formData.censusDate} onChange={handleChange} type="date" />
          </div>
          <button type="submit" className="w-full">Ajouter</button>
        </form>
      </div>
    </div>
  );
};

export default Households;
