import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Property {
  id: string;
  number: number;
  address: string;
  isMain: boolean;
  isExpanded: boolean;
}

const ClientPropertyInfo: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([
    {
      id: 'p1',
      number: 1,
      address: '7 Rue de Provence, 34350 Valras-Plage',
      isMain: true,
      isExpanded: false
    },
    {
      id: 'p2',
      number: 2,
      address: '12 Rue de Grillade, 34350 Valras-Plage',
      isMain: false,
      isExpanded: true
    }
  ]);

  const toggleExpand = (id: string) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, isExpanded: !p.isExpanded } : p
    ));
  };

  return (
    <div className="space-y-4 max-w-full animate-in fade-in duration-500">
      {/* En-tête de section */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[16px] font-bold text-gray-800">Liste des biens</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
          <Plus size={16} /> 
          Ajouter un bien
        </button>
      </div>
      
      {/* Conteneur principal gris très clair */}
      <div className="bg-[#f8f9fa] border border-gray-100 rounded-[20px] p-6 space-y-4">
        {properties.map((prop) => (
          <div 
            key={prop.id} 
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Header de la carte */}
            <div 
              className={`px-6 py-4 flex justify-between items-center cursor-pointer ${prop.isExpanded ? 'border-b border-gray-100' : ''}`}
              onClick={() => toggleExpand(prop.id)}
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-[14px] font-bold text-gray-900">Bien numéro {prop.number}</span>
                <span className="text-[13px] text-gray-500 font-medium truncate max-w-[300px]">{prop.address}</span>
                <span className="px-3 py-1 bg-[#F8F9FA] border border-gray-100 rounded-lg text-[10px] font-bold text-gray-700 uppercase tracking-tight">
                  {prop.isMain ? 'Bien principal' : 'Bien secondaire'}
                </span>
                <button 
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="text-gray-400">
                {prop.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {/* Formulaire expansé */}
            {prop.isExpanded && (
              <div className="p-6 space-y-6 animate-in slide-in-from-top-1 duration-200">
                {/* Ligne 1: Adresse */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Adresse</label>
                    <input 
                      type="text" 
                      defaultValue={prop.address} 
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Complément d'adresse</label>
                    <input 
                      type="text" 
                      placeholder="Complément" 
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 shadow-sm placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Ligne 2: Détails techniques 1 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Propriétaire</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 shadow-sm">
                        <option>Choisir</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Type de bien</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 shadow-sm">
                        <option>Choisir</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Type de propriété</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 shadow-sm">
                        <option selected={!prop.isMain}>Bien secondaire</option>
                        <option selected={prop.isMain}>Bien principal</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Nature des travaux</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 shadow-sm">
                        <option>Rénovation</option>
                        <option>Neuf</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Ligne 3: Détails techniques 2 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">+2ans</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 shadow-sm">
                        <option>Choisir</option>
                        <option>Oui</option>
                        <option>Non</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Etage</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 shadow-sm">
                        <option>Choisir</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Ascenseur</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 shadow-sm">
                        <option>Choisir</option>
                        <option>Oui</option>
                        <option>Non</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Infos diverses</label>
                    <input 
                      type="text" 
                      placeholder="à saisir" 
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 shadow-sm placeholder:text-gray-300"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientPropertyInfo;