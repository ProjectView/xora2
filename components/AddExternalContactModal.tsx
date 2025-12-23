import React from 'react';
import { X, ChevronDown, Check, SquarePen } from 'lucide-react';

interface AddExternalContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddExternalContactModal: React.FC<AddExternalContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-800">
              <SquarePen size={20} />
            </div>
            <h2 className="text-[18px] font-bold text-gray-900">Ajouter un contact externe</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3 space-y-2">
              <label className="text-[12px] font-medium text-gray-400">Civilité client*</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm text-gray-400 outline-none focus:border-gray-900 transition-all">
                  <option>Sélectionner</option>
                  <option>Mme</option>
                  <option>M.</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[12px] font-medium text-gray-400">Nom du contact*</label>
              <input type="text" placeholder="Saisir" className="w-full bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 transition-all placeholder:text-gray-300" />
            </div>
            <div className="md:col-span-5 space-y-2">
              <label className="text-[12px] font-medium text-gray-400">Prénom du contact*</label>
              <input type="text" placeholder="Saisir" className="w-full bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 transition-all placeholder:text-gray-300" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-2">
              <label className="text-[12px] font-medium text-gray-400">Email client</label>
              <input type="email" placeholder="Saisir" className="w-full bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 transition-all placeholder:text-gray-300" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[12px] font-medium text-gray-400">Téléphone portable</label>
              <div className="flex">
                <div className="flex items-center gap-1 px-2 border border-r-0 border-gray-100 rounded-l-lg bg-white">
                  <span className="text-sm">🇫🇷</span>
                  <ChevronDown size={12} className="text-gray-400" />
                </div>
                <input type="text" placeholder="Saisir" className="flex-1 bg-white border border-gray-100 rounded-r-lg px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 transition-all placeholder:text-gray-300" />
              </div>
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[12px] font-medium text-gray-400">Téléphone fixe</label>
              <div className="flex">
                <div className="flex items-center gap-1 px-2 border border-r-0 border-gray-100 rounded-l-lg bg-white">
                  <span className="text-sm">🇫🇷</span>
                  <ChevronDown size={12} className="text-gray-400" />
                </div>
                <input type="text" placeholder="Saisir" className="flex-1 bg-white border border-gray-100 rounded-r-lg px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 transition-all placeholder:text-gray-300" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-gray-400">Type de contact</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm text-gray-400 outline-none focus:border-gray-900 transition-all">
                <option>Sélectionner</option>
                <option>Conjoint / Conjointe</option>
                <option>Membre de la famille</option>
                <option>Ami / Proche</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex justify-center">
          <button 
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-10 py-3.5 bg-white border border-gray-100 rounded-xl text-[14px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            <Check size={18} />
            Ajouter le contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExternalContactModal;