
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  MoreHorizontal, 
  PenSquare, 
  Plus, 
  Loader2, 
  StickyNote, 
  GripVertical, 
  AlertTriangle,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from '@firebase/firestore';
import { Task } from '../types';
import AddTaskModal from './AddTaskModal';

interface ClientTasksProps {
  clientId: string;
  clientName: string;
  userProfile: any;
}

const ClientTasks: React.FC<ClientTasksProps> = ({ clientId, clientName, userProfile }) => {
  const [filter, setFilter] = useState<'en-cours' | 'termine'>('en-cours');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Charger TOUTES les tâches liées à ce client (directes ou via projets)
  useEffect(() => {
    if (!clientId) return;

    const q = query(
      collection(db, 'tasks'), 
      where('clientId', '==', clientId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
      // Tri par date de création ou échéance si nécessaire
      setTasks(data);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching client tasks:", err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [clientId]);

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Attention, vous êtes sur de vouloir supprimer ?")) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
      setActiveMenuId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'tasks', id), { status });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTasks = tasks.filter(t => 
    filter === 'en-cours' ? t.status !== 'completed' : t.status === 'completed'
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 pt-6">
      {/* En-tête de l'onglet Tâches */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-[16px] font-bold text-gray-800">
              Récapitulatif des tâches <span className="text-gray-300 font-normal ml-1">({filteredTasks.length})</span>
            </h2>
            <p className="text-[11px] text-gray-400 font-medium italic">Inclut les mémos et les tâches de tous ses projets.</p>
          </div>
          
          <div className="flex bg-[#F1F3F5] rounded-full p-1 border border-gray-100 shadow-inner ml-4">
            <button 
              onClick={() => setFilter('en-cours')} 
              className={`px-8 py-2 text-[11px] font-bold rounded-full transition-all ${filter === 'en-cours' ? 'bg-[#1A1C23] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              En cours
            </button>
            <button 
              onClick={() => setFilter('termine')} 
              className={`px-8 py-2 text-[11px] font-bold rounded-full transition-all ${filter === 'termine' ? 'bg-[#1A1C23] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Terminé
            </button>
          </div>
        </div>

        <button 
          onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:border-[#A886D7] transition-all active:scale-95"
        >
          <Plus size={16} className="text-[#A886D7]" />
          Ajouter une tâche / mémo
        </button>
      </div>

      {/* Conteneur gris de fond style Tableau XORA */}
      <div className="bg-[#f8f9fa] border border-gray-100 rounded-[28px] p-6 min-h-[500px] relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-[#A886D7]" size={32} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                <th className="px-6 pb-2">Ordre</th>
                <th className="px-6 pb-2">Descriptif</th>
                <th className="px-6 pb-2 text-center">Type</th>
                <th className="px-6 pb-2 text-center">Statut</th>
                <th className="px-6 pb-2 text-center">Échéance</th>
                <th className="px-6 pb-2">Collaborateur</th>
                <th className="px-6 pb-2 text-center">Note</th>
                <th className="px-6 pb-2">Progression / Action</th>
                <th className="px-6 pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-16 space-y-3">
                       <StickyNote size={40} className="mx-auto text-gray-100" />
                       <p className="text-[13px] font-bold text-gray-300 italic">Aucune tâche pour ce contact.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="group bg-white hover:bg-gray-50/50 transition-all border border-gray-100">
                    <td className="px-6 py-5 first:rounded-l-2xl border-y border-l border-gray-50">
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-gray-200 group-hover:text-gray-400 cursor-move transition-colors" />
                        <span className="text-[12px] font-black text-gray-200 italic">-</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5 border-y border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[13.5px] font-bold text-gray-900 group-hover:text-purple-700 transition-colors truncate max-w-[250px]">{task.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                           {task.subtitle && <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tight">{task.subtitle}</span>}
                           {!task.subtitle && <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight italic">Tâche directe client</span>}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 border-y border-gray-50 text-center">
                      <span className="px-2.5 py-1 text-[9px] font-black bg-gray-50 border border-gray-100 text-gray-400 rounded-lg uppercase tracking-tight">
                        {task.type}
                      </span>
                    </td>

                    <td className="px-6 py-5 border-y border-gray-50 text-center">
                      <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${
                        task.tagColor === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {task.statusLabel || (task.status === 'completed' ? 'Terminé' : 'En attente')}
                      </span>
                    </td>

                    <td className="px-6 py-5 border-y border-gray-50 text-center">
                      <span className={`text-[12px] font-bold ${task.isLate ? 'text-red-500' : 'text-gray-800'}`}>
                        {task.date || '-'}
                      </span>
                    </td>

                    <td className="px-6 py-5 border-y border-gray-50">
                      <div className="flex items-center gap-3">
                        <img src={task.collaborator.avatar} className="w-8 h-8 rounded-full border border-gray-100 shadow-sm" alt="" />
                        <span className="text-[12px] font-bold text-gray-700">{task.collaborator.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-5 border-y border-gray-50 text-center">
                      <div className="flex justify-center">
                        {task.hasNote ? (
                          <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-white transition-all cursor-pointer shadow-sm">
                            <FileText size={14} />
                          </div>
                        ) : <span className="text-gray-100 font-bold">-</span>}
                      </div>
                    </td>

                    <td className="px-6 py-5 border-y border-gray-50 min-w-[220px]">
                      {task.statusType === 'progress' ? (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#A886D7] rounded-full shadow-[0_0_8px_rgba(168,134,215,0.4)]" style={{ width: `${task.progress}%` }}></div>
                          </div>
                          <span className="text-[11px] font-black text-[#A886D7]">{task.progress}%</span>
                          {task.isLate && (
                            <div className="relative">
                              <AlertTriangle size={14} className="text-red-400" />
                              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex bg-[#F8F9FA] rounded-full border border-gray-200 p-0.5 w-full">
                            <button 
                              onClick={() => updateTaskStatus(task.id, 'pending')}
                              className={`flex-1 py-1.5 text-[10px] font-bold rounded-full transition-all ${task.status === 'pending' ? 'bg-white shadow-sm text-gray-800 border border-gray-100' : 'text-gray-300 hover:text-gray-600'}`}
                            >
                              À faire
                            </button>
                            <button 
                              onClick={() => updateTaskStatus(task.id, 'in-progress')}
                              className={`flex-1 py-1.5 text-[10px] font-bold rounded-full transition-all ${task.status === 'in-progress' ? 'bg-white shadow-sm text-gray-800 border border-gray-100' : 'text-gray-300 hover:text-gray-600'}`}
                            >
                              En cours
                            </button>
                            <button 
                              onClick={() => updateTaskStatus(task.id, 'completed')}
                              className={`flex-1 py-1.5 text-[10px] font-bold rounded-full transition-all ${task.status === 'completed' ? 'bg-white shadow-sm text-gray-800 border border-gray-100' : 'text-gray-300 hover:text-gray-600'}`}
                            >
                              Terminé
                            </button>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-5 last:rounded-r-2xl border-y border-r border-gray-50 text-right">
                       <div className="relative inline-block">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === task.id ? null : task.id); }}
                            className={`p-2 rounded-lg transition-all ${activeMenuId === task.id ? 'bg-gray-100 text-gray-900' : 'text-gray-300 hover:bg-gray-50 hover:text-gray-600'}`}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {activeMenuId === task.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
                              <div className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 w-48 animate-in fade-in zoom-in-95 duration-150">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                                  className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                  <PenSquare size={14} className="text-gray-400" /> Modifier
                                </button>
                                <div className="h-px bg-gray-50 my-1 mx-2" />
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                  className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 size={14} /> Supprimer
                                </button>
                              </div>
                            </>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddTaskModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        userProfile={userProfile}
        initialClientId={clientId}
        taskToEdit={editingTask}
      />
    </div>
  );
};

export default ClientTasks;
