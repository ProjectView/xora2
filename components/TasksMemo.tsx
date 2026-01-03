
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  MoreVertical, 
  GripVertical,
  Loader2,
  PenSquare,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  CheckSquare
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from '@firebase/firestore';
import { Task } from '../types';
import AddTaskModal from './AddTaskModal';

interface TasksMemoProps {
  userProfile?: any;
}

const TasksMemo: React.FC<TasksMemoProps> = ({ userProfile }) => {
  const [activeStatusTab, setActiveStatusTab] = useState<'en-cours' | 'termine'>('en-cours');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!userProfile?.companyId) return;
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('companyId', '==', userProfile.companyId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[]);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [userProfile?.companyId]);

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
      setActiveMenuId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsAddTaskModalOpen(true);
    setActiveMenuId(null);
  };

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'tasks', id), { status });
    } catch (e) {
      console.error(e);
    }
  };

  const counts = {
    enCours: tasks.filter(t => t.status !== 'completed').length,
    termine: tasks.filter(t => t.status === 'completed').length
  };

  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeStatusTab === 'en-cours' ? task.status !== 'completed' : task.status === 'completed';
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || (task.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-[calc(100vh-64px)] flex flex-col font-sans">
      
      {/* BLOC 1 : Titre et Filtres Principaux (Style Annuaire) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-1">
             <div className="flex items-center space-x-2 mr-4">
                 <CheckSquare size={20} className="text-gray-700" />
                 <span className="font-bold text-lg text-gray-900">
                   {activeStatusTab === 'en-cours' ? 'Tâches en cours' : 'Tâches terminées'}
                 </span>
                 <span className="text-gray-400 text-sm">
                   ({activeStatusTab === 'en-cours' ? counts.enCours : counts.termine})
                 </span>
             </div>
             
             <div className="flex bg-gray-200 rounded-full p-1 space-x-1">
                 <button
                    onClick={() => setActiveStatusTab('en-cours')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        activeStatusTab === 'en-cours' 
                        ? 'bg-gray-800 text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-300'
                    }`}
                 >
                     En cours <span className="opacity-70 ml-1">({counts.enCours})</span>
                 </button>
                 <button
                    onClick={() => setActiveStatusTab('termine')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        activeStatusTab === 'termine' 
                        ? 'bg-gray-800 text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-300'
                    }`}
                 >
                     Terminé <span className="opacity-70 ml-1">({counts.termine})</span>
                 </button>
             </div>
        </div>

        <div className="flex items-center space-x-3">
            <button 
                onClick={() => { setEditingTask(null); setIsAddTaskModalOpen(true); }}
                className="flex items-center px-4 py-2.5 bg-gray-900 text-white border border-gray-900 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
                <Plus size={16} className="mr-2" />
                Ajouter une tâche
            </button>
        </div>
      </div>

      {/* BLOC 2 : Barre de Recherche et Filtres Secondaires (Style Annuaire) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
                type="text" 
                placeholder="Rechercher une tâche, un projet..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400 text-gray-800 shadow-sm transition-all"
            />
        </div>

        {['Type', 'Collaborateur', 'Échéance'].map((filter) => (
            <div key={filter} className="md:col-span-2 relative">
                 <button className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-500 hover:bg-gray-50 shadow-sm transition-all">
                    <span className="truncate">{filter}</span>
                    <ChevronDown size={14} />
                 </button>
            </div>
        ))}
      </div>

      {/* BLOC 3 : Le Tableau (Style Annuaire) */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden relative shadow-sm min-h-[500px] flex flex-col">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
            <div className="w-8 h-8 border-3 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <CheckSquare size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Aucune tâche trouvée dans cette catégorie.</p>
          </div>
        ) : null}

        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                        <th className="px-6 py-4 w-12 text-center">#</th>
                        <th className="px-6 py-4">Titre & Projet</th>
                        <th className="px-6 py-4 text-center">Type</th>
                        <th className="px-6 py-4 text-center">Statut</th>
                        <th className="px-6 py-4 text-center">Échéance</th>
                        <th className="px-6 py-4">Collaborateur</th>
                        <th className="px-6 py-4 text-right">Action rapide</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4 text-center">
                              <GripVertical size={16} className="text-gray-200 mx-auto group-hover:text-gray-400 transition-colors" />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900">{task.title}</span>
                                    {task.subtitle && <span className="text-[11px] font-bold text-indigo-400 uppercase">{task.subtitle}</span>}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-black rounded uppercase tracking-tighter">
                                  {task.type}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-tight ${
                                    task.tagColor === 'purple' ? 'bg-purple-100 text-purple-700' : 
                                    task.tagColor === 'pink' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {task.statusLabel || 'Sans marqueur'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                                <span className={task.isLate ? 'text-red-500' : ''}>{task.date || '-'}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <img src={task.collaborator.avatar} className="w-6 h-6 rounded-full mr-2 border border-gray-100" alt="" />
                                    <span className="text-sm font-medium text-gray-800">{task.collaborator.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end space-x-2 relative">
                                    <button onClick={() => handleEditClick(task)} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400 shadow-sm transition-all">
                                      <PenSquare size={16} />
                                    </button>
                                    <button 
                                      onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)} 
                                      className={`p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400 shadow-sm transition-all ${activeMenuId === task.id ? 'bg-gray-100 text-gray-900' : ''}`}
                                    >
                                      <MoreHorizontal size={16} />
                                    </button>
                                    {activeMenuId === task.id && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                                            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 w-40 py-2 animate-in fade-in zoom-in-95 duration-150">
                                                <button onClick={() => handleDeleteTask(task.id)} className="w-full text-left px-4 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50 flex items-center">
                                                  <Trash2 size={14} className="mr-2" /> Supprimer
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {/* Pied de page style Annuaire */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400 bg-white">
            <div>Actuellement <span className="font-bold text-gray-900">1 à {filteredTasks.length} sur {filteredTasks.length}</span> résultats</div>
            <div className="flex items-center space-x-2">
                <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-50"><ChevronsLeft size={16} /></button>
                <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-50"><ChevronLeft size={16} /></button>
                <button className="w-7 h-7 bg-gray-900 text-white rounded-md text-xs font-bold shadow-md">1</button>
                <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-50"><ChevronRight size={16} /></button>
                <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-50 rotate-180"><ChevronsLeft size={16} /></button>
            </div>
        </div>
      </div>

      <AddTaskModal isOpen={isAddTaskModalOpen} onClose={() => { setIsAddTaskModalOpen(false); setEditingTask(null); }} userProfile={userProfile} taskToEdit={editingTask} />
    </div>
  );
};

export default TasksMemo;
