import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AddExternalContactModal from './AddExternalContactModal';
import AddDirectoryContactModal from './AddDirectoryContactModal';

const ClientExternalContact: React.FC = () => {
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-full">
      {/* Section Liste des contacts externes */}
      <div className="bg-[#f8f9fa] border border-gray-100 rounded-[20px] p-8 space-y-4">
        <div className="space-y-1">
          <h3 className="text-[15px] font-bold text-gray-900">Liste des contacts externes</h3>
          <p className="text-[13px] text-gray-400">Vous n'avez pas renseigné de contact externe.</p>
        </div>
        
        <button 
          onClick={() => setIsExternalModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all"
        >
          <Plus size={16} />
          Ajouter un contact externe
        </button>
      </div>

      {/* Section Liste des contacts annuaires */}
      <div className="bg-[#f8f9fa] border border-gray-100 rounded-[20px] p-8 space-y-4">
        <div className="space-y-1">
          <h3 className="text-[15px] font-bold text-gray-900">Liste des contacts annuaires</h3>
          <p className="text-[13px] text-gray-400">Vous n'avez pas renseigné de contact externe.</p>
        </div>
        
        <button 
          onClick={() => setIsDirectoryModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all"
        >
          <Plus size={16} />
          Ajouter depuis annuaires
        </button>
      </div>

      {/* Modals */}
      <AddExternalContactModal 
        isOpen={isExternalModalOpen} 
        onClose={() => setIsExternalModalOpen(false)} 
      />
      <AddDirectoryContactModal 
        isOpen={isDirectoryModalOpen} 
        onClose={() => setIsDirectoryModalOpen(false)} 
      />
    </div>
  );
};

export default ClientExternalContact;