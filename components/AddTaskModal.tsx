
import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Plus, CheckSquare, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: any;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, userProfile }) => {
  const [isMemo, setIsMemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [selectedCollaboratorIdx, setSelectedCollaboratorIdx] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedStatusLabel, setSelectedStatusLabel] = useState('A faire');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const collaborators = [
    { name: userProfile?.name || 'Moi', avatar: userProfile?.avatar || 'https://i.pravatar.cc/150?u=loic' },
    { name: 'Thomas', avatar: 'https://i.pravatar.cc/150?u=admin' },
    { name: 'Céline', avatar: 'https://i.pravatar.cc/150?u=2' },
    { name: 'Jérémy', avatar: 'https://i.pravatar.cc/150?u=1' },
  ];

  const statusOptions = [
    'A faire',
    'En attente',
    'Urgent',
    'Prioritaire',
    'Dossier technique',
    'Appel à passer'
  ];

  useEffect(() => {
    if (!isOpen || !userProfile?.companyId) return;

    const fetchData = async () => {
      // Charger clients
      const clientsQ = query(collection(db, 'clients'), where('companyId', '==', userProfile.companyId));
      const clientsSnap = await getDocs(clientsQ);
      setClients(clientsSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));

      // Charger projets
      const projectsQ = query(collection(db, 'projects'), where('companyId', '==', userProfile.companyId));
      const projectsSnap = await getDocs(projectsQ);
      setProjects(projectsSnap.docs.map(doc => ({ id: doc.id, name: doc.data().projectName })));
    };

    fetchData();
  }, [isOpen, userProfile?.companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.companyId || !title) return;

    setIsLoading(true);
    try {
      const selectedCollab = collaborators[selectedCollaboratorIdx];
      const selectedProjectName = projects.find(p => p.id === selectedProjectId)?.name || '';

      const newTask = {
        title: title,
        subtitle: selectedProjectName,
        type: isMemo ? 'Mémo' : 'Tâche manuelle',
        statusLabel: selectedStatusLabel,
        tagColor: selectedStatusLabel === 'Prioritaire' ? 'purple' : 'gray',
        date: endDate ? new Date(endDate).toLocaleDateString('fr-FR') : '',
        status: 'pending',
        statusType: 'toggle',
        companyId: userProfile.companyId,
        collaborator: {
          name: selectedCollab.name,
          avatar: selectedCollab.avatar
        },
        hasNote: !!note,
        note: note,
        clientId: selectedClientId,
        projectId: selectedProjectId,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'tasks'), newTask);
      onClose();
      // Reset
      setTitle('');
      setNote('');
      setEndDate('');
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);
      alert("Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                <CheckSquare size={20} className="text-gray-800" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Créer une tâche manuelle ou un mémo</h2>
            </div>
            <button type="button" onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all hover:rotate-90">
              <X size={22} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 ml-1">Titre de la tâche / mémo*</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Appeler M. Dubois pour le devis"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:border-gray-900 outline-none transition-all"
              />
            </div>

            {/* Toggle Type Section */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
              <label className="block text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-[0.1em]">Nature de l'entrée</label>
              <div className="flex items-center gap-6">
                <span className={`text-sm font-bold transition-all ${!isMemo ? 'text-gray-900 scale-105' : 'text-gray-400 opacity-60'}`}>Tâche manuelle</span>
                <button 
                  type="button"
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
              <div className="md:col-span-6 space-y-2">
                <label className="block text-xs font-bold text-gray-500 ml-1">Collaborateur assigné</label>
                <div className="relative group">
                  <select 
                    className="w-full appearance-none flex items-center pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all cursor-pointer"
                    onChange={(e) => setSelectedCollaboratorIdx(parseInt(e.target.value))}
                    value={selectedCollaboratorIdx}
                  >
                    {collaborators.map((c, i) => (
                      <option key={i} value={i}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                     <img src={collaborators[selectedCollaboratorIdx].avatar} className="w-6 h-6 rounded-full border border-white shadow-sm" alt="" />
                  </div>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-6 space-y-2">
                <label className="block text-xs font-bold text-gray-500 ml-1">Échéance</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-gray-100 outline-none transition-all cursor-pointer"
                  />
                  <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Client, Project, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 ml-1">Client lié (optionnel)</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:border-gray-400 outline-none transition-all cursor-pointer"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <option value="">Aucun</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 ml-1">Projet lié (optionnel)</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:border-gray-400 outline-none transition-all cursor-pointer"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                  >
                    <option value="">Aucun</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 ml-1">Marqueur Statut</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:border-gray-400 outline-none transition-all cursor-pointer"
                    value={selectedStatusLabel}
                    onChange={(e) => setSelectedStatusLabel(e.target.value)}
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Note de la tâche / mémo</label>
              <textarea 
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Précisions sur la demande du client..."
                className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-800 focus:ring-4 focus:ring-gray-50/50 placeholder:text-gray-300 resize-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-gray-100 flex justify-center bg-gray-50/10">
            <button 
              type="submit"
              disabled={isLoading || !title}
              className="group flex items-center gap-3 px-10 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-xl hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              )}
              <span>{isLoading ? 'Création...' : `Créer la ${isMemo ? 'note mémo' : 'tâche manuelle'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
