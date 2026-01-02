
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Loader2, Check, ChevronDown } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from '@firebase/firestore';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  clientId: string;
  clientName: string;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ isOpen, onClose, userProfile, clientId, clientName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    type: 'R1' as any,
    date: '',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Showroom' as any,
    projectId: '',
    collaboratorIdx: 0
  });

  const typeOptions = ['R1', 'R2', 'Métré', 'Pose', 'SAV', 'Autre'];
  const locationOptions = ['Showroom', 'Domicile', 'Visio', 'Autre'];
  
  const collaborators = [
    { name: userProfile?.name || 'Moi', avatar: userProfile?.avatar || 'https://i.pravatar.cc/150?u=loic' },
    { name: 'Thomas', avatar: 'https://i.pravatar.cc/150?u=admin' },
    { name: 'Céline', avatar: 'https://i.pravatar.cc/150?u=2' },
  ];

  useEffect(() => {
    if (!isOpen || !clientId) return;
    const fetchProjects = async () => {
      const q = query(collection(db, 'projects'), where('clientId', '==', clientId));
      const snap = await getDocs(q);
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProjects();
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    setIsLoading(true);
    try {
      const selectedCollab = collaborators[formData.collaboratorIdx];
      const selectedProject = projects.find(p => p.id === formData.projectId);

      const rdvDate = new Date(formData.date).toLocaleDateString('fr-FR');

      await addDoc(collection(db, 'appointments'), {
        clientId,
        clientName,
        projectId: formData.projectId || null,
        projectName: selectedProject?.projectName || null,
        title: formData.title,
        type: formData.type,
        date: rdvDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        status: 'confirmé',
        collaborator: {
          name: selectedCollab.name,
          avatar: selectedCollab.avatar
        },
        companyId: userProfile.companyId,
        createdAt: new Date().toISOString()
      });

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#FBFBFB]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-gray-200 bg-white rounded-xl flex items-center justify-center text-gray-800 shadow-sm">
                <Calendar size={20} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-gray-900">Prendre un rendez-vous</h2>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Client : {clientName}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Objet du rendez-vous*</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Présentation du projet cuisine"
                className="w-full bg-[#F8F9FA] border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-sm"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Type de RDV</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-[#F8F9FA] border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-sm"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Lieu</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-[#F8F9FA] border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-sm"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value as any})}
                  >
                    {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Date*</label>
                <input 
                  required
                  type="date" 
                  className="w-full bg-[#F8F9FA] border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-sm"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Début</label>
                <input 
                  type="time" 
                  className="w-full bg-[#F8F9FA] border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-sm"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Fin</label>
                <input 
                  type="time" 
                  className="w-full bg-[#F8F9FA] border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-sm"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Collaborateur</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-[#F8F9FA] border border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-sm"
                    value={formData.collaboratorIdx}
                    onChange={e => setFormData({...formData, collaboratorIdx: Number(e.target.value)})}
                  >
                    {collaborators.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                  </select>
                  <img src={collaborators[formData.collaboratorIdx].avatar} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-white" alt="" />
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Projet lié (Optionnel)</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-[#F8F9FA] border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-sm"
                    value={formData.projectId}
                    onChange={e => setFormData({...formData, projectId: e.target.value})}
                  >
                    <option value="">Aucun</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-gray-100 bg-[#FBFBFB] flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Annuler</button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all disabled:opacity-50">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              Confirmer le rendez-vous
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointmentModal;
