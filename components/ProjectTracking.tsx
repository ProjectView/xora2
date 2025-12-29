
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  ArrowUpRight, 
  Eye, 
  Mail, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft 
} from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
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

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-full flex flex-col space-y-6">
      {/* Filtres de recherche */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un client/projet" 
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-gray-300 shadow-sm placeholder:text-gray-400"
          />
        </div>
        
        {['Agenceur.se', 'Statut', 'Date d\'ajout'].map((filter) => (
          <div key={filter} className="relative w-48">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-400 hover:bg-gray-50 transition-all shadow-sm">
              <span>{filter}</span>
              <ChevronDown size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Tableau des projets */}
      <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm flex flex-col flex-1 overflow-hidden min-h-[500px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FCFCFD] border-b border-gray-50 text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                <th className="px-8 py-5">Nom & prénom</th>
                <th className="px-8 py-5">Agenceur.s</th>
                <th className="px-8 py-5">Nom du projet</th>
                <th className="px-8 py-5">Statut du projet</th>
                <th className="px-8 py-5">Ajouté le</th>
                <th className="px-8 py-5 text-right">Action rapide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projects.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search size={24} className="text-gray-200" />
                      </div>
                      <p className="text-sm font-bold">Aucun projet trouvé pour votre société.</p>
                      <p className="text-xs mt-1">Créez un projet depuis la fiche d'un client.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-bold text-gray-900">{project.clientName}</span>
                        <ArrowUpRight size={14} className="text-gray-400" />
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <img src={project.agenceur?.avatar} alt="" className="w-7 h-7 rounded-full border border-gray-100 shadow-sm" />
                        <span className="text-[13.5px] font-bold text-gray-900">{project.agenceur?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[13.5px] font-bold text-gray-900">
                      {project.projectName}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-tight ${project.statusColor || 'bg-gray-100 text-gray-400'}`}>
                          {project.status}
                        </span>
                        <div className="flex items-center">
                          <ProgressCircle progress={project.progress || 0} color={project.statusColor || ''} />
                          <span className={`text-[11px] font-bold ${project.statusColor?.split(' ')[1] || 'text-gray-400'}`}>{project.progress || 0}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[13.5px] font-bold text-gray-900">
                      {project.addedDate}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onProjectClick?.(project)}
                          className="p-2 border border-gray-100 rounded-xl hover:bg-gray-100 text-gray-800 shadow-sm transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="p-2 border border-gray-100 rounded-xl hover:bg-gray-100 text-gray-800 shadow-sm transition-all">
                          <Mail size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pied de page / Pagination */}
        <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-white shrink-0">
          <div className="text-[12px] text-gray-400">
            Actuellement <span className="font-bold text-gray-900">1 à {projects.length} sur {projects.length}</span> résultats
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 transition-all"><ChevronsLeft size={16} /></button>
            <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 transition-all"><ChevronLeft size={16} /></button>
            <button className="w-9 h-9 flex items-center justify-center bg-[#1A1C23] text-white rounded-lg text-[12px] font-bold shadow-md">1</button>
            <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 transition-all"><ChevronRight size={16} /></button>
            <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 transition-all rotate-180"><ChevronsLeft size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTracking;
