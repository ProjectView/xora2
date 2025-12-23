import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Briefcase, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  clientId?: string;
  clientName?: string;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, userProfile, clientId, clientName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    projectName: "Pose d'une cuisine",
    metier: 'Cuisiniste',
    selectedClientId: clientId || '',
    selectedClientName: clientName || '',
    origine: 'Relation',
    sousOrigine: 'Bouche à oreille',
    adresseChantier: ''
  });

  // Charger les clients pour le sélecteur si on n'est pas déjà dans une fiche client
  useEffect(() => {
    const fetchClients = async () => {
      if (!userProfile?.companyId || clientId) return;
      const q = query(collection(db, 'clients'), where('companyId', '==', userProfile.companyId));
      const querySnapshot = await getDocs(q);
      setClients(querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    };
    if (isOpen) fetchClients();
  }, [isOpen, userProfile?.companyId, clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.companyId) return;

    setIsLoading(true);
    try {
      const finalClientName = clientName || clients.find(c => c.id === formData.selectedClientId)?.name || 'Client Inconnu';
      
      const newProject = {
        projectName: formData.projectName,
        clientName: finalClientName,
        clientId: clientId || formData.selectedClientId,
        companyId: userProfile.companyId,
        metier: formData.metier,
        addedDate: new Date().toLocaleDateString('fr-FR'),
        progress: 2,
        status: 'Études à réaliser',
        statusColor: 'bg-[#FAE8FF] text-[#D946EF]',
        agenceur: {
          uid: userProfile.uid,
          name: userProfile.name,
          avatar: userProfile.avatar
        },
        details: { ...formData }
      };

      await addDoc(collection(db, 'projects'), newProject);
      onClose();
    } catch (error) {
      console.error("Erreur creation projet:", error);
      alert("Erreur lors de la création du projet.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[760px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-800 bg-gray-50/50">
                <Briefcase size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Créer une fiche projet</h2>
            </div>
            <button 
              type="button"
              onClick={onClose} 
              className="p-2.5 border border-gray-100 hover:bg-gray-50 rounded-full transition-all text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-8 space-y-5 bg-white overflow-y-auto max-h-[70vh] hide-scrollbar">
            {/* Section: Client (si pas déjà fourni) */}
            {!clientId && (
              <div className="p-6 bg-[#FBFBFB] border border-[#F1F3F5] rounded-[18px]">
                <label className="text-[12px] font-medium text-gray-400 mb-2 block">Client concerné*</label>
                <div className="relative">
                  <select 
                    required
                    className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-[14px] text-gray-900 outline-none focus:border-gray-300 transition-all font-medium"
                    value={formData.selectedClientId}
                    onChange={(e) => setFormData({...formData, selectedClientId: e.target.value})}
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Section: Origines */}
            <div className="p-6 bg-[#FBFBFB] border border-[#F1F3F5] rounded-[18px]">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-gray-400">Origine</label>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-[14px] text-gray-900 outline-none focus:border-gray-300 transition-all font-medium"
                      value={formData.origine}
                      onChange={(e) => setFormData({...formData, origine: e.target.value})}
                    >
                      <option>Relation</option>
                      <option>Web</option>
                      <option>Apporteur</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-gray-400">Sous origine</label>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-[14px] text-gray-900 outline-none focus:border-gray-300 transition-all font-medium"
                      value={formData.sousOrigine}
                      onChange={(e) => setFormData({...formData, sousOrigine: e.target.value})}
                    >
                      <option>Bouche à oreille</option>
                      <option>Réseaux sociaux</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Infos Projet */}
            <div className="p-6 bg-[#FBFBFB] border border-[#F1F3F5] rounded-[18px]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[12px] font-medium text-gray-400">Nom du projet*</label>
                  <input 
                    required
                    type="text" 
                    value={formData.projectName}
                    onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[14px] text-gray-900 outline-none focus:border-gray-300 transition-all font-medium" 
                  />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[12px] font-medium text-gray-400">Agenceur référent du projet</label>
                  <div className="relative">
                    <div className="w-full bg-white border border-gray-100 rounded-xl pl-4 pr-10 py-2.5 flex items-center gap-3">
                      <img src={userProfile?.avatar} className="w-6 h-6 rounded-full border border-gray-50" alt="" />
                      <span className="text-[14px] font-bold text-gray-900">{userProfile?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[12px] font-medium text-gray-400">Adresse chantier</label>
                  <input 
                    type="text"
                    placeholder="Saisir l'adresse"
                    value={formData.adresseChantier}
                    onChange={(e) => setFormData({...formData, adresseChantier: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[14px] text-gray-900 outline-none focus:border-gray-300 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section: Métier */}
            <div className="p-6 bg-[#FBFBFB] border border-[#F1F3F5] rounded-[18px] space-y-2">
              <label className="text-[12px] font-medium text-gray-400">Sélectionner le métier*</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-[14px] text-gray-900 outline-none focus:border-gray-300 transition-all font-medium"
                  value={formData.metier}
                  onChange={(e) => setFormData({...formData, metier: e.target.value})}
                >
                  <option>Cuisiniste</option>
                  <option>Bainiste</option>
                  <option>Rénovateur</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-8 flex gap-4 bg-white">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-100 rounded-[14px] text-[14px] font-bold text-gray-800 hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              <ArrowLeft size={18} />
              Annuler
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 border border-gray-900 rounded-[14px] text-[14px] font-bold text-white shadow-sm hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              Créer la fiche projet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;