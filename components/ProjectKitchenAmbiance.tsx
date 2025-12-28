
import React from 'react';
import { Sparkles, Trees, Factory, Wind, Columns, MinusSquare, Plus, Minus } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface ProjectKitchenAmbianceProps {
  project: any;
}

const ProjectKitchenAmbiance: React.FC<ProjectKitchenAmbianceProps> = ({ project }) => {
  const handleUpdate = async (field: string, value: any) => {
    try {
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, { [field]: value });
    } catch (e) {
      console.error("Erreur update ambiance:", e);
    }
  };

  const toggleAmbiance = (ambiance: string) => {
    const current = project.details?.kitchen?.ambianceSelection || [];
    const isSelected = current.includes(ambiance);
    const newList = isSelected 
      ? current.filter((a: string) => a !== ambiance)
      : [...current, ambiance];
    handleUpdate('details.kitchen.ambianceSelection', newList);
  };

  const Counter = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm w-full">
      <span className="text-[13px] font-bold text-gray-400">{label}</span>
      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={() => onChange(Math.max(0, (value || 0) - 1))}
          className="w-7 h-7 bg-gray-100 text-gray-600 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="text-sm font-bold text-gray-900 min-w-[20px] text-center">{value || 0}</span>
        <button 
          type="button"
          onClick={() => onChange((value || 0) + 1)}
          className="w-7 h-7 bg-gray-100 text-gray-600 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );

  const ambianceOptions = [
    { id: 'Moderne', icon: Sparkles },
    { id: 'Rustique', icon: Trees },
    { id: 'Industriel', icon: Factory },
    { id: 'Scandinave', icon: Wind },
    { id: 'Classique', icon: Columns },
    { id: 'Minimaliste', icon: MinusSquare },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-100 rounded-[24px] p-8 space-y-8 shadow-sm">
        <div className="space-y-4">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Ambiance.s recherchée.s (Sélection multiple)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ambianceOptions.map((opt) => {
              const isSelected = (project.details?.kitchen?.ambianceSelection || []).includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleAmbiance(opt.id)}
                  className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 ${
                    isSelected 
                    ? 'bg-[#1A1C23] border-[#1A1C23] text-white shadow-lg scale-[1.02]' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <opt.icon size={24} className={isSelected ? 'text-white' : 'text-gray-300'} />
                  <span className="text-[12px] font-bold uppercase tracking-tight">{opt.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
          <Counter 
            label="Nombre de couverts" 
            value={project.details?.kitchen?.nbCouverts || 0} 
            onChange={(v) => handleUpdate('details.kitchen.nbCouverts', v)} 
          />
          <Counter 
            label="Repas / jour" 
            value={project.details?.kitchen?.repasJour || 0} 
            onChange={(v) => handleUpdate('details.kitchen.repasJour', v)} 
          />
          <Counter 
            label="Fréquence courses" 
            value={project.details?.kitchen?.frequenceCourses || 0} 
            onChange={(v) => handleUpdate('details.kitchen.frequenceCourses', v)} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Ambiance appréciée</label>
            <textarea 
              placeholder="Décrivez les goûts du client..." 
              value={project.details?.kitchen?.ambianceAppreciee || ''} 
              onChange={(e) => handleUpdate('details.kitchen.ambianceAppreciee', e.target.value)} 
              className="w-full h-32 bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm font-medium text-gray-800 outline-none focus:bg-white focus:border-gray-300 transition-all resize-none shadow-inner" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Ambiance à éviter</label>
            <textarea 
              placeholder="Ce que le client ne veut surtout pas..." 
              value={project.details?.kitchen?.ambianceAEviter || ''} 
              onChange={(e) => handleUpdate('details.kitchen.ambianceAEviter', e.target.value)} 
              className="w-full h-32 bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm font-medium text-gray-800 outline-none focus:bg-white focus:border-gray-300 transition-all resize-none shadow-inner" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectKitchenAmbiance;
