
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Trees, Factory, Wind, Columns, MinusSquare, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
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

const MultiSelect = ({ value, onChange, options, placeholder = "Sélectionner", disabled = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (opt: string) => {
    const current = Array.isArray(value) ? value : [];
    const newValue = current.includes(opt)
      ? current.filter(v => v !== opt)
      : [...current, opt];
    onChange(newValue);
  };

  const displayValue = () => {
    if (!Array.isArray(value) || value.length === 0) return placeholder;
    return value.join(', ');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border rounded-[14px] px-4 py-3 text-[14px] transition-all duration-200 ${
          isOpen 
            ? 'border-gray-900 ring-4 ring-gray-50 shadow-sm' 
            : 'border-gray-200 hover:border-gray-300 shadow-sm'
        }`}
      >
        <span className={`font-bold truncate ${!Array.isArray(value) || value.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
          {displayValue()}
        </span>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[18px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-[250px] overflow-y-auto py-2 px-2 custom-scrollbar">
            {options.map((opt: string) => {
              const isSelected = Array.isArray(value) && value.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(opt)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left rounded-xl transition-all mb-0.5 group ${
                    isSelected ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-[13px] ${isSelected ? 'font-bold' : 'font-medium'}`}>{opt}</span>
                  {isSelected && <Check size={14} className="text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

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

  const ambianceOptions = [
    "Contemporaine",
    "Industrielle",
    "Campagne Chic",
    "Scandinave",
    "Epurée",
    "Autre",
    "Ne sait pas"
  ];

  const mobilierConserveOptions = [
    "Canapé",
    "Fauteuils",
    "Table",
    "Chaises",
    "Meubles Meublants",
    "Autre"
  ];

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      
      {/* 1. Bloc Ambiance */}
      <Section title="Ambiance">
        <Field label="Ambiance.s recherchée.s (Sélection multiple)" colSpan="col-span-12">
          <MultiSelect 
            value={project.details?.kitchen?.ambianceSelection || []}
            options={ambianceOptions}
            onChange={(v: string[]) => handleUpdate('details.kitchen.ambianceSelection', v)}
            placeholder="Sélectionner une ou plusieurs ambiances..."
          />
        </Field>
        
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
            <MultiSelect 
              value={project.details?.kitchen?.materiauxConserves?.selectionMobilier || []} 
              options={mobilierConserveOptions} 
              onChange={(v: string[]) => handleUpdate('details.kitchen.materiauxConserves.selectionMobilier', v)} 
              placeholder="Sélectionner mobilier(s)..."
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
