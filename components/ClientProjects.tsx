
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Plus, Eye, MoreHorizontal, Home } from 'lucide-react';
import AddProjectModal from './AddProjectModal';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { collection, query, where, onSnapshot } from '@firebase/firestore';

interface ClientProjectsProps {
  client: any;
  userProfile: any;
}

const ClientProjects: React.FC<ClientProjectsProps> = ({ client, userProfile }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Charger les projets spécifiques à ce client
  useEffect(() => {
    if (!client?.id) return;

    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('clientId', '==', client.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [client?.id]);

  return (
    <div className="pt-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-[16px] font-bold text-gray-800">
          Liste des projets <span className="text-gray-300 font-normal ml-1">({projects.length})</span>
        </h3>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
        >
          <Plus size={16} /> 
          Ajouter un projet
        </button>
      </div>

      {/* Container Gris */}
      <div className="bg-[#f8f9fa] border border-gray-100 rounded-[24px] p-6 space-y-6 relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/20 z-10 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Barre de Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher projet" 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-lg text-[13px] text-gray-900 outline-none focus:border-gray-300 shadow-sm placeholder:text-gray-300"
            />
          </div>
          <div className="md:col-span-2.25 relative flex-1">
            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-lg text-[13px] text-gray-400 hover:bg-gray-50 transition-all">
              <span>Métier</span>
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="md:col-span-2.25 relative flex-1">
            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-lg text-[13px] text-gray-400 hover:bg-gray-50 transition-all">
              <span>Statut</span>
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="md:col-span-2.25 relative flex-1">
            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-lg text-[13px] text-gray-400 hover:bg-gray-50 transition-all">
              <span>Date</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Tableau des Projets */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-50 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                <th className="px-6 py-4 font-bold">Métier</th>
                <th className="px-6 py-4 font-bold">Nom du projet</th>
                <th className="px-6 py-4 font-bold">Agenceur(euse)</th>
                <th className="px-6 py-4 font-bold text-center">Statut</th>
                <th className="px-6 py-4 font-bold text-center">Type de propriété</th>
                <th className="px-6 py-4 font-bold text-center">Ajouté le</th>
                <th className="px-6 py-4 font-bold text-right">Action rapide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projects.length === 0 && !isLoading ? (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">
                     Aucun projet en cours pour ce client.
                   </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 text-[13px] font-bold text-gray-900">{project.metier}</td>
                    <td className="px-6 py-5 text-[13px] font-bold text-gray-900">{project.projectName}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <img src={project.agenceur?.avatar} alt="" className="w-6 h-6 rounded-full border border-gray-100" />
                        <span className="text-[13px] font-bold text-gray-900">{project.agenceur?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-tight ${project.statusColor}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 flex items-center justify-center border border-gray-100 rounded-lg bg-white text-gray-900">
                          <Home size={16} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-[13px] font-bold text-gray-900">{project.addedDate}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400 transition-all">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400 transition-all">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddProjectModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        userProfile={userProfile}
        clientId={client?.id}
        clientName={client?.name}
      />
    </div>
  );
};

export default ClientProjects;
