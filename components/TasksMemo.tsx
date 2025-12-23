import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  AlertTriangle, 
  MoreVertical, 
  GripVertical,
  StickyNote,
  User
} from 'lucide-react';
import { Task } from '../types';
import AddTaskModal from './AddTaskModal';

const TasksMemo: React.FC = () => {
  const [activeStatusTab, setActiveStatusTab] = useState<'en-cours' | 'termine'>('en-cours');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Coline Farget',
      subtitle: 'Projet cuisine',
      type: 'Tâche auto',
      statusLabel: 'Dossier technique',
      tagColor: 'blue',
      date: '2 jours de retard',
      progress: 45,
      status: 'in-progress',
      statusType: 'progress',
      isLate: true,
      collaborator: { name: 'Jérémy', avatar: 'https://i.pravatar.cc/150?u=1' },
      hasNote: true
    },
    {
      id: '2',
      title: 'John DUBOIS',
      subtitle: 'Projet salle de bain',
      type: 'Tâche manuelle',
      statusLabel: 'Appel',
      tagColor: 'gray',
      date: '20/08/2025',
      status: 'pending',
      statusType: 'toggle',
      collaborator: { name: 'Céline', avatar: 'https://i.pravatar.cc/150?u=2' },
      hasNote: true
    },
    {
      id: '3',
      title: 'Alexandre LACOURS',
      subtitle: 'Projet cuisine exterieur',
      type: 'Tâche auto',
      statusLabel: 'Etudes en cours',
      tagColor: 'purple',
      date: '21/08/2025',
      progress: 45,
      status: 'in-progress',
      statusType: 'progress',
      isLate: true,
      collaborator: { name: 'Jérémy', avatar: 'https://i.pravatar.cc/150?u=1' },
      hasNote: false
    },
    {
      id: '4',
      title: 'Coline FARGET',
      type: 'Tâche manuelle',
      statusLabel: 'Email',
      tagColor: 'gray',
      date: '3 jours de retard',
      status: 'pending',
      statusType: 'toggle',
      isLate: true,
      collaborator: { name: 'Jérémy', avatar: 'https://i.pravatar.cc/150?u=1' },
      hasNote: true
    },
    {
      id: '5',
      title: 'Appeler Bernard',
      type: 'Mémo',
      statusLabel: '',
      tagColor: 'gray',
      date: '19/08/2025',
      status: 'pending',
      statusType: 'toggle',
      collaborator: { name: 'Jérémy', avatar: 'https://i.pravatar.cc/150?u=1' },
      hasNote: true
    },
    {
      id: '6',
      title: 'Coline FARGET',
      type: 'Tâche manuelle',
      statusLabel: 'Email',
      tagColor: 'gray',
      date: '3 jours de retard',
      status: 'pending',
      statusType: 'toggle',
      isLate: true,
      collaborator: { name: 'Jérémy', avatar: 'https://i.pravatar.cc/150?u=1' },
      hasNote: true
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-64px)] space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header and Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-gray-800">
              Liste des tâches et mémo <span className="text-gray-400 font-normal ml-1">(127)</span>
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
            onClick={() => setIsAddTaskModalOpen(true)}
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
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-4 pb-2">Ordre</th>
                <th className="px-4 pb-2">Descriptif</th>
                <th className="px-4 pb-2">Type</th>
                <th className="px-4 pb-2">Statut</th>
                <th className="px-4 pb-2">Échéance</th>
                <th className="px-4 pb-2">Collaborateur</th>
                <th className="px-4 pb-2">Note</th>
                <th className="px-4 pb-2">Progression</th>
                <th className="px-4 pb-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
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

                  <td className="px-4 py-4 border-y border-gray-100 group-hover:border-gray-200">
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-gray-100 text-gray-600 rounded-full uppercase tracking-tighter">
                      {task.type}
                    </span>
                  </td>

                  <td className="px-4 py-4 border-y border-gray-100 group-hover:border-gray-200">
                    {task.statusLabel && (
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${
                        task.tagColor === 'blue' ? 'bg-cyan-100 text-cyan-700' :
                        task.tagColor === 'purple' ? 'bg-fuchsia-100 text-fuchsia-700' :
                        task.tagColor === 'pink' ? 'bg-pink-100 text-pink-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {task.statusLabel}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 border-y border-gray-100 group-hover:border-gray-200">
                    <span className={`text-xs font-bold ${task.isLate ? 'text-red-500' : 'text-gray-800'}`}>
                      {task.date}
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
                          <button className="flex-1 py-1 text-[10px] font-bold bg-white rounded-full shadow-sm text-gray-800 border border-gray-100">Non commencé</button>
                          <button className="flex-1 py-1 text-[10px] font-bold text-gray-400 hover:text-gray-600">En cours</button>
                          <button className="flex-1 py-1 text-[10px] font-bold text-gray-400 hover:text-gray-600">Terminé</button>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 last:rounded-r-xl border-y border-r border-gray-100 group-hover:border-gray-200 text-right">
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Task Modal */}
      <AddTaskModal 
        isOpen={isAddTaskModalOpen} 
        onClose={() => setIsAddTaskModalOpen(false)} 
      />
    </div>
  );
};

export default TasksMemo;