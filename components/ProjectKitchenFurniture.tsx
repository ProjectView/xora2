
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, Check, Search } from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { doc, updateDoc } from '@firebase/firestore';

// --- Sous-composants UI modernisés (Design épuré XORA) ---

const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="bg-white border border-gray-100 rounded-[24px] p-8 space-y-6 shadow-sm mb-6">
    <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6">
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

// Dropdown Moderne - Affichage propre sans accolades
const CustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Sélectionner", 
  multiple = false 
}: { 
  value: any, 
  onChange: (v: any) => void, 
  options: string[], 
  placeholder?: string,
  multiple?: boolean 
}) => {
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
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const newValue = current.includes(opt)
        ? current.filter(v => v !== opt)
        : [...current, opt];
      onChange(newValue);
    } else {
      onChange(opt);
      setIsOpen(false);
    }
  };

  const displayValue = () => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      if (current.length === 0) return placeholder;
      // Affichage propre séparé par des virgules sans accolades
      return current.join(', ');
    }
    return value || placeholder;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border rounded-[14px] px-4 py-3 text-[14px] transition-all duration-200 ${
          isOpen 
            ? 'border-gray-900 ring-4 ring-gray-50 shadow-sm' 
            : 'border-gray-200 hover:border-gray-300 shadow-sm'
        }`}
      >
        <span className={`font-bold truncate ${!value || (multiple && value.length === 0) ? 'text-gray-400' : 'text-gray-900'}`}>
          {displayValue()}
        </span>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[18px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-[250px] overflow-y-auto py-2 px-2 scrollbar-thin scrollbar-thumb-gray-200">
            {options.map((opt) => {
              const isSelected = multiple 
                ? (Array.isArray(value) && value.includes(opt))
                : value === opt;
              
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(opt)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left rounded-xl transition-all mb-0.5 group ${
                    isSelected 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-[13px] ${isSelected ? 'font-bold' : 'font-medium'}`}>{opt}</span>
                  {isSelected && <Check size={14} className={isSelected ? 'text-white' : 'text-gray-400'} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Input numérique - Le design de référence
const NumberInput = ({ value, onChange, unit }: { value: any; onChange: (v: number) => void; unit?: string }) => (
  <div className="relative group">
    <input 
      type="number" 
      value={value || ''} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full bg-white border border-gray-200 rounded-[14px] px-4 py-3 text-[14px] font-bold text-gray-900 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-50 transition-all shadow-sm"
    />
    {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">{unit}</span>}
  </div>
);

// TextArea - Calqué sur le design de l'input numérique (plus de shadow-inner)
const LongTextField = ({ value, onChange, placeholder = "Saisir ici...", rows = 3 }: any) => (
  <textarea 
    rows={rows}
    placeholder={placeholder}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="w-full bg-white border border-gray-200 rounded-[14px] p-4 text-[14px] font-bold text-gray-900 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-50 transition-all resize-none shadow-sm"
  />
);

const UsageCounter = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div className="flex-1 space-y-2">
    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block text-center">{label}</span>
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-[14px] px-4 py-2.5 shadow-sm">
      <button type="button" onClick={() => onChange(Math.max(0, (value || 0) - 1))} className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"><Minus size={14} /></button>
      <span className="text-[15px] font-black text-gray-900">{value || 0}</span>
      <button type="button" onClick={() => onChange((value || 0) + 1)} className="w-8 h-8 bg-[#1A1C23] text-white rounded-lg flex items-center justify-center hover:bg-black shadow-md transition-all"><Plus size={14} /></button>
    </div>
  </div>
);

interface ProjectKitchenFurnitureProps {
  project: any;
}

const ProjectKitchenFurniture: React.FC<ProjectKitchenFurnitureProps> = ({ project }) => {
  const handleUpdate = async (field: string, value: any) => {
    try {
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, { [field]: value });
    } catch (e) {
      console.error("Erreur update meubles:", e);
    }
  };

  const furnitureData = project.details?.kitchen?.furniture || {};

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      
      {/* 1. Rangements */}
      <Section title="Rangements">
        <Field label="Volume de rangement actuel" colSpan="col-span-12 md:col-span-6">
          <NumberInput value={furnitureData.volumeActuel} onChange={(v) => handleUpdate('details.kitchen.furniture.volumeActuel', v)} />
        </Field>
        <Field label="Volume de rangement souhaité" colSpan="col-span-12 md:col-span-6">
          <NumberInput value={furnitureData.volumeSouhaite} onChange={(v) => handleUpdate('details.kitchen.furniture.volumeSouhaite', v)} />
        </Field>
      </Section>

      {/* 2. Accessoire de meuble */}
      <Section title="Accessoire de meuble">
        <Field label="Sélectionner les accessoires" colSpan="col-span-12 md:col-span-6">
          <CustomDropdown 
            multiple
            value={furnitureData.accessoires || []} 
            options={['Tiroirs à l\'anglaise', 'Tour épice', 'Magic Corner', 'LeMans', 'Range-couverts', 'Fond antidérapant', 'Range-épices', 'Table escamotable']} 
            onChange={(v: string[]) => handleUpdate('details.kitchen.furniture.accessoires', v)} 
          />
        </Field>
        <Field label="Commentaire" colSpan="col-span-12 md:col-span-6">
          <LongTextField 
            rows={1}
            value={furnitureData.commentaireAccessoires} 
            onChange={(v: string) => handleUpdate('details.kitchen.furniture.commentaireAccessoires', v)} 
          />
        </Field>
      </Section>

      {/* 3. Éclairages */}
      <Section title="Éclairages">
        <Field label="Luminosité pièce" colSpan="col-span-12 md:col-span-6">
          <CustomDropdown 
            value={furnitureData.luminosite} 
            options={['Très sombre', 'Sombre', 'Normale', 'Claire', 'Très claire']} 
            onChange={(v: string) => handleUpdate('details.kitchen.furniture.luminosite', v)} 
          />
        </Field>
        <Field label="Température de l’éclairage" colSpan="col-span-12 md:col-span-6">
          <CustomDropdown 
            value={furnitureData.temperatureEclairage} 
            options={['Blanc chaud (3000K)', 'Blanc neutre (4000K)', 'Blanc froid (6000K)']} 
            onChange={(v: string) => handleUpdate('details.kitchen.furniture.temperatureEclairage', v)} 
          />
        </Field>
        <Field label="Description de l’éclairage" colSpan="col-span-12">
          <LongTextField 
            rows={2}
            value={furnitureData.descriptionEclairage} 
            onChange={(v: string) => handleUpdate('details.kitchen.furniture.descriptionEclairage', v)} 
          />
        </Field>
      </Section>

      {/* 4. Plan de dépose */}
      <Section title="Plan de dépose">
        <Field label="Appareil.s à poser" colSpan="col-span-12 md:col-span-6">
          <CustomDropdown 
            multiple
            value={furnitureData.appareilsAPoser || []} 
            options={['Cafetière', 'Grille-pain', 'Robot culinaire', 'Micro-ondes', 'Bouilloire', 'Plancha', 'Airfryer', 'Balance']} 
            onChange={(v: string[]) => handleUpdate('details.kitchen.furniture.appareilsAPoser', v)} 
          />
        </Field>
        <Field label="Longueur à prévoir" colSpan="col-span-12 md:col-span-2">
          <NumberInput unit="mm" value={furnitureData.longueurDepose} onChange={(v) => handleUpdate('details.kitchen.furniture.longueurDepose', v)} />
        </Field>
        <Field label="Description" colSpan="col-span-12 md:col-span-4">
          <LongTextField 
            rows={1}
            value={furnitureData.descriptionDepose} 
            onChange={(v: string) => handleUpdate('details.kitchen.furniture.descriptionDepose', v)} 
          />
        </Field>
      </Section>

      {/* 5. Plan de préparation */}
      <Section title="Plan de préparation">
        <Field label="Longueur à prévoir" colSpan="col-span-12 md:col-span-4">
          <NumberInput unit="mm" value={furnitureData.longueurPreparation} onChange={(v) => handleUpdate('details.kitchen.furniture.longueurPreparation', v)} />
        </Field>
        <Field label="Description gestion des déchets" colSpan="col-span-12 md:col-span-8">
          <LongTextField 
            rows={1}
            value={furnitureData.descriptionDechetsPrepa} 
            onChange={(v: string) => handleUpdate('details.kitchen.furniture.descriptionDechetsPrepa', v)} 
          />
        </Field>
      </Section>

      {/* 6. Plan de travail */}
      <Section title="Plan de travail">
        <Field label="Hauteur actuelle" colSpan="col-span-12 md:col-span-6">
          <NumberInput unit="mm" value={furnitureData.hauteurPlanActuelle} onChange={(v) => handleUpdate('details.kitchen.furniture.hauteurPlanActuelle', v)} />
        </Field>
        <Field label="Hauteur souhaitée" colSpan="col-span-12 md:col-span-6">
          <NumberInput unit="mm" value={furnitureData.hauteurPlanSouhaitee} onChange={(v) => handleUpdate('details.kitchen.furniture.hauteurPlanSouhaitee', v)} />
        </Field>
      </Section>

      {/* 7. Usage Cuisine */}
      <Section title="Usage Cuisine">
        <Field label="Repas quotidiennement" colSpan="col-span-12 md:col-span-6">
          <div className="flex gap-4">
            <UsageCounter label="Adultes" value={furnitureData.repasQuotidienAdultes} onChange={(v) => handleUpdate('details.kitchen.furniture.repasQuotidienAdultes', v)} />
            <UsageCounter label="Enfants" value={furnitureData.repasQuotidienEnfants} onChange={(v) => handleUpdate('details.kitchen.furniture.repasQuotidienEnfants', v)} />
          </div>
        </Field>
        <Field label="Repas exceptionnellement" colSpan="col-span-12 md:col-span-6">
          <div className="flex gap-4">
            <UsageCounter label="Adultes" value={furnitureData.repasExcepAdultes} onChange={(v) => handleUpdate('details.kitchen.furniture.repasExcepAdultes', v)} />
            <UsageCounter label="Enfants" value={furnitureData.repasExcepEnfants} onChange={(v) => handleUpdate('details.kitchen.furniture.repasExcepEnfants', v)} />
          </div>
        </Field>
        <Field label="Objectif.s nouvelle cuisine (Sélection multiple)" colSpan="col-span-12">
          <CustomDropdown 
            multiple
            value={furnitureData.objectifsCuisine || []} 
            options={['Plus de rangements', 'Plus de convivialité', 'Meilleure ergonomie', 'Design moderne', 'Facilité d\'entretien', 'Espace de repas intégré', 'Valorisation immobilière', 'Réduction sonore']} 
            onChange={(v: string[]) => handleUpdate('details.kitchen.furniture.objectifsCuisine', v)} 
          />
        </Field>
        <Field label="Description gestion des déchets" colSpan="col-span-12">
          <LongTextField 
            rows={2}
            value={furnitureData.usageDescriptionDechets} 
            onChange={(v: string) => handleUpdate('details.kitchen.furniture.usageDescriptionDechets', v)} 
          />
        </Field>
      </Section>

      {/* 8. Type de rangements */}
      <Section title="Type de rangements">
        {/* Ligne 1 : Meubles */}
        <Field label="Meubles bas (Sélection multiple)" colSpan="col-span-12 md:col-span-4">
          <CustomDropdown 
            multiple
            value={furnitureData.typeMeublesBas || []} 
            options={['Coulissants', 'Tiroirs', 'Portes battantes', 'Meuble d\'angle', 'Sous-évier', 'Four encastré', 'Range-bouteilles']} 
            onChange={(v: string[]) => handleUpdate('details.kitchen.furniture.typeMeublesBas', v)} 
          />
        </Field>
        <Field label="Meubles hauts (Sélection multiple)" colSpan="col-span-12 md:col-span-4">
          <CustomDropdown 
            multiple
            value={furnitureData.typeMeublesHauts || []} 
            options={['Relevants', 'Portes battantes', 'Niches ouvertes', 'Hotte intégrée', 'Sur-mesure plafond', 'Étagères éclairées']} 
            onChange={(v: string[]) => handleUpdate('details.kitchen.furniture.typeMeublesHauts', v)} 
          />
        </Field>
        <Field label="Colonnes" colSpan="col-span-12 md:col-span-4">
          <CustomDropdown 
            value={furnitureData.colonnes} 
            options={['Garde-manger', 'Frigo intégré', 'Four & MO', 'Pharmacie', 'Balai / Entretien', 'Sans colonne']} 
            onChange={(v: string) => handleUpdate('details.kitchen.furniture.colonnes', v)} 
          />
        </Field>

        {/* Ligne 2 : Descriptions */}
        <Field label="Description meubles bas" colSpan="col-span-12 md:col-span-4">
          <LongTextField rows={1} value={furnitureData.descMeublesBas} onChange={(v: string) => handleUpdate('details.kitchen.furniture.descMeublesBas', v)} />
        </Field>
        <Field label="Description meubles haut" colSpan="col-span-12 md:col-span-4">
          <LongTextField rows={1} value={furnitureData.descMeublesHauts} onChange={(v: string) => handleUpdate('details.kitchen.furniture.descMeublesHauts', v)} />
        </Field>
        <Field label="Description colonnes" colSpan="col-span-12 md:col-span-4">
          <LongTextField rows={1} value={furnitureData.descColonnes} onChange={(v: string) => handleUpdate('details.kitchen.furniture.descColonnes', v)} />
        </Field>

        {/* Ligne 3 : Déchets */}
        <Field label="Gestion des déchets" colSpan="col-span-12 md:col-span-4">
          <CustomDropdown 
            value={furnitureData.gestionDechets} 
            options={['Poubelle de sol', 'Poubelle sur porte', 'Coulissant dédié (2 bacs)', 'Coulissant dédié (3 bacs)', 'Trie sélectif sous évier']} 
            onChange={(v: string) => handleUpdate('details.kitchen.furniture.gestionDechets', v)} 
          />
        </Field>
        <Field label="Description Gestion des déchets" colSpan="col-span-12 md:col-span-8">
          <LongTextField rows={1} value={furnitureData.descGestionDechets} onChange={(v: string) => handleUpdate('details.kitchen.furniture.descGestionDechets', v)} />
        </Field>
      </Section>

    </div>
  );
};

export default ProjectKitchenFurniture;
