import React, { useState } from 'react';
import { FileText, MoreHorizontal, PenSquare } from 'lucide-react';

interface Task {
  id: string;
  type: string;
  project?: string;
  status: string;
  statusColor: string;
  dueDate: string;
  isLate?: boolean;
  collaborator: { name: string; avatar: string };
  hasNote: boolean;
  progression: number | string;
}

const ClientTasks: React.FC = () => {
  const [filter, setFilter] = useState<'en-cours' | 'termine'>('en-cours');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const tasks: Task[] = [
    {
      id: 't-1',
      type: 'Tâche auto',
      project: 'Cuisine',
      status: 'Etude client',
      statusColor: 'bg-[#FAE8FF] text-[#D946EF]',
      dueDate: '2 jours de retard',
      isLate: true,
      collaborator: { name: 'Jérémy', avatar: 'https://i.pravatar.cc/150?u=1' },
      hasNote: true,
      progression: 45
    },
    {
      id: 't-2',
      type: 'Tâche manuelle',
      project: '',
      status: 'Appel',
      statusColor: 'bg-[#F1F5F9] text-[#64748B]',
      dueDate: '20/08/2025',
      collaborator: { name: 'Jérémy', avatar: 'https://i.pravatar.cc/150?u=1' },
      hasNote: true,
      progression: 'Non commencé'
    }
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 pt-6">
      {/* En-tête de l'onglet Tâches */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-[16px] font-bold text-gray-800">Liste des tâches <span className="text-gray-300 font-normal ml-1">(2)</span></h2>
        <div className="flex bg-gray-100 rounded-full p-1 border border-gray-100 shadow-sm">
          <button 
            onClick={() => setFilter('en-cours')} 
            className={`px-8 py-2 text-[11px] font-bold rounded-full transition-all ${filter === 'en-cours' ? 'bg-[#1A1C23] text-white shadow-md' : 'text-gray-400'}`}
          >
            En cours
          </button>
          <button 
            onClick={() => setFilter('termine')} 
            className={`px-8 py-2 text-[11px] font-bold rounded-full transition-all ${filter === 'termine' ? 'bg-[#1A1C23] text-white shadow-md' : 'text-gray-400'}`}
          >
            Terminé
          </button>
        </div>
      </div>

      {/* Conteneur gris de fond */}
      <div className="bg-[#f8f9fa] border border-gray-100 rounded-[24px] p-6 flex-1 overflow-hidden min-h-[500px]">
        {/* En-têtes de colonnes */}
        <div className="grid grid-cols-[120px_120px_140px_160px_150px_80px_1fr_40px] gap-4 px-6 mb-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          <div className="text-center">Type</div>
          <div>Projet</div>
          <div className="text-center">Statut</div>
          <div className="text-center">Échéance</div>
          <div>Collaborateur</div>
          <div className="text-center">Note</div>
          <div>Progression</div>
          <div></div>
        </div>

        {/* Liste des cartes blanches */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-white rounded-[16px] px-6 py-4 grid grid-cols-[120px_120px_140px_160px_150px_80px_1fr_40px] gap-4 items-center shadow-sm border border-gray-100 hover:border-gray-200 transition-all relative"
            >
              {/* Type */}
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-white border border-gray-100 text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-tight">
                  {task.type}
                </span>
              </div>
              
              {/* Projet */}
              <div className="text-[13px] font-bold text-gray-800 truncate">
                {task.project || ''}
              </div>
              
              {/* Statut */}
              <div className="flex justify-center">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${task.statusColor}`}>
                  {task.status}
                </span>
              </div>
              
              {/* Échéance */}
              <div className="text-center">
                <span className={`text-[13px] font-bold ${task.isLate ? 'text-red-500' : 'text-gray-800'}`}>
                  {task.dueDate}
                </span>
              </div>
              
              {/* Collaborateur */}
              <div className="flex items-center gap-2 overflow-hidden">
                <img src={task.collaborator.avatar} className="w-7 h-7 rounded-full border border-gray-100 shrink-0 shadow-sm" alt="" />
                <span className="text-[13px] font-bold text-gray-800 truncate">{task.collaborator.name}</span>
              </div>
              
              {/* Note */}
              <div className="flex justify-center">
                <div className="p-2 border border-gray-100 rounded-lg text-gray-800 hover:bg-gray-50 cursor-pointer">
                  <FileText size={16} />
                </div>
              </div>
              
              {/* Progression */}
              <div className="min-w-0 pr-4">
                {typeof task.progression === 'number' ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#D946EF] rounded-full" style={{ width: `${task.progression}%` }}></div>
                    </div>
                    <span className="text-[12px] font-bold text-[#D946EF]">{task.progression}%</span>
                  </div>
                ) : (
                  <div className="flex bg-[#F8F9FA] rounded-full border border-gray-200 p-0.5 w-full">
                      <button className="flex-1 py-1.5 text-[10px] font-bold bg-white rounded-full shadow-sm text-gray-800 border border-gray-100">
                        Non commencé
                      </button>
                      <button className="flex-1 py-1.5 text-[10px] font-bold text-gray-400">En cours</button>
                      <button className="flex-1 py-1.5 text-[10px] font-bold text-gray-400">Terminé</button>
                  </div>
                )}
              </div>
              
              {/* Action rapide */}
              <div className="flex justify-end relative">
                <button 
                  onClick={() => setShowActionMenu(showActionMenu === task.id ? null : task.id)}
                  className={`p-1.5 rounded-lg transition-all ${showActionMenu === task.id ? 'text-gray-900 bg-gray-50' : 'text-gray-300 hover:text-gray-600 hover:bg-gray-50'}`}
                >
                  <MoreHorizontal size={20} />
                </button>

                {/* Popover Modifier la tâche */}
                {showActionMenu === task.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowActionMenu(null)}
                    ></div>
                    <div className="absolute right-0 top-12 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 w-48 animate-in fade-in zoom-in-95 duration-150 border-t border-gray-50">
                      <button className="w-full text-left px-4 py-3 text-[12px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <PenSquare size={14} className="text-gray-400" />
                        Modifier la tâche
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientTasks;