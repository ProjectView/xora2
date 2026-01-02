
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  PenSquare, 
  Calendar, 
  CheckSquare, 
  Trash2, 
  Phone, 
  Mail, 
  ChevronRight, 
  FileText, 
  Loader2, 
  MessageSquare,
  File as FileIcon
} from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { doc, onSnapshot, getDoc, collection, query, where } from '@firebase/firestore';
import ProjectGeneralDiscovery from './ProjectGeneralDiscovery';
import ProjectKitchenDiscovery from './ProjectKitchenDiscovery';
import ProjectTasks from './ProjectTasks';

interface ProjectDetailsProps {
  project: any;
  userProfile: any;
  onBack: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project: initialProject, userProfile, onBack }) => {
  const [activeTab, setActiveTab] = useState('Etude client');
  const [activeSubTab, setActiveSubTab] = useState('Découverte');
  
  const [project, setProject] = useState<any>(initialProject);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(doc(db, 'projects', initialProject.id), (docSnap) => {
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [initialProject.id]);

  // Écouter le nombre de tâches du projet en temps réel
  useEffect(() => {
    const q = query(collection(db, 'tasks'), where('projectId', '==', initialProject.id));
    const unsubTasks = onSnapshot(q, (snapshot) => {
      setTaskCount(snapshot.size);
    });
    return () => unsubTasks();
  }, [initialProject.id]);

  useEffect(() => {
    if (!project?.clientId) return;
    const fetchClient = async () => {
      const snap = await getDoc(doc(db, 'clients', project.clientId));
      if (snap.exists()) setClientData(snap.data());
    };
    fetchClient();
  }, [project?.clientId]);

  const ProgressCircle = ({ progress, color, size = "w-4 h-4" }: { progress: number; color: string; size?: string }) => {
    const strokeColor = color?.includes('D946EF') ? '#D946EF' : color?.includes('F97316') ? '#F97316' : color?.includes('0EA5E9') ? '#0EA5E9' : '#3B82F6';
    return (
      <svg className={`${size} mr-1.5`} viewBox="0 0 36 36">
        <path className="text-gray-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
        <path style={{ stroke: strokeColor }} strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  };

  const mainTabs = [
    { label: 'Etude client', key: 'Etude client' },
    { label: `Tâches (${taskCount})`, key: 'Tâches' },
    { label: 'Calendrier', key: 'Calendrier' },
    { label: 'Documents', key: 'Documents' }
  ];

  const subTabs = ['Découverte', 'Découverte cuisine', 'Présentation commerciale', 'Devis en cours'];

  if (loading && !project) {
    return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-gray-300" size={48} /></div>;
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      <div className="flex-1 flex flex-col h-full overflow-y-auto hide-scrollbar">
        
        {/* Header Principal */}
        <div className="px-8 py-6 bg-white shrink-0 border-b border-gray-100 shadow-sm z-20">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-6">
              <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 shadow-sm hover:bg-gray-50 transition-all">
                <ArrowLeft size={18} />
              </button>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-0.5 bg-gray-50 border border-gray-100 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest">{project.metier}</span>
                  <span className="text-[11px] font-bold text-gray-300">Créé le {project.addedDate}</span>
                </div>
                <div className="flex items-center gap-4">
                  <h1 className="text-[20px] font-bold text-gray-900">{project.projectName}</h1>
                  <div className="flex items-center gap-1.5">
                    <ProgressCircle progress={project.progress || 0} color="#D946EF" />
                    <span className="text-[12px] font-bold text-[#D946EF]">{project.progress}%</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tight ${project.statusColor || 'bg-gray-100 text-gray-400'}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-6 mb-1">
                <span className="text-[14px] font-bold text-gray-900 uppercase">{project.clientName}</span>
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-700">
                  <Phone size={14} className="text-gray-300" /> {clientData?.details?.phone || 'Non renseigné'}
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-700">
                  <Mail size={14} className="text-gray-300" /> {clientData?.details?.email || 'Non renseigné'}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <PenSquare size={16} /> Modifier le titre
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <Calendar size={16} /> Planifier un RDV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <CheckSquare size={16} /> Ajouter une tâche
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <Trash2 size={16} /> Projet perdu
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex gap-10">
              {mainTabs.map((tab) => (
                <button 
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 pb-4 text-[14px] font-bold transition-all relative ${activeTab === tab.key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full animate-in fade-in" />
                  )}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
              <FileText size={16} className="text-gray-400" /> Résumé des informations
            </button>
          </div>
        </div>

        {/* Sous-navigation Dynamique */}
        {(activeTab === 'Etude client') && (
          <div className="bg-white border-b border-gray-100 px-8 flex gap-12 shrink-0 z-10 sticky top-0">
            {subTabs.map((sub) => (
              <button 
                key={sub}
                onClick={() => setActiveSubTab(sub)}
                className={`py-4 text-[14px] font-bold transition-all relative ${
                  activeSubTab === sub 
                  ? 'text-gray-900' 
                  : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                {sub}
                {activeSubTab === sub && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 rounded-t-full animate-in slide-in-from-bottom-1" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Zone de contenu Principal */}
        <div className="p-8 space-y-6 flex-1 bg-[#F9FAFB]">
          
          {activeTab === 'Etude client' && activeSubTab === 'Découverte' && (
             <ProjectGeneralDiscovery project={project} userProfile={userProfile} />
          )}

          {activeTab === 'Etude client' && activeSubTab === 'Découverte cuisine' && (
             <ProjectKitchenDiscovery project={project} userProfile={userProfile} />
          )}

          {activeTab === 'Tâches' && (
            <ProjectTasks 
              projectId={project.id} 
              clientId={project.clientId}
              projectName={project.projectName}
              userProfile={userProfile} 
            />
          )}

          {activeTab === 'Etude client' && (activeSubTab !== 'Découverte' && activeSubTab !== 'Découverte cuisine') && (
            <div className="h-96 flex flex-col items-center justify-center text-center p-12 bg-white border border-gray-100 rounded-3xl animate-in fade-in duration-300 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
                <FileIcon size={40} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Section {activeSubTab}</h3>
              <p className="text-sm text-gray-400 max-w-sm">Cet espace est prêt à recevoir vos plans, présentations et documents relatifs à cette phase du projet.</p>
            </div>
          )}

          <div className="pb-20" />
        </div>
      </div>

      {/* Sidebar Droite */}
      <div className="w-24 bg-white border-l border-gray-100 flex flex-col items-center py-10 gap-8 shrink-0 relative shadow-lg">
        <button className="p-4 text-gray-400 hover:text-gray-900 transition-all"><ChevronRight size={24} className="rotate-180" /></button>
        <div className="w-12 h-px bg-gray-50"></div>
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <ProgressCircle progress={project.progress || 2} color="#D946EF" size="w-8 h-8" />
            <span className="text-[10px] font-bold text-gray-900">{project.progress || 2}%</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-40">
            <ProgressCircle progress={0} color="#3B82F6" size="w-8 h-8" />
            <span className="text-[10px] font-bold text-blue-500">0%</span>
          </div>
        </div>
        <div className="mt-auto flex flex-col items-center gap-4">
          <button className="p-4 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"><Mail size={22} /></button>
          <button className="p-4 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"><MessageSquare size={22} /></button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
