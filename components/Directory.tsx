
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  Plus, 
  List, 
  Map as MapIcon, 
  Search, 
  ChevronDown, 
  Eye, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft,
  X,
  Filter,
  PenSquare,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from '@firebase/firestore';
import { Client } from '../types';
import DirectoryMap from './DirectoryMap';
import Modal from './Modal';

interface DirectoryProps {
  userProfile: any;
  initialTab?: string;
  onAddClick: () => void;
  onClientClick: (client: Client) => void;
}

const Directory: React.FC<DirectoryProps> = ({ userProfile, initialTab = 'Tous', onAddClick, onClientClick }) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // États des filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgenceur, setFilterAgenceur] = useState('');
  const [filterOrigine, setFilterOrigine] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // États des actions (modification/suppression)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mettre à jour l'onglet actif si la prop change
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Charger les clients
  useEffect(() => {
    if (!userProfile?.companyId) return;
    const clientsRef = collection(db, 'clients');
    const q = query(clientsRef, where('companyId', '==', userProfile.companyId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      setClients(clientsList);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [userProfile?.companyId]);

  // Fermer les dropdowns au clic extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Règle de gestion : Statut effectif basé sur les projets en cours
  const getEffectiveStatus = (c: Client) => {
    if (c.status === 'Client') return 'Client';
    // Si au moins 1 projet, devient automatiquement Prospect
    if ((c.projectCount || 0) > 0) return 'Prospect';
    return c.status;
  };

  // Extraction des valeurs uniques pour les filtres
  const uniqueAgenceurs = useMemo(() => 
    Array.from(new Set(clients.map(c => c.addedBy?.name).filter(Boolean))).sort(), 
  [clients]);
  
  const uniqueOrigines = useMemo(() => 
    Array.from(new Set(clients.map(c => c.origin).filter(Boolean))).sort(), 
  [clients]);
  
  const uniqueLocations = useMemo(() => 
    Array.from(new Set(clients.map(c => c.location).filter(Boolean))).sort(), 
  [clients]);

  // Logique de filtrage globale
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const effectiveStatus = getEffectiveStatus(c);
      const matchesTab = activeTab === 'Tous' || effectiveStatus === activeTab;
      const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAgenceur = !filterAgenceur || c.addedBy?.name === filterAgenceur;
      const matchesOrigine = !filterOrigine || c.origin === filterOrigine;
      const matchesLocation = !filterLocation || c.location === filterLocation;
      const matchesProject = !filterProject || (filterProject === 'Avec projet(s)' ? (c.projectCount || 0) > 0 : (c.projectCount || 0) === 0);
      
      return matchesTab && matchesSearch && matchesAgenceur && matchesOrigine && matchesLocation && matchesProject;
    });
  }, [clients, activeTab, searchQuery, filterAgenceur, filterOrigine, filterLocation, filterProject]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterAgenceur('');
    setFilterOrigine('');
    setFilterLocation('');
    setFilterProject('');
  };

  const handleEditRequest = (client: Client) => {
    setClientToEdit(client);
    setIsEditModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'clients', clientToDelete.id));
      setClientToDelete(null);
    } catch (e) {
      console.error("Erreur lors de la suppression client:", e);
      alert("Une erreur est survenue lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = searchQuery || filterAgenceur || filterOrigine || filterLocation || filterProject;

  const FilterButton = ({ label, value, options, onSelect, id }: any) => (
    <div className="relative flex-1 min-w-[140px]">
      <button 
        onClick={() => setActiveDropdown(activeDropdown === id ? null : id)}
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-md text-sm transition-all shadow-sm ${
          value ? 'border-indigo-500 text-indigo-700 font-bold bg-indigo-50/30' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
        }`}
      >
        <span className="truncate">{value || label}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === id ? 'rotate-180' : ''}`} />
      </button>
      
      {activeDropdown === id && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[60] py-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <button 
            onClick={() => { onSelect(''); setActiveDropdown(null); }}
            className="w-full text-left px-4 py-2 text-xs font-bold text-gray-400 hover:bg-gray-50 italic border-b border-gray-50 mb-1"
          >
            Réinitialiser
          </button>
          {options.map((opt: string) => (
            <button 
              key={opt}
              onClick={() => { onSelect(opt); setActiveDropdown(null); }}
              className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-indigo-50 transition-colors ${
                value === opt ? 'text-indigo-600 font-black bg-indigo-50/50' : 'text-gray-700 font-medium'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Mise à jour des compteurs d'onglets pour refléter le statut effectif
  const tabs = useMemo(() => [
    { label: 'Tous', count: clients.length },
    { label: 'Leads', count: clients.filter(c => getEffectiveStatus(c) === 'Leads').length },
    { label: 'Prospects', count: clients.filter(c => getEffectiveStatus(c) === 'Prospect').length },
    { label: 'Clients', count: clients.filter(c => getEffectiveStatus(c) === 'Client').length },
  ], [clients]);

  return (
    <div className="p-6 space-y-4 bg-gray-50 h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-1">
             <div className="flex items-center space-x-2 mr-4">
                 <Users size={20} className="text-gray-700" />
                 <span className="font-bold text-lg text-gray-900">{activeTab}</span>
                 <span className="text-gray-400 text-sm">({filteredClients.length})</span>
             </div>
             
             <div className="flex bg-gray-200 rounded-full p-1 space-x-1">
                 {tabs.map(tab => (
                     <button
                        key={tab.label}
                        onClick={() => setActiveTab(tab.label)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            activeTab === tab.label 
                            ? 'bg-gray-800 text-white shadow-sm' 
                            : 'text-gray-600 hover:bg-gray-300'
                        }`}
                     >
                         {tab.label} <span className="opacity-70 ml-1">({tab.count})</span>
                     </button>
                 ))}
             </div>
        </div>

        <div className="flex items-center space-x-3">
            <button 
                onClick={onAddClick}
                className="flex items-center px-4 py-2.5 bg-gray-900 text-white border border-gray-900 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
                <Plus size={16} className="mr-2" />
                Ajouter une fiche leads
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 shrink-0 items-center" ref={dropdownRef}>
        <div className="md:col-span-2 bg-white rounded-md border border-gray-200 flex p-1 shadow-sm h-[42px]">
            <button 
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center rounded py-1.5 text-sm font-medium transition-all ${
                    viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <List size={16} className="mr-2" />
                Liste
            </button>
            <button 
                onClick={() => setViewMode('map')}
                className={`flex-1 flex items-center justify-center rounded py-1.5 text-sm font-medium transition-all ${
                    viewMode === 'map' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <MapIcon size={16} className="mr-2" />
                Map
            </button>
        </div>

        <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
                type="text" 
                placeholder="Rechercher un client" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-indigo-400 text-gray-800 shadow-sm transition-all"
            />
        </div>

        <div className="md:col-span-8 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <FilterButton 
            id="agenceur"
            label="Agenceur.se" 
            value={filterAgenceur} 
            options={uniqueAgenceurs} 
            onSelect={setFilterAgenceur} 
          />
          <FilterButton 
            id="origine"
            label="Origine" 
            value={filterOrigine} 
            options={uniqueOrigines} 
            onSelect={setFilterOrigine} 
          />
          <FilterButton 
            id="localisation"
            label="Localisation" 
            value={filterLocation} 
            options={uniqueLocations} 
            onSelect={setFilterLocation} 
          />
          <FilterButton 
            id="projet"
            label="Projet(s)" 
            value={filterProject} 
            options={['Avec projet(s)', 'Sans projet']} 
            onSelect={setFilterProject} 
          />

          {hasActiveFilters && (
            <button 
              onClick={resetFilters}
              className="px-3 py-2 bg-white border border-red-200 text-red-500 rounded-md text-sm font-bold hover:bg-red-50 transition-all flex items-center shrink-0"
              title="Réinitialiser les filtres"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden relative shadow-sm flex flex-col min-h-0">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
            <div className="w-8 h-8 border-3 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center z-10">
            <Filter size={48} className="mb-4 opacity-10" />
            <p className="text-sm font-bold text-gray-500">Aucun résultat pour ces filtres.</p>
            <button onClick={resetFilters} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">Effacer tous les filtres</button>
          </div>
        ) : null}

        {viewMode === 'map' && (
          <DirectoryMap 
            clients={filteredClients} 
            onClientClick={onClientClick} 
          />
        )}

        {viewMode === 'list' && (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="overflow-x-auto flex-1 overflow-y-auto hide-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-400 uppercase font-bold tracking-wider sticky top-0 z-10">
                                <th className="px-6 py-4">Nom & prénom</th>
                                <th className="px-6 py-4">Ajouté par</th>
                                <th className="px-6 py-4">Origine</th>
                                <th className="px-6 py-4">Localisation</th>
                                <th className="px-6 py-4 text-center">Projet(s)</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4">Ajouté le</th>
                                <th className="px-6 py-4 text-right">Action rapide</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredClients.map((client) => {
                                const effectiveStatus = getEffectiveStatus(client);
                                return (
                                <tr 
                                    key={client.id} 
                                    onClick={() => onClientClick(client)}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 uppercase">{client.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <img src={client.addedBy?.avatar} alt="" className="w-6 h-6 rounded-full mr-2 border border-gray-100 shadow-sm" />
                                            <span className="text-sm font-medium text-gray-800">{client.addedBy?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{client.origin}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{client.location}</td>
                                    <td className="px-6 py-4">
                                        {!client.projectCount || client.projectCount === 0 ? (
                                            <div className="flex justify-center">
                                              <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-300 text-[11px] font-bold rounded-full">-</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                              <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">
                                                {client.projectCount}
                                              </div>
                                              <span className="text-[11px] font-bold text-gray-700">projet{client.projectCount > 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-tight ${
                                            effectiveStatus === 'Prospect' ? 'bg-fuchsia-100 text-fuchsia-800' :
                                            effectiveStatus === 'Client' ? 'bg-cyan-100 text-cyan-700' :
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                            {effectiveStatus === 'Leads' ? 'Études' : effectiveStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{client.dateAdded}</td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end space-x-2 relative">
                                            <button 
                                                onClick={() => onClientClick(client)}
                                                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400 shadow-sm transition-all"
                                                title="Voir détails"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setActiveMenuId(activeMenuId === client.id ? null : client.id)}
                                                    className={`p-1.5 border border-gray-200 rounded-lg transition-all ${activeMenuId === client.id ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>

                                                {activeMenuId === client.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
                                                        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 w-48 animate-in fade-in zoom-in-95 duration-150 text-left">
                                                            <button 
                                                                onClick={() => handleEditRequest(client)}
                                                                className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <PenSquare size={14} className="text-gray-400" /> Modifier la fiche
                                                            </button>
                                                            <div className="h-px bg-gray-50 my-1 mx-2" />
                                                            <button 
                                                                onClick={() => { setClientToDelete(client); setActiveMenuId(null); }}
                                                                className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 size={14} /> Supprimer la fiche
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400 bg-white shrink-0">
                    <div>Actuellement <span className="font-bold text-gray-900">1 à {filteredClients.length} sur {filteredClients.length}</span> résultats</div>
                    <div className="flex items-center space-x-2">
                        <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-50"><ChevronsLeft size={16} /></button>
                        <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-50"><ChevronLeft size={16} /></button>
                        <button className="w-7 h-7 bg-gray-900 text-white rounded-md text-xs font-bold shadow-md">1</button>
                        <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-50"><ChevronRight size={16} /></button>
                        <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-50 rotate-180"><ChevronsLeft size={16} /></button>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Popup de confirmation de suppression */}
      {clientToDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center text-red-500 mb-8 shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Supprimer la fiche client ?</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed mb-10">
                Vous êtes sur le point de supprimer définitivement la fiche de <br/>
                <span className="font-bold text-gray-900">"{clientToDelete.name}"</span>.<br/>
                Cette action supprimera également tous les documents liés.
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setClientToDelete(null)} 
                  disabled={isDeleting}
                  className="flex-1 px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold text-[13px] hover:bg-gray-100 transition-all border border-gray-100"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleDeleteConfirm} 
                  disabled={isDeleting}
                  className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold text-[13px] hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'édition réutilisant la modale de création */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setClientToEdit(null); }} 
        userProfile={userProfile}
        clientToEdit={clientToEdit}
      />
    </div>
  );
};

export default Directory;
