import React, { useEffect, useState } from 'react';
import api, { exportFile } from '../api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const photoUrl = (photo) => photo ? (photo.startsWith('http') ? photo : `${BACKEND_URL}/${photo}`) : null;

const People = () => {
  const [people, setPeople] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ district: '', sector: '', household: '' });
  const [formData, setFormData] = useState({
    household: '',
    firstName: '',
    lastName: '',
    gender: 'M',
    birthDate: '',
    profession: '',
    maritalStatus: '',
    educationLevel: '',
    phone: '',
    relationToHead: '',
    district: '',
    sector: '',
    photo: '',
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingPersonId, setEditingPersonId] = useState(null);

  const formatQuery = (params) =>
    Object.entries(params)
      .filter(([, value]) => value)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

  const exportQuery = formatQuery({
    search,
    district: filter.district,
    sector: filter.sector,
    household: filter.household,
  });

  const loadPeople = async () => {
    const response = await api.get(`/people?search=${encodeURIComponent(search)}&district=${filter.district}&sector=${filter.sector}&household=${filter.household}`);
    setPeople(response.data);
  };

  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem('user')) || null);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [peopleResponse, householdResponse, districtResponse, sectorResponse] = await Promise.all([
          api.get(`/people?search=${encodeURIComponent(search)}&district=${filter.district}&sector=${filter.sector}&household=${filter.household}`),
          api.get('/households'),
          api.get('/districts'),
          api.get('/sectors'),
        ]);

        setPeople(peopleResponse.data);
        setHouseholds(householdResponse.data);
        setDistricts(districtResponse.data);
        setSectors(sectorResponse.data);
      } catch (err) {
        setStatusMessage(err.response?.data?.message || 'Impossible de charger les personnes');
      }
    };
    load();
  }, [search, filter]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData({ ...formData, photo: file });
    setPhotoPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setEditingPersonId(null);
    setFormData({
      household: '',
      firstName: '',
      lastName: '',
      gender: 'M',
      birthDate: '',
      profession: '',
      maritalStatus: '',
      educationLevel: '',
      phone: '',
      relationToHead: '',
      district: '',
      sector: '',
      photo: '',
    });
    setPhotoPreview('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        data.append(key, value);
      }
    });

    if (editingPersonId) {
      await api.put(`/people/${editingPersonId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatusMessage("Personne mise à jour avec succès.");
    } else {
      await api.post("/people", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatusMessage("Personne ajoutée avec succès.");
    }

    resetForm();
    await loadPeople();

  } catch (err) {
    console.error(err);

    setStatusMessage(
      err.response?.data?.message ||
      "Erreur lors de l'enregistrement de la personne."
    );
  }
};

  const handleEditPerson = (person) => {
    setEditingPersonId(person._id);
    setFormData({
      household: person.household?._id || '',
      firstName: person.firstName || '',
      lastName: person.lastName || '',
      gender: person.gender || 'M',
      birthDate: person.birthDate ? person.birthDate.split('T')[0] : '',
      profession: person.profession || '',
      maritalStatus: person.maritalStatus || '',
      educationLevel: person.educationLevel || '',
      phone: person.phone || '',
      relationToHead: person.relationToHead || '',
      district: person.district || '',
      sector: person.sector || '',
      photo: person.photo || '',
    });
    setPhotoPreview(photoUrl(person.photo) || '');
  };

  const handleDeletePerson = async (personId) => {
    if (!window.confirm('Supprimer cette personne ?')) return;
    try {
      await api.delete(`/people/${personId}`);
      setStatusMessage('Personne supprimée avec succès.');
      await loadPeople();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Erreur lors de la suppression de la personne');
    }
  };

  return (
    <div className="container space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Populations</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Gestion des personnes</h2>
        </div>
        <div className="grid gap-3 sm:flex sm:items-center">
          <input
            className="max-w-md"
            placeholder="Recherche par nom, relation ou téléphone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {statusMessage && <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">{statusMessage}</div>}

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="table-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Liste des personnes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => exportFile(`/people/export/excel${exportQuery ? `?${exportQuery}` : ''}`, 'people.xlsx')}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Export Excel
              </button>
              <button
                type="button"
                onClick={() => exportFile(`/people/export/pdf${exportQuery ? `?${exportQuery}` : ''}`, 'people.pdf', true)}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Export PDF
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Imprimer
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 px-4 pb-4">
            <select name="district" value={filter.district} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 px-4 py-2">
              <option value="">Tous les quartiers</option>
              {districts.map((district) => (
                <option key={district._id} value={district.name}>{district.name}</option>
              ))}
            </select>
            <select name="sector" value={filter.sector} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 px-4 py-2">
              <option value="">Tous les secteurs</option>
              {sectors.map((sector) => (
                <option key={sector._id} value={sector.name}>{sector.name}</option>
              ))}
            </select>
            <select name="household" value={filter.household} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 px-4 py-2">
              <option value="">Tous les ménages</option>
              {households.map((household) => (
                <option key={household._id} value={household._id}>{household.number} - {household.headName}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Photo</th>
                  <th>Lien</th>
                  <th>Quartier</th>
                  <th>Secteur</th>
                  <th>Ménage</th>
                  <th>Téléphone</th>
                  {currentUser?.role === 'ADMIN' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person._id}>
                    <td>{person.firstName} {person.lastName}</td>
                    <td>
                      {person.photo ? (
                        <img src={photoUrl(person.photo)} alt="photo" className="h-12 w-12 rounded-full object-cover" />
                      ) : '—'}
                    </td>
                    <td>{person.relationToHead}</td>
                    <td>{person.district || person.household?.district || '—'}</td>
                    <td>{person.sector || person.household?.sector || '—'}</td>
                    <td>{person.household ? `${person.household.number} (${person.household.headName})` : '—'}</td>
                    <td>{person.phone || '—'}</td>
                    {currentUser?.role === 'ADMIN' && (
                      <td className="flex flex-wrap gap-2 py-2">
                        <button
                          type="button"
                          onClick={() => handleEditPerson(person)}
                          className="rounded-2xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePerson(person._id)}
                          className="rounded-2xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                        >
                          Supprimer
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-slate-50 p-6 shadow-sm shadow-slate-200">
          <h3 className="text-xl font-semibold text-slate-900">{editingPersonId ? 'Modifier une personne' : 'Ajouter une personne'}</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700">Ménage</label>
            <select name="household" value={formData.household} onChange={handleChange} required>
              <option value="">Sélectionner un ménage</option>
              {households.map((household) => (
                <option key={household._id} value={household._id}>{household.number} - {household.headName}</option>
              ))}
            </select>
          </div>
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
              <label className="block text-sm font-medium text-slate-700">Genre</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="M">M</option>
                <option value="F">F</option>
                <option value="Other">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Date de naissance</label>
              <input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Relation au chef</label>
            <input name="relationToHead" value={formData.relationToHead} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Téléphone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Quartier (optionnel)</label>
            <select name="district" value={formData.district} onChange={handleChange}>
              <option value="">Auto ou sélectionner</option>
              {districts.map((district) => (
                <option key={district._id} value={district.name}>{district.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Secteur (optionnel)</label>
            <select name="sector" value={formData.sector} onChange={handleChange}>
              <option value="">Auto ou sélectionner</option>
              {sectors.map((sector) => (
                <option key={sector._id} value={sector.name}>{sector.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Photo (optionnel)</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
            />
            {photoPreview && (
              <img src={photoPreview} alt="Aperçu" className="mt-3 h-24 w-24 rounded-xl object-cover" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Profession</label>
            <input name="profession" value={formData.profession} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">État civil</label>
            <input name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Niveau d'études</label>
            <input name="educationLevel" value={formData.educationLevel} onChange={handleChange} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              {editingPersonId ? 'Enregistrer les modifications' : 'Ajouter la personne'}
            </button>
            {editingPersonId && (
              <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default People;
