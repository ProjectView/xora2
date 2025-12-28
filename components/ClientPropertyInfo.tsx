
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, Save } from 'lucide-react';
import { Client } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

interface Property {
  id: string;
  number: number;
  address: string;
  complement?: string;
  type?: string;
  usage?: string;
  workNature?: string;
  isMain: boolean;
  isExpanded: boolean;
}

interface ClientPropertyInfoProps {
  client: Client;
}

const ClientPropertyInfo: React.FC<ClientPropertyInfoProps> = ({ client: initialClient }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les biens depuis Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'clients', initialClient.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const existingProps = data.details?.properties || [];
        
        // S'il n'y a aucun bien, on initialise avec l'adresse principale
        if (existingProps.length === 0) {
          const mainProp = {
            id: 'main',
            number: 1,
            address: data.details?.address || 'Adresse principale',
            isMain: true,
            isExpanded: false
          };
          setProperties([mainProp]);
        } else {
          setProperties(existingProps.map((p: any) => ({ ...p, isExpanded: p.isExpanded || false })));
        }
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, [initialClient.id]);

  const saveProperties = async (newProperties: Property[]) => {
    try {
      const clientRef = doc(db, 'clients', initialClient.id);
      await updateDoc(clientRef, {
        "details.properties": newProperties.map(({ isExpanded, ...rest }) => rest)
      });
    } catch (e) {
      console.error("Erreur sauvegarde biens:", e);
    }
  };

  const toggleExpand = (id: string) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, isExpanded: !p.isExpanded } : p
    ));
  };

  const addProperty = () => {
    const newProp: Property = {
      id: Date.now().toString(),
      number: properties.length + 1,
      address: '',
      isMain: false,
      isExpanded: true
    };
    const updated = [...properties, newProp];
    setProperties(updated);
    saveProperties(updated);
  };

  const updatePropertyField = (id: string, field: keyof Property, value: any) => {
    const updated = properties.map(p => p.id === id ? { ...p, [field]: value } : p);
    setProperties(updated);
  };

  const handleBlur = () => {
    saveProperties(properties);
  };

  const removeProperty = (id: string) => {
    if (confirm("Supprimer ce bien ?")) {
      const updated = properties.filter(p => p.id !== id);
      setProperties(updated);
      saveProperties(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-[16px] font-bold text-gray-800">Liste des biens</h3>
        <button 
          onClick={addProperty}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
        >
          <Plus size={16} /> 
          Ajouter un bien
        </button>
      </div>
      
      <div className="bg-[#f8f9fa] border border-gray-100 rounded-[24px] p-6 space-y-4">
        {properties.map((prop) => (
          <div 
            key={prop.id} 
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div 
              className={`px-6 py-5 flex justify-between items-center cursor-pointer ${prop.isExpanded ? 'border-b border-gray-50' : ''}`}
              onClick={() => toggleExpand(prop.id)}
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-[14px] font-bold text-gray-900">Bien numéro {prop.number}</span>
                <span className="text-[13px] text-gray-400 font-medium truncate max-w-[300px]">{prop.address || 'Sans adresse'}</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${prop.isMain ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-700'}`}>
                  {prop.isMain ? 'Bien principal' : 'Bien secondaire'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {!prop.isMain && (
                  <button 
                    className="p-1.5 text-gray-200 hover:text-red-500 rounded transition-all"
                    onClick={(e) => { e.stopPropagation(); removeProperty(prop.id); }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <div className="text-gray-300">
                  {prop.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>

            {prop.isExpanded && (
              <div className="p-8 space-y-8 animate-in slide-in-from-top-1 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Adresse</label>
                    <input 
                      type="text" 
                      value={prop.address} 
                      onChange={(e) => updatePropertyField(prop.id, 'address', e.target.value)}
                      onBlur={handleBlur}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 shadow-sm transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Complément d'adresse</label>
                    <input 
                      type="text" 
                      placeholder="Appartement, étage..." 
                      value={prop.complement || ''}
                      onChange={(e) => updatePropertyField(prop.id, 'complement', e.target.value)}
                      onBlur={handleBlur}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 shadow-sm placeholder:text-gray-300 transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type de bien</label>
                    <div className="relative">
                      <select 
                        value={prop.type || 'Maison'}
                        onChange={(e) => { updatePropertyField(prop.id, 'type', e.target.value); saveProperties(properties); }}
                        className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 transition-all"
                      >
                        <option>Maison</option>
                        <option>Appartement</option>
                        <option>Terrain</option>
                        <option>Local Pro</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Usage</label>
                    <div className="relative">
                      <select 
                        value={prop.usage || 'Résidence principale'}
                        onChange={(e) => { updatePropertyField(prop.id, 'usage', e.target.value); saveProperties(properties); }}
                        className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 transition-all"
                      >
                        <option>Résidence principale</option>
                        <option>Résidence secondaire</option>
                        <option>Investissement locatif</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nature travaux</label>
                    <div className="relative">
                      <select 
                        value={prop.workNature || 'Rénovation'}
                        onChange={(e) => { updatePropertyField(prop.id, 'workNature', e.target.value); saveProperties(properties); }}
                        className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900 transition-all"
                      >
                        <option>Rénovation</option>
                        <option>Neuf</option>
                        <option>Extension</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex items-end pb-1">
                     <button 
                      onClick={() => saveProperties(properties)}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-500 hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                     >
                       <Save size={14} /> Sauvegarder
                     </button>
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
