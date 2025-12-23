import React, { useState } from 'react';
import { X, Search, Check, SquarePen, Plus } from 'lucide-react';

interface AddDirectoryContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddDirectoryContactModal: React.FC<AddDirectoryContactModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');

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
            <h2 className="text-[18px] font-bold text-gray-900">Ajouter un contact annuaire</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* List Body */}
        <div className="p-8 space-y-4">
          <p className="text-[12px] font-medium text-gray-400">Rechercher dans vos contacts un contact existant</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un contact" 
              className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-4 py-4 text-sm text-gray-900 outline-none focus:border-gray-300 transition-all placeholder:text-gray-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 pt-0 grid grid-cols-2 gap-4">
          <button 
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-100 rounded-xl text-[14px] font-bold text-gray-800 hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            <Plus size={18} />
            Ajouter un nouveau contact
          </button>
          <button 
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-100 rounded-xl text-[14px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            <Check size={18} />
            Ajouter le contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDirectoryContactModal;