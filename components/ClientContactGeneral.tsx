
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Client } from '../types';

interface ClientContactGeneralProps {
  client: Client;
}

const ClientContactGeneral: React.FC<ClientContactGeneralProps> = ({ client }) => {
  const [isContactExpanded, setIsContactExpanded] = useState(true);

  // Extraire les détails du client
  const details = (client as any).details || {};
  const civility = details.civility || 'Mme';
  
  // Si details.lastName n'existe pas, on tente de parser client.name
  const nameParts = client.name.split(' ');
  const displayLastName = details.lastName || nameParts.slice(1).join(' ') || client.name;
  const displayFirstName = details.firstName || nameParts[0] || '';

  return (
    <div className="space-y-6 max-w-full animate-in fade-in duration-500">
      {/* Section Coordonnées */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Coordonnées</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-50 transition-all">
            <Plus size={14} />
            Ajouter un contact
          </button>
        </div>

        {/* Card Contact Dynamique */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div 
            className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors border-b border-transparent"
            onClick={() => setIsContactExpanded(!isContactExpanded)}
          >
            <h4 className="text-sm font-bold text-gray-900">{client.name}</h4>
            <div className="p-1 hover:bg-gray-100 rounded">
              {isContactExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </div>
          </div>

          {isContactExpanded && (
            <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Civilité client</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition-all" defaultValue={civility}>
                      <option>Mme</option>
                      <option>M.</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Nom du client</label>
                  <input type="text" defaultValue={displayLastName} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Prénom client</label>
                  <input type="text" defaultValue={displayFirstName} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition-all" />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Email Client</label>
                  <input type="email" defaultValue={details.email || ''} placeholder="Entrer un email client" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition-all placeholder:text-gray-300" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Téléphone portable</label>
                  <div className="flex">
                    <div className="flex items-center gap-1 px-3 border border-r-0 border-gray-200 rounded-l-lg bg-white">
                      <span className="text-sm">🇫🇷</span>
                      <ChevronDown size={12} className="text-gray-400" />
                    </div>
                    <input type="text" defaultValue={details.phone || ''} placeholder="Entrer un numéro" className="flex-1 bg-white border border-gray-200 rounded-r-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition-all placeholder:text-gray-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Téléphone fixe</label>
                  <div className="flex">
                    <div className="flex items-center gap-1 px-3 border border-r-0 border-gray-200 rounded-l-lg bg-white">
                      <span className="text-sm">🇫🇷</span>
                      <ChevronDown size={12} className="text-gray-400" />
                    </div>
                    <input type="text" defaultValue={details.fixed || ''} placeholder="Entrer un numéro" className="flex-1 bg-white border border-gray-200 rounded-r-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition-all placeholder:text-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Adresse du bien principal */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Adresse du bien principal</h3>
        {details.address ? (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
             <p className="text-sm font-bold text-gray-800">{details.address}</p>
             {details.complement && <p className="text-xs text-gray-400 mt-1">{details.complement}</p>}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Veuillez renseigner l'adresse principal dans "infos des biens" pour la visualiser sur cette page</p>
        )}
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-50 transition-all">
          <Plus size={14} />
          {details.address ? 'Modifier l\'adresse' : 'Ajouter une adresse'}
        </button>
      </div>

      {/* Section Origine client */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-gray-900">Origine client</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-gray-400">Origine du contact</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition-all" defaultValue={client.origin}>
                <option value="Relation">Relation</option>
                <option value="Web">Web</option>
                <option value="Apporteur">Apporteur</option>
                <option value="Passage magasin">Passage magasin</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-gray-400">Sous origine</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition-all" defaultValue={details.subOrigin}>
                <option>Bouche à oreille</option>
                <option>Réseaux sociaux</option>
                <option>Parrainage</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientContactGeneral;
