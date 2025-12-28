
import React, { useState } from 'react';
import { X, ChevronDown, Check, SquarePen, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface AddExternalContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

const AddExternalContactModal: React.FC<AddExternalContactModalProps> = ({ isOpen, onClose, clientId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    civility: 'Mme',
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
    fixed: '',
    type: 'Conjoint / Conjointe'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lastName || !formData.firstName) return;

    setIsLoading(true);
    try {
      const clientRef = doc(db, 'clients', clientId);
      await updateDoc(clientRef, {
        "details.externalContacts": arrayUnion({
          ...formData,
          id: Date.now().toString()
        })
      });
      onClose();
      setFormData({
        civility: 'Mme',
        lastName: '',
        firstName: '',
        email: '',
        phone: '',
        fixed: '',
        type: 'Conjoint / Conjointe'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#FBFBFB]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-gray-200 bg-white rounded-xl flex items-center justify-center text-gray-800 shadow-sm">
                <SquarePen size={20} />
              </div>
              <h2 className="text-[18px] font-bold text-gray-900">Ajouter un contact externe</h2>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
              <X size={20} />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3 space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Civilité*</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 transition-all"
                    value={formData.civility}
                    onChange={(e) => setFormData({...formData, civility: e.target.value})}
                  >
                    <option>Mme</option>
                    <option>M.</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
              </div>
              <div className="md:col-span-4 space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nom*</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ex: DUBOIS" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value.toUpperCase()})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 transition-all" 
                />
              </div>
              <div className="md:col-span-5 space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Prénom*</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ex: Paul" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</label>
                <input 
                  type="email" 
                  placeholder="nom@exemple.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 transition-all" 
                />
              </div>
              <div className="md:col-span-4 space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Portable</label>
                <input 
                  type="text" 
                  placeholder="06..." 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 transition-all" 
                />
              </div>
              <div className="md:col-span-4 space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Fixe</label>
                <input 
                  type="text" 
                  placeholder="04..." 
                  value={formData.fixed}
                  onChange={(e) => setFormData({...formData, fixed: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type de contact</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 transition-all"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option>Conjoint / Conjointe</option>
                  <option>Membre de la famille</option>
                  <option>Ami / Proche</option>
                  <option>Autre</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 pt-0 flex justify-center">
            <button 
              type="submit"
              disabled={isLoading || !formData.lastName || !formData.firstName}
              className="w-full flex items-center justify-center gap-3 px-10 py-4 bg-[#1A1C23] text-white border border-transparent rounded-2xl text-[14px] font-bold shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              Ajouter le contact au dossier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExternalContactModal;
