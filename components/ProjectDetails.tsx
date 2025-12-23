import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  PenSquare, 
  Calendar, 
  CheckSquare, 
  Trash2, 
  Phone, 
  Mail, 
  Plus, 
  ChevronRight,
  FileText,
  Minus
} from 'lucide-react';

interface ProjectDetailsProps {
  onBack: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('Etude client');
  const [activeSubTab, setActiveSubTab] = useState('Découverte');
  const [concurrenceCount, setConcurrenceCount] = useState(0);

  const mainTabs = [
    { label: 'Etude client', badge: '99%', color: 'text-[#D946EF]' },
    { label: 'Tâches (4)', badge: '', color: 'text-gray-400' },
    { label: 'Calendrier', badge: '', color: 'text-gray-400' },
    { label: 'Documents', badge: '', color: 'text-gray-400' }
  ];

  const subTabs = ['Découverte', 'Découverte cuisine', 'Présentation commerciale', 'Devis en cours'];

  const ProgressCircle = ({ progress, color, size = "w-4 h-4" }: { progress: number; color: string; size?: string }) => (
    <svg className={`${size} mr-1.5`} viewBox="0 0 36 36">
      <path className="text-gray-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
      <path style={{ stroke: color }} strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      <div className="flex-1 flex flex-col h-full overflow-y-auto hide-scrollbar">
        
        {/* Top Header Section */}
        <div className="px-8 py-6 bg-white border-b border-gray-100 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-6">
              <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 shadow-sm hover:bg-gray-50 transition-all">
                <ArrowLeft size={18} />
              </button>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-0.5 bg-gray-50 border border-gray-100 rounded text-[10px] font-bold text-gray-400 uppercase">Cuisiniste</span>
                  <span className="text-[11px] font-bold text-gray-300">Créé le 01/01/2025</span>
                </div>
                <div className="flex items-center gap-4">
                  <h1 className="text-[20px] font-bold text-gray-900">Pose d'une cuisine</h1>
                  <div className="flex items-center gap-1.5">
                    <ProgressCircle progress={2} color="#94a3b8" />
                    <span className="text-[12px] font-bold text-gray-400">02%</span>
                  </div>
                  <span className="px-3 py-1 bg-[#FAE8FF] text-[#D946EF] text-[10px] font-extrabold rounded-full uppercase tracking-tight">Etudes à réaliser</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-6 mb-1">
                <span className="text-[14px] font-bold text-gray-900">Chloé Dubois</span>
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-700">
                  <Phone size={14} className="text-gray-300" /> 06 76 54 23 42
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-700">
                  <Mail size={14} className="text-gray-300" /> chloe.dubois@gmail.com
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <PenSquare size={16} /> Modifier le titre
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <Calendar size={16} /> Planifier un RDV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <CheckSquare size={16} /> Ajouter une tâche
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <Trash2 size={16} /> Projet perdu
                </button>
              </div>
            </div>
          </div>

          {/* Main Tabs Navigation */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex gap-10">
              {mainTabs.map((tab) => (
                <button 
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`flex items-center gap-2 pb-4 text-[14px] font-bold transition-all relative ${activeTab === tab.label ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  {tab.label}
                  {tab.badge && (
                    <div className="flex items-center ml-1">
                      <ProgressCircle progress={99} color="#D946EF" size="w-3.5 h-3.5" />
                      <span className={`text-[11px] font-extrabold ${tab.color}`}>{tab.badge}</span>
                    </div>
                  )}
                  {activeTab === tab.label && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all">
              <FileText size={16} className="text-gray-400" /> Résumé des informations
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 space-y-8 flex-1">
          {/* Sub-tabs for Etude Phase */}
          <div className="flex gap-8 border-b border-gray-100/50 mb-2">
            {subTabs.map((sub) => (
              <button 
                key={sub}
                onClick={() => setActiveSubTab(sub)}
                className={`pb-4 text-[14px] font-bold transition-all relative ${activeSubTab === sub ? 'text-gray-900' : 'text-gray-300'}`}
              >
                {sub}
                {activeSubTab === sub && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Section: Attribution */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-8 space-y-6 shadow-sm">
            <h3 className="text-[15px] font-bold text-gray-900">Attribution</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Agence</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-300 transition-all font-bold">
                    <option>Travaux confort</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Agenceur référent</label>
                <div className="relative">
                  <div className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 flex items-center gap-3 cursor-pointer">
                    <img src="https://i.pravatar.cc/150?u=1" className="w-6 h-6 rounded-full" alt="" />
                    <span className="text-sm font-bold text-gray-900">Jérémy</span>
                  </div>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Origine du Projet */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-8 space-y-6 shadow-sm">
            <h3 className="text-[15px] font-bold text-gray-900">Origine du Projet</h3>
            <div className="grid grid-cols-4 gap-6">
              {['Origine du projet', 'Sous origine', 'Nom', 'Lien parrain'].map((label) => (
                <div key={label} className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">{label}</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                      <option>Choisir</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Projet */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-8 space-y-6 shadow-sm">
            <h3 className="text-[15px] font-bold text-gray-900">Projet</h3>
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Adresse chantier</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Adresse facturation</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Métier de l'étude</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Exécution des travaux</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Artisan.s nécessaire.s</label>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[12px] font-bold text-gray-400">Non</span>
                  <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                  <span className="text-[12px] font-bold text-gray-900">Oui</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Artisan.s</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Date Prévisionnelle Signature</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Dates prévisionnel chantier</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Date installation cuisine</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner une date</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Enveloppe financière */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-[15px] font-bold text-gray-900">Enveloppe financière</h3>
              <button className="flex items-center gap-2 text-[12px] font-bold text-gray-800">
                <CheckSquare size={16} /> Ajouter une note
              </button>
            </div>
            <div className="grid grid-cols-3 gap-8">
              {['Fourchette basse Budget', 'Fourchette haute Budget', 'Budget global du chantier'].map(l => (
                <div key={l} className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">{l}</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                      <option>Sélectionner</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-8">
              {['Financement du projet', 'Organisme financement'].map(l => (
                <div key={l} className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">{l}</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                      <option>Sélectionner</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Installation */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-8 space-y-6 shadow-sm">
            <h3 className="text-[15px] font-bold text-gray-900">Installation</h3>
            <div className="grid grid-cols-12 gap-6 items-end">
              <div className="col-span-3 space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Dépose</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div className="col-span-3 space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Installation</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div className="col-span-3 space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Livraison à charge de</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div className="col-span-3 space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Plans techniques</label>
                <div className="flex items-center gap-3 pb-3">
                  <span className="text-[12px] font-bold text-gray-400">Non</span>
                  <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                  <span className="text-[12px] font-bold text-gray-400">Oui</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Concurrence */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-8 space-y-6 shadow-sm">
            <h3 className="text-[15px] font-bold text-gray-900">Concurrence</h3>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3 space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Nombre de confrères consultés</label>
                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-1.5 justify-between">
                  <span className="text-sm font-bold text-gray-400">Confrères</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setConcurrenceCount(Math.max(0, concurrenceCount - 1))} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500 hover:bg-gray-300 transition-all"><Minus size={16} /></button>
                    <span className="w-6 text-center font-bold text-gray-900">{concurrenceCount}</span>
                    <button onClick={() => setConcurrenceCount(concurrenceCount + 1)} className="w-8 h-8 flex items-center justify-center bg-gray-400 rounded-lg text-white hover:bg-gray-500 transition-all"><Plus size={16} /></button>
                  </div>
                </div>
              </div>
              <div className="col-span-3 space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Confrères</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
              <div className="col-span-3 space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Budget</label>
                <div className="relative">
                  <input type="text" className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">€</span>
                </div>
              </div>
              <div className="col-span-3 space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Statut des projets</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Permis de construire */}
          <div className="bg-white border border-gray-100 rounded-[18px] p-8 space-y-6 shadow-sm">
            <h3 className="text-[15px] font-bold text-gray-900">Permis de construire</h3>
            <div className="grid grid-cols-2 gap-12 items-end">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Permis de construire accordé</label>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[12px] font-bold text-gray-400">Non</span>
                  <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                  <span className="text-[12px] font-bold text-gray-900">Oui</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400">Date d'obtention Permis</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none">
                    <option>Sélectionner une date</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="pb-20" />
        </div>
      </div>

      {/* Right Sidebar Monitoring */}
      <div className="w-24 bg-white border-l border-gray-100 flex flex-col items-center py-10 gap-8 shrink-0 relative shadow-lg">
        <button className="p-4 text-gray-400 hover:text-gray-900 transition-all"><ChevronRight size={24} className="rotate-180" /></button>
        <div className="w-12 h-px bg-gray-50"></div>
        
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <ProgressCircle progress={2} color="#94a3b8" size="w-8 h-8" />
            <span className="text-[10px] font-bold text-gray-900">02%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ProgressCircle progress={99} color="#D946EF" size="w-8 h-8" />
            <span className="text-[10px] font-bold text-[#D946EF]">99%</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-30">
            <ProgressCircle progress={0} color="#3B82F6" size="w-8 h-8" />
            <span className="text-[10px] font-bold text-blue-500">0%</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-30">
            <ProgressCircle progress={0} color="#0EA5E9" size="w-8 h-8" />
            <span className="text-[10px] font-bold text-cyan-500">0%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;