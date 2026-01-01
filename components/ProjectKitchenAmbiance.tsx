
import React from 'react';
import { Sparkles, Trees, Factory, Wind, Columns, MinusSquare, ChevronDown } from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { doc, updateDoc } from '@firebase/firestore';

// --- Composants UI Déplacés hors du rendu pour éviter la perte de focus ---

const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="bg-white border border-gray-100 rounded-[24px] p-8 space-y-6 shadow-sm mb-6">
    <h3 className="text-[15px] font-bold text-gray-800">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {children}
    </div>
  </div>
);

const Field = ({ label, children, colSpan = "col-span-12 md:col-span-4" }: { label: string; children?: React.ReactNode; colSpan?: string }) => (
  <div className={colSpan}>
    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
    {children}
  </div>
);

const LongTextField = ({ value, onChange, placeholder = "Saisir ici...", rows = 3, colSpan = "col-span-12" }: any) => (
  <div className={colSpan}>
    <textarea 
      rows={rows}
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[13px] font-medium text-gray-800 outline-none focus:bg-white focus:border-gray-300 transition-all resize-none shadow-inner"
    />
  </div>
);

const Select = ({ value, onChange, options, placeholder = "Sélectionner", colSpan = "col-span-12" }: any) => (
  <div className={`relative group ${colSpan}`}>
    <select 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 transition-all shadow-sm"
    >
      <option value="">{placeholder}</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-hover:text-gray-400" />
  </div>
);

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

  const ambianceOptions = [
    { id: 'Moderne', icon: Sparkles },
    { id: 'Rustique', icon: Trees },
    { id: 'Industriel', icon: Factory },
    { id: 'Scandinave', icon: Wind },
    { id: 'Classique', icon: Columns },
    { id: 'Minimaliste', icon: MinusSquare },
  ];

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      
      {/* 1. Bloc Ambiance */}
      <Section title="Ambiance">
        <div className="col-span-12 space-y-4">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Ambiance.s recherchée.s (Sélection multiple)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ambianceOptions.map((opt) => {
              const isSelected = (project.details?.kitchen?.ambianceSelection || []).includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
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
        
        <Field label="Ambiance appréciée" colSpan="col-span-12 md:col-span-6">
          <LongTextField 
            value={project.details?.kitchen?.ambianceAppreciee} 
            onChange={(v: string) => handleUpdate('details.kitchen.ambianceAppreciee', v)} 
            placeholder="Décrivez ce que le client aime..."
          />
        </Field>
        <Field label="Ambiance à éviter" colSpan="col-span-12 md:col-span-6">
          <LongTextField 
            value={project.details?.kitchen?.ambianceAEviter} 
            onChange={(v: string) => handleUpdate('details.kitchen.ambianceAEviter', v)} 
            placeholder="Ce que le client ne veut surtout pas..."
          />
        </Field>
      </Section>

      {/* 2. Bloc Modèle final (Présentation client) */}
      <Section title="Modèle final (Présentation client)">
        <Field label="Mobilier" colSpan="col-span-12 md:col-span-4">
          <LongTextField 
            value={project.details?.kitchen?.modeleFinal?.mobilier} 
            onChange={(v: string) => handleUpdate('details.kitchen.modeleFinal.mobilier', v)} 
            placeholder="Précisez le modèle de mobilier..."
          />
        </Field>
        <Field label="Poignées" colSpan="col-span-12 md:col-span-4">
          <LongTextField 
            value={project.details?.kitchen?.modeleFinal?.poignees} 
            onChange={(v: string) => handleUpdate('details.kitchen.modeleFinal.poignees', v)} 
            placeholder="Type de poignées..."
          />
        </Field>
        <Field label="Plan de travail" colSpan="col-span-12 md:col-span-4">
          <LongTextField 
            value={project.details?.kitchen?.modeleFinal?.planDeTravail} 
            onChange={(v: string) => handleUpdate('details.kitchen.modeleFinal.planDeTravail', v)} 
            placeholder="Matériau et coloris du plan..."
          />
        </Field>
      </Section>

      {/* 3. Bloc Matériaux client conservés */}
      <Section title="Matériaux client conservés">
        <Field label="Sol cuisine" colSpan="col-span-12 md:col-span-4">
          <LongTextField 
            value={project.details?.kitchen?.materiauxConserves?.sol} 
            onChange={(v: string) => handleUpdate('details.kitchen.materiauxConserves.sol', v)} 
            placeholder="Carrelage, parquet..."
          />
        </Field>
        <Field label="Mur cuisine" colSpan="col-span-12 md:col-span-4">
          <LongTextField 
            value={project.details?.kitchen?.materiauxConserves?.mur} 
            onChange={(v: string) => handleUpdate('details.kitchen.materiauxConserves.mur', v)} 
            placeholder="Peinture, faïence..."
          />
        </Field>
        <Field label="Autre.s" colSpan="col-span-12 md:col-span-4">
          <LongTextField 
            value={project.details?.kitchen?.materiauxConserves?.autres} 
            onChange={(v: string) => handleUpdate('details.kitchen.materiauxConserves.autres', v)} 
            placeholder="Plafond, éclairage existant..."
          />
        </Field>

        <div className="col-span-12 grid grid-cols-12 gap-6 pt-2">
          <Field label="Sélection Mobilier" colSpan="col-span-12 md:col-span-4">
            <Select 
              value={project.details?.kitchen?.materiauxConserves?.selectionMobilier} 
              options={['Existant à conserver', 'Nouveau mobilier', 'Mélange ancien/nouveau']} 
              onChange={(v: string) => handleUpdate('details.kitchen.materiauxConserves.selectionMobilier', v)} 
            />
          </Field>
          <Field label="Description (Sol, mur, déco, etc...)" colSpan="col-span-12 md:col-span-8">
            <LongTextField 
              rows={2}
              value={project.details?.kitchen?.materiauxConserves?.description} 
              onChange={(v: string) => handleUpdate('details.kitchen.materiauxConserves.description', v)} 
              placeholder="Précisions supplémentaires sur l'état des matériaux..."
            />
          </Field>
        </div>
      </Section>

    </div>
  );
};

export default ProjectKitchenAmbiance;
