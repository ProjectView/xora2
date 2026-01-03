
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  ArrowUpRight, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft,
  MoreHorizontal,
  Briefcase
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from '@firebase/firestore';

interface Project {
  id: string;
  clientName: string;
  agenceur: { name: string; avatar: string };
  projectName: string;
  status: string;
  progress: number;
  statusColor: string;
  addedDate: string;
}

interface ProjectTrackingProps {
  userProfile: any;
  onProjectClick?: (project: Project) => void;
}

const ProjectTracking: React.FC<ProjectTrackingProps> = ({ userProfile, onProjectClick }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!userProfile?.companyId) return;

    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('companyId', '==', userProfile.companyId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.companyId]);

  const ProgressCircle = ({ progress, color }: { progress: number; color: string }) => {
    const strokeColor = color?.includes('D946EF') ? '#D946EF' : color?.includes('F97316') ? '#F97316' : color?.includes('0EA5E9') ? '#0EA5E9' : '#3B82F6';
    return (
      <svg className="w-4 h-4 mr-1.5" viewBox="0 0 36 36">
        <path
          className="text-gray-100"
          strokeDasharray="100, 100"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          style={{ stroke: strokeColor }}
          strokeDasharray={`${progress}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  const filteredProjects = projects.filter(p => 
    p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-[calc(100vh-64px)] flex flex-col font-sans">
      
      {/* BLOC 1 : Titre (Style Annuaire, sans filtres principaux) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
            <Briefcase size={20} className="text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Suivi des projets</h2>
            <span className="text-gray-400 text-sm font-medium">({filteredProjects.length})</span>
        </div>
      </div>

      {/* BLOC 2 : Barre de Recherche et Filtres Secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher un client, un projet..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400 text-gray-800 shadow-sm transition-all"
          />
        </div>
        
        {['Agenceur.se', 'Statut', "Date d'ajout"].map((filter) => (
          <div key={filter} className="md:col-span-2 relative">
            <button className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-500 hover:bg-gray-50 shadow-sm transition-all">
              <span className="truncate">{filter}</span>
              <ChevronDown size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* BLOC 3 : Tableau des projets */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden relative min-h-[500px]">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <Briefcase size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Aucun projet trouvé pour cette recherche.</p>
          </div>
        ) : null}

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Nom & prénom</th>
                <th className="px-6 py-4">Agenceur.s</th>
                <th className="px-6 py-4">Nom du projet</th>
                <th className="px-6 py-4 text-center">Statut du projet</th>
                <th className="px-6 py-4 text-center">Ajouté le</th>
                <th className="px-6 py-4 text-right">Action rapide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => (
                <tr 
                  key={project.id} 
                  onClick={() => onProjectClick?.(project)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      {project.clientName}
                      <ArrowUpRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={project.agenceur?.avatar} alt="" className="w-6 h-6 rounded-full mr-2 border border-gray-100 shadow-sm" />
                      <span className="text-sm font-medium text-gray-800">{project.agenceur?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                    {project.projectName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <span className={`px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-tight ${project.statusColor || 'bg-gray-100 text-gray-600'}`}>
                        {project.status}
                      </span>
                      <div className="flex items-center opacity-60">
                        <ProgressCircle progress={project.progress || 0} color={project.statusColor || ''} />
                        <span className="text-[11px] font-bold">{project.progress || 0}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    {project.addedDate}
                  </td>
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

        {/* Pied de page style Annuaire */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400 bg-white">
          <div>Actuellement <span className="font-bold text-gray-900">1 à {filteredProjects.length} sur {filteredProjects.length}</span> résultats</div>
          <div className="flex items-center space-x-2">
            <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-50"><ChevronsLeft size={16} /></button>
            <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-50"><ChevronLeft size={16} /></button>
            <button className="w-7 h-7 bg-gray-900 text-white rounded-md text-xs font-bold shadow-md">1</button>
            <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-50"><ChevronRight size={16} /></button>
            <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-50 rotate-180"><ChevronsLeft size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTracking;
