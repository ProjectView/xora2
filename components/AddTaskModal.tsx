import React, { useState } from 'react';
import { X, ChevronDown, Plus, CheckSquare, Calendar as CalendarIcon, User } from 'lucide-react';
import { CLIENTS } from '../constants';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const [isMemo, setIsMemo] = useState(false);
  
  // Form States
  const [selectedCollaborator, setSelectedCollaborator] = useState(0);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const collaborators = [
    { name: 'Loïc (Vous)', avatar: 'https://i.pravatar.cc/150?u=loic' },
    { name: 'Thomas', avatar: 'https://i.pravatar.cc/150?u=admin' },
    { name: 'Céline', avatar: 'https://i.pravatar.cc/150?u=2' },
    { name: 'Jérémy', avatar: 'https://i.pravatar.cc/150?u=1' },
  ];

  const projects = [
    'Projet Cuisine',
    'Rénovation Salle de Bain',
    'Aménagement Extérieur',
    'Extension Maison',
    'Dossier Technique Cuisine',
  ];

  const statuses = [
    'A faire',
    'En attente',
    'Urgent',
    'Prioritaire',
    'Dossier technique',
    'Appel à passer'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
              <CheckSquare size={20} className="text-gray-800" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Créer une tâche manuelle ou un mémo</h2>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all hover:rotate-90">
            <X size={22} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          
          {/* Toggle Type Section */}
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
            <label className="block text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-[0.1em]">Nature de l'entrée</label>
            <div className="flex items-center gap-6">
              <span className={`text-sm font-bold transition-all ${!isMemo ? 'text-gray-900 scale-105' : 'text-gray-400 opacity-60'}`}>Tâche manuelle</span>
              <button 
                onClick={() => setIsMemo(!isMemo)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none shadow-sm ${isMemo ? 'bg-indigo-500' : 'bg-gray-800'}`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md ${isMemo ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm font-bold transition-all ${isMemo ? 'text-gray-900 scale-105' : 'text-gray-400 opacity-60'}`}>Mémo</span>
            </div>
          </div>

          {/* Collaborator and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-bold text-gray-500 ml-1">Collaborateur assigné</label>
              <div className="relative group">
                <select 
                  className="w-full appearance-none flex items-center pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all cursor-pointer"
                  onChange={(e) => setSelectedCollaborator(parseInt(e.target.value))}
                  value={selectedCollaborator}
                >
                  {collaborators.map((c, i) => (
                    <option key={i} value={i}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                   <img src={collaborators[selectedCollaborator].avatar} className="w-6 h-6 rounded-full border border-white shadow-sm" alt="" />
                </div>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-4 space-y-2">
              <label className="block text-xs font-bold text-gray-500 ml-1">Début (Agenda)</label>
              <div className="relative">
                <input 
                  type="datetime-local"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-gray-100 outline-none transition-all cursor-pointer"
                  defaultValue="2025-05-12T09:00"
                />
                <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="block text-xs font-bold text-gray-500 ml-1">Date de fin</label>
              <div className="relative">
                <input 
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-gray-100 outline-none transition-all cursor-pointer"
                  defaultValue="2025-05-12"
                />
                <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Client, Project, Status, Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 ml-1">Client</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:border-gray-400 outline-none transition-all cursor-pointer"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="" disabled>Sélectionner</option>
                  {CLIENTS.map(client => (
                    <option key={client.id} value={client.name}>{client.name}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 ml-1">Projet concerné</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:border-gray-400 outline-none transition-all cursor-pointer"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <option value="" disabled>Sélectionner</option>
                  {projects.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 ml-1">Statut</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:border-gray-400 outline-none transition-all cursor-pointer"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="" disabled>Sélectionner</option>
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 ml-1">Échéance finale</label>
              <div className="relative">
                <input 
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-gray-100 outline-none transition-all cursor-pointer"
                />
                <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Note Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Note de la tâche / mémo</label>
            <textarea 
              rows={5}
              placeholder="Ex: Appeler ce client pour le relancer vis-à-vis de l'augmentation des matières premières pour sa cuisine..."
              className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-800 focus:ring-4 focus:ring-gray-50/50 placeholder:text-gray-300 resize-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 flex justify-center bg-gray-50/10">
          <button 
            onClick={onClose}
            className="group flex items-center gap-3 px-10 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Créer la {isMemo ? 'note mémo' : 'tâche manuelle'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;