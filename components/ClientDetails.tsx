import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  CheckSquare, 
  Phone, 
  Mail, 
  MessageSquare,
  FileText,
  ChevronsRight,
  Home
} from 'lucide-react';
import { Client } from '../types';
import ClientTasks from './ClientTasks';
import ClientContactInfo from './ClientContactInfo';
import ClientProjects from './ClientProjects';

interface ClientDetailsProps {
  client: Client;
  onBack: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onBack }) => {
  const [activeTab, setActiveTab] = useState('Information contact');

  // Labels exacts et compteurs de la capture Figma
  const mainTabs = [
    { label: 'Information contact', key: 'Information contact' },
    { label: 'Projet (2)', key: 'Projet (2)' },
    { label: 'Tâches (2)', key: 'Tâches (2)' },
    { label: 'Rendez-vous (0)', key: 'Rendez-vous (0)' },
    { label: 'Fidélisation', key: 'Fidélisation' },
    { label: 'Documents', key: 'Documents' }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      {/* Zone de contenu principale */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto hide-scrollbar">
        
        {/* En-tête (Header) identique à la capture */}
        <div className="px-10 py-8 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 shadow-sm hover:bg-gray-50 transition-all">
              <ArrowLeft size={20} />
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-gray-300">Créé le 01/01/2025</span>
                <span className="px-2 py-0.5 bg-[#FAE8FF] text-[#D946EF] text-[10px] font-extrabold rounded uppercase tracking-widest">Prospect</span>
              </div>
              <div className="flex gap-12 items-center">
                <div className="space-y-2">
                  <h1 className="text-[17px] font-bold text-gray-900 leading-tight">Chloé Dubois</h1>
                  <h1 className="text-[17px] font-bold text-gray-900 leading-tight">Charles Dubois</h1>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
                    <Phone size={16} className="text-gray-300" /> 06 76 54 23 42
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
                    <Phone size={16} className="text-gray-300" /> 06 56 43 23 54
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
                    <Mail size={16} className="text-gray-300" /> chloe.dubois@gmail.com
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
                    <Mail size={16} className="text-gray-300" /> charles.dubois@gmail.com
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all"><MessageSquare size={16} /> Contacter</button>
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all"><Calendar size={16} /> Planifier un RDV</button>
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all"><Phone size={16} /> Appeler</button>
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all"><CheckSquare size={16} /> Ajouter une tâche</button>
          </div>
        </div>

        {/* Barre des onglets style "Classeur" */}
        <div className="px-10 flex items-end shrink-0 mt-4 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2">
            {mainTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button 
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-8 py-4 text-[13.5px] font-bold whitespace-nowrap transition-all relative rounded-t-[14px] border-t border-x ${
                    isActive 
                    ? 'bg-white text-gray-900 border-gray-100 z-10' 
                    : 'bg-[#F1F3F5] text-[#ADB5BD] border-transparent hover:text-gray-600'
                  }`}
                  style={isActive ? { marginBottom: '-1px' } : {}}
                >
                  {tab.label}
                  {/* Petit overlay pour cacher la bordure du dessous quand actif */}
                  {isActive && (
                    <div className="absolute -bottom-[2px] left-0 right-0 h-[3px] bg-white z-20" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Corps du dossier blanc - Fusionné avec l'onglet actif */}
        {/* Suppression de z-0 ici pour éviter de piéger la modale fixe dans un contexte d'empilement inférieur aux onglets */}
        <div className="bg-white flex-1 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] flex flex-col min-h-0 relative">
          <div className="flex-1 px-10 overflow-y-auto hide-scrollbar">
            
            {activeTab === 'Information contact' && <ClientContactInfo />}

            {activeTab === 'Tâches (2)' && (
              <div className="pt-4">
                <ClientTasks />
              </div>
            )}

            {activeTab === 'Projet (2)' && (
              <ClientProjects />
            )}
            
            <div className="pb-10"></div>
          </div>
        </div>
      </div>

      {/* Barre latérale droite */}
      <div className="w-24 bg-white border-l border-gray-100 flex flex-col items-center py-10 gap-8 z-40 relative shadow-lg shrink-0">
         <button className="p-4 text-[#CED4DA] hover:text-gray-800 transition-all"><ChevronsRight size={26} /></button>
         <div className="w-12 h-px bg-[#F1F3F5]"></div>
         <button className="p-5 bg-[#F8F9FA] text-[#ADB5BD] rounded-2xl border border-transparent hover:border-gray-200 transition-all shadow-sm"><Mail size={24} /></button>
         <button className="p-5 bg-[#F8F9FA] text-[#ADB5BD] rounded-2xl border border-transparent hover:border-gray-200 transition-all shadow-sm"><Phone size={24} /></button>
         <button className="p-5 bg-[#F8F9FA] text-[#ADB5BD] rounded-2xl border border-transparent hover:border-gray-200 transition-all shadow-sm"><FileText size={24} /></button>
         <button className="p-5 bg-[#F8F9FA] text-[#ADB5BD] rounded-2xl border border-transparent hover:border-gray-200 transition-all shadow-sm"><Calendar size={24} /></button>
         <button className="p-5 bg-[#F8F9FA] text-[#ADB5BD] rounded-2xl border border-transparent hover:border-gray-200 transition-all shadow-sm"><MessageSquare size={24} /></button>
      </div>
    </div>
  );
};

export default ClientDetails;