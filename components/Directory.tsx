
import React, { useState, useEffect } from 'react';
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
  ChevronsLeft
} from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { collection, query, where, onSnapshot } from '@firebase/firestore';
import { Client } from '../types';

interface DirectoryProps {
  userProfile: any;
  onAddClick: () => void;
  onClientClick: (client: Client) => void;
}

const Directory: React.FC<DirectoryProps> = ({ userProfile, onAddClick, onClientClick }) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeTab, setActiveTab] = useState('Tous');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les clients de la société en temps réel
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

  const tabs = [
    { label: 'Tous', count: clients.length },
    { label: 'Leads', count: clients.filter(c => c.status === 'Leads').length },
    { label: 'Prospects', count: clients.filter(c => c.status === 'Prospect').length },
    { label: 'Clients', count: clients.filter(c => c.status === 'Client').length },
  ];

  const filteredClients = activeTab === 'Tous' 
    ? clients 
    : clients.filter(c => c.status === activeTab);

  useEffect(() => {
    if (viewMode === 'map') {
        const L = (window as any).L;
        if (!L) return;

        setTimeout(() => {
            const container = document.getElementById('map-container');
            if (!container || (container as any)._leaflet_id) return;

            const map = L.map('map-container').setView([43.2474, 3.2905], 11);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(map);

            // Ajouter des marqueurs pour les clients
            clients.forEach((client) => {
                if ((client as any).details?.lat && (client as any).details?.lng) {
                  L.marker([(client as any).details.lat, (client as any).details.lng]).addTo(map).bindPopup(client.name);
                }
            });
            
            setTimeout(() => { map.invalidateSize(); }, 100);
        }, 100);
    }
  }, [viewMode, clients]);

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-[calc(100vh-64px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-2 bg-white rounded-md border border-gray-200 flex p-1 shadow-sm">
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
                placeholder="Rechercher" 
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400 text-gray-800 shadow-sm transition-all"
            />
        </div>

        {['Agenceur.se', 'Origine', 'Localisation', 'Projet(s)', "Date d'ajout"].map((filter) => (
            <div key={filter} className="md:col-span-1.5 relative">
                 <button className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-500 hover:bg-gray-50 shadow-sm transition-all">
                    <span className="truncate">{filter}</span>
                    <ChevronDown size={14} />
                 </button>
            </div>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden relative shadow-sm min-h-[500px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
            <div className="w-8 h-8 border-3 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <Users size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Aucun client trouvé dans cette catégorie.</p>
            <button onClick={onAddClick} className="mt-4 text-gray-900 font-bold text-sm hover:underline">Créer votre premier client</button>
          </div>
        ) : null}

        {viewMode === 'map' && <div id="map-container" className="w-full h-full min-h-[500px] z-0" />}

        {viewMode === 'list' && (
            <div className="flex flex-col h-full">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                                <th className="px-6 py-4">Nom & prénom</th>
                                <th className="px-6 py-4">Ajouté par</th>
                                <th className="px-6 py-4">Origine</th>
                                <th className="px-6 py-4">Localisation</th>
                                <th className="px-6 py-4">Projets en cours</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4">Ajouté le</th>
                                <th className="px-6 py-4 text-right">Action rapide</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredClients.map((client) => (
                                <tr 
                                    key={client.id} 
                                    onClick={() => onClientClick(client)}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{client.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <img src={client.addedBy.avatar} alt="" className="w-6 h-6 rounded-full mr-2 border border-gray-100 shadow-sm" />
                                            <span className="text-sm font-medium text-gray-800">{client.addedBy.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{client.origin}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{client.location}</td>
                                    <td className="px-6 py-4">
                                        {client.projectCount === 0 || !client.projectCount ? (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-full">-</span>
                                        ) : (
                                            <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-700 text-[11px] rounded-full font-bold">{client.projectCount} projets</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-tight ${
                                            client.status === 'Prospect' ? 'bg-fuchsia-100 text-fuchsia-800' :
                                            client.status === 'Client' ? 'bg-cyan-100 text-cyan-700' :
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{client.dateAdded}</td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end space-x-2">
                                            <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400 shadow-sm transition-all">
                                                <Eye size={16} />
                                            </button>
                                            <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400 shadow-sm transition-all">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400 bg-white">
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
    </div>
  );
};

export default Directory;
