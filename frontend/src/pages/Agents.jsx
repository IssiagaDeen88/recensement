import React, { useEffect, useState } from 'react';
import api from '../api';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', district: '', sector: '' });
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [resetAgentId, setResetAgentId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem('user')) || null);
    const load = async () => {
      try {
        const [userResponse, districtResponse, sectorResponse] = await Promise.all([
          api.get('/users'),
          api.get('/districts'),
          api.get('/sectors'),
        ]);
        setAgents(userResponse.data);
        setDistricts(districtResponse.data);
        setSectors(sectorResponse.data);
      } catch (err) {
        setStatusMessage(err.response?.data?.message || 'Impossible de charger les agents / listes');
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setSelectedAgentId(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', district: '', sector: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadAgents = async () => {
    const response = await api.get('/users');
    setAgents(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAgentId) {
        await api.put(`/users/${selectedAgentId}`, formData);
        setStatusMessage('Agent mis à jour avec succès.');
      } else {
        await api.post('/users', { ...formData, role: 'AGENT' });
        setStatusMessage('Agent ajouté avec succès.');
      }
      resetForm();
      await loadAgents();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Erreur lors de l enregistrement de l agent');
    }
  };

  const handleEdit = (agent) => {
    setSelectedAgentId(agent._id);
    setFormData({
      firstName: agent.firstName || '',
      lastName: agent.lastName || '',
      email: agent.email || '',
      phone: agent.phone || '',
      password: '',
      district: agent.district || '',
      sector: agent.sector || '',
    });
  };

  const handleDelete = async (agentId) => {
    if (!window.confirm('Supprimer cet agent ?')) return;
    try {
      await api.delete(`/users/${agentId}`);
      setStatusMessage('Agent supprimé avec succès.');
      await loadAgents();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Erreur lors de la suppression de l agent');
    }
  };

  const handleResetPasswordClick = (agentId) => {
    setResetAgentId(agentId);
    setResetPassword('');
    setStatusMessage(null);
  };

  const handleResetPasswordChange = (e) => {
    setResetPassword(e.target.value);
  };

  const handleResetPasswordSubmit = async (agentId) => {
    if (!resetPassword || resetPassword.length < 8) {
      setStatusMessage('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    try {
      await api.put(`/users/${agentId}/reset-password`, { password: resetPassword });
      setStatusMessage('Mot de passe réinitialisé avec succès.');
      setResetAgentId(null);
      setResetPassword('');
      await loadAgents();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
  };

  const handleToggleStatus = async (agent) => {
    try {
      const newStatus = agent.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.put(`/users/${agent._id}`, { status: newStatus });
      setStatusMessage(`Agent ${newStatus === 'ACTIVE' ? 'activé' : 'bloqué'} avec succès.`);
      await loadAgents();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Erreur lors du changement de statut');
    }
  };

  return (
    <div className="container space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Agents</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">Agents recenseurs</h2>
      </div>
      {statusMessage && <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">{statusMessage}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-slate-50 p-6 shadow-sm shadow-slate-200">
        <h3 className="text-xl font-semibold text-slate-900">{selectedAgentId ? 'Modifier un agent' : 'Créer un agent'}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Prénom</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nom</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Téléphone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Quartier attribué</label>
            <select name="district" value={formData.district} onChange={handleChange}>
              <option value="">Sélectionner</option>
              {districts.map((district) => (
                <option key={district._id} value={district.name}>{district.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Secteur attribué</label>
            <select name="sector" value={formData.sector} onChange={handleChange}>
              <option value="">Sélectionner</option>
              {sectors.map((sector) => (
                <option key={sector._id} value={sector.name}>{sector.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={selectedAgentId ? 'Laissez vide pour conserver le mot de passe' : ''}
            {...(!selectedAgentId ? { required: true } : {})}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            {selectedAgentId ? 'Enregistrer les modifications' : 'Créer l agent'}
          </button>
          {selectedAgentId && (
            <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Annuler
            </button>
          )}
        </div>
      </form>
      <div className="table-card overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Login</th>
              <th>Quartier</th>
              <th>Secteur</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent._id}>
                <td>{agent.firstName} {agent.lastName}</td>
                <td>{agent.email}</td>
                <td>{agent.district || '—'}</td>
                <td>{agent.sector || '—'}</td>
                <td>{agent.status}</td>
                <td className="flex flex-wrap gap-2 py-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(agent)}
                    className="rounded-2xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResetPasswordClick(agent._id)}
                    className="rounded-2xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    Réinitialiser le mot de passe
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(agent)}
                    className="rounded-2xl bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                  >
                    {agent.status === 'ACTIVE' ? 'Bloquer' : 'Débloquer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(agent._id)}
                    className="rounded-2xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                  >
                    Supprimer
                  </button>
                  {resetAgentId === agent._id && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        type="password"
                        value={resetPassword}
                        onChange={handleResetPasswordChange}
                        placeholder="Nouveau mot de passe"
                        className="rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleResetPasswordSubmit(agent._id)}
                        className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Valider
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetAgentId(null)}
                        className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Agents;
