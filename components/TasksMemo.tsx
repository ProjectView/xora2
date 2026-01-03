
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  AlertTriangle, 
  MoreVertical, 
  GripVertical,
  StickyNote,
  Loader2,
  PenSquare,
  Trash2
} from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
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
    const q = query(
      tasksRef, 
      where('companyId', '==', userProfile.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      
      setTasks(tasksData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.companyId]);

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Attention, vous êtes sur de vouloir supprimer ?")) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
      setActiveMenuId(null);
    } catch (e) {
      console.error("Erreur suppression tâche:", e);
      alert("Erreur lors de la suppression.");
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

  // Filtrage côté client
  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeStatusTab === 'en-cours' 
      ? task.status !== 'completed' 
      : task.status === 'completed';
    
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (task.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-64px)] space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header and Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-gray-800">
              Liste des tâches et mémo <span className="text-gray-400 font-normal ml-1">({filteredTasks.length})</span>
            </h2>
            
            {/* Toggle Tab */}
            <div className="flex bg-gray-100 rounded-full p-1 border border-gray-200">
              <button 
                onClick={() => setActiveStatusTab('en-cours')}
                className={`px-6 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  activeStatusTab === 'en-cours' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                En cours
              </button>
              <button 
                onClick={() => setActiveStatusTab('termine')}
                className={`px-6 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  activeStatusTab === 'termine' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Terminé
              </button>
            </div>
          </div>

          <button 
            onClick={() => { setEditingTask(null); setIsAddTaskModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Plus size={18} />
            <span>Ajouter une tâche manuelle ou un mémo</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-12 gap-3 mb-6">
          <div className="lg:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 text-gray-800 placeholder-gray-400"
            />
          </div>
          
          <div className="lg:col-span-2 relative">
            <button className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
              <span>Type de tâche</span>
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="lg:col-span-2 relative">
            <button className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
              <span>Statut de la tâche</span>
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="lg:col-span-2 relative">
            <button className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
              <span>Collaborateur</span>
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="lg:col-span-3 relative">
            <button className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
              <span>Échéance</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[400px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-20 text-center text-gray-400 font-medium">
              Aucune tâche trouvée.
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-4 pb-2">Ordre</th>
                  <th className="px-4 pb-2">Descriptif</th>
                  <th className="px-4 pb-2 text-center">Type</th>
                  <th className="px-4 pb-2 text-center">Statut</th>
                  <th className="px-4 pb-2 text-center">Échéance</th>
                  <th className="px-4 pb-2">Collaborateur</th>
                  <th className="px-4 pb-2 text-center">Note</th>
                  <th className="px-4 pb-2">Progression</th>
                  <th className="px-4 pb-2 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="group bg-white hover:bg-gray-50 transition-colors border-y border-gray-100">
                    <td className="px-4 py-4 first:rounded-l-xl border-y border-l border-gray-100 group-hover:border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="p-1 cursor-move text-gray-300 group-hover:text-gray-400">
                          <GripVertical size={16} />
                        </div>
                        <span className="text-sm font-bold text-gray-400">-</span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 border-y border-gray-100 group-hover:border-gray-200">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{task.title}</span>
                        {task.subtitle && <span className="text-xs text-gray-400">{task.subtitle}</span>}
                      </div>
                    </td>

                    <td className="px-4 py-4 border-y border-gray-100 group-hover:border-gray-200 text-center">
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-gray-100 text-gray-600 rounded-full uppercase tracking-tighter">
                        {task.type}
                      </span>
                    </td>

                    <td className="px-4 py-4 border-y border-gray-100 group-hover:border-gray-200 text-center">
                      {task.statusLabel ? (
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${
                          task.tagColor === 'blue' ? 'bg-cyan-100 text-cyan-700' :
                          task.tagColor === 'purple' ? 'bg-fuchsia-100 text-fuchsia-700' :
                          task.tagColor === 'pink' ? 'bg-pink-100 text-pink-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {task.statusLabel}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 font-medium italic">Aucun</span>
                      )}
                    </td>

                    <td className="px-4 py-4 border-y border-gray-100 group-hover:border-gray-200 text-center">
                      <span className={`text-xs font-bold ${task.isLate ? 'text-red-500' : 'text-gray-800'}`}>
                        {task.date || 'Non définie'}
                      </span>
                    </td>

                    <td className="px-4 py-4 border-y border-gray-100 group-hover:border-gray-200">
                      <div className="flex items-center gap-2">
                        <img src={task.collaborator.avatar} className="w-6 h-6 rounded-full border border-gray-200" alt="" />
                        <span className="text-xs font-bold text-gray-800">{task.collaborator.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 border-y border-gray-100 group-hover:border-gray-200">
                      <div className="flex justify-center">
                        {task.hasNote ? (
                          <div className="p-1.5 border border-gray-200 rounded hover:bg-gray-100 text-gray-700 cursor-pointer">
                            <StickyNote size={14} />
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 border-y border-gray-100 group-hover:border-gray-200 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        {task.statusType === 'progress' ? (
                          <>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${task.tagColor === 'purple' ? 'bg-fuchsia-400' : 'bg-blue-400'}`} 
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-bold ${task.tagColor === 'purple' ? 'text-fuchsia-500' : 'text-blue-500'}`}>
                              {task.progress}%
                            </span>
                            {task.isLate && (
                              <div className="relative">
                                <AlertTriangle size={16} className="text-gray-400" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex bg-gray-50 rounded-full border border-gray-200 p-0.5 w-full">
                            <button 
                              onClick={() => updateTaskStatus(task.id, 'pending')}
                              className={`flex-1 py-1 text-[10px] font-bold rounded-full transition-all ${task.status === 'pending' ? 'bg-white shadow-sm text-gray-800 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              A faire
                            </button>
                            <button 
                              onClick={() => updateTaskStatus(task.id, 'in-progress')}
                              className={`flex-1 py-1 text-[10px] font-bold rounded-full transition-all ${task.status === 'in-progress' ? 'bg-white shadow-sm text-gray-800 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              En cours
                            </button>
                            <button 
                              onClick={() => updateTaskStatus(task.id, 'completed')}
                              className={`flex-1 py-1 text-[10px] font-bold rounded-full transition-all ${task.status === 'completed' ? 'bg-white shadow-sm text-gray-800 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              Terminé
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 last:rounded-r-xl border-y border-r border-gray-100 group-hover:border-gray-200 text-right relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === task.id ? null : task.id); }}
                        className={`p-2 rounded-lg transition-all ${activeMenuId === task.id ? 'bg-gray-100 text-gray-900 shadow-inner' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === task.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                          <div className="absolute right-4 top-12 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 w-48 animate-in fade-in zoom-in-95 duration-150">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEditClick(task); }}
                              className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <PenSquare size={14} className="text-gray-400" /> Modifier
                            </button>
                            <div className="h-px bg-gray-50 my-1 mx-2" />
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                              className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={14} /> Supprimer
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <AddTaskModal 
        isOpen={isAddTaskModalOpen} 
        onClose={() => { setIsAddTaskModalOpen(false); setEditingTask(null); }} 
        userProfile={userProfile}
        taskToEdit={editingTask}
      />
    </div>
  );
};

export default TasksMemo;
