import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  ChevronDown, 
  Package, 
  Loader2, 
  Check, 
  HelpCircle,
  Zap,
  Droplets,
  RotateCcw
} from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot, deleteField } from '@firebase/firestore';

// --- CONFIGURATION DES DIAGNOSTICS (ISSU DU CSV) ---

type QuestionType = 'single' | 'multi' | 'text';

interface Question {
  label: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
}

interface DiagnosticConfig {
  [key: string]: {
    label: string;
    questions: Question[];
  };
}

const DIAGNOSTIC_CONFIG: DiagnosticConfig = {
  "Four": {
    label: "FOUR",
    questions: [
      { label: "Fréquence d'utilisation ?", type: 'single', options: ["1x / jour", "3x / semaine", "1x / semaine", "1x / mois", "Jamais"] },
      { label: "Vos attentes ?", type: 'multi', options: ["Simple d'utilisation", "Très esthétique", "Optimisation des valeurs nutritives (vapeur)", "Pratique à nettoyer", "Choix technologies (chaleur sèche, humide, sous vide, basse temp, airfryer)", "Force de proposition recettes", "Aide préparation plats", "Connecté"] },
      { label: "Type de nettoyage ?", type: 'single', options: ["Pyrolyse impérative", "Pyrolyse occasionnelle", "Manuel avec aide (Vapor clean)", "Manuel classique", "Catalyse", "Indifférent"] },
      { label: "Positionnement ?", type: 'single', options: ["En hauteur", "Sous plan de travail", "Indifférent"] },
      { label: "Technologies et accessoirisations ?", type: 'multi', options: ["Vapeur / chaleur humide", "Airfryer", "Cuisson sous vide", "Rails télescopiques", "Sonde de cuisson", "Connecté", "Porte démontable"] },
      { label: "Commentaires", type: 'text', placeholder: "Précisions sur le four..." }
    ]
  },
  "Micro-ondes": {
    label: "MICRO-ONDES",
    questions: [
      { label: "Fréquence d'utilisation ?", type: 'single', options: ["Plusieurs fois / jour", "1x / jour", "3x / semaine", "1x / semaine", "Jamais"] },
      { label: "Utilisation(s) ?", type: 'multi', options: ["Réchauffer", "Décongeler", "Griller"] },
      { label: "Servir de 2° four de cuisson ?", type: 'single', options: ["Oui", "Non", "Indifférent"] },
      { label: "Agencement ?", type: 'single', options: ["Encastré en hauteur", "Posé sur plan de travail", "Indifférent"] },
      { label: "Design ?", type: 'single', options: ["Visible", "Invisible", "Indifférent"] },
      { label: "Commentaires", type: 'text' }
    ]
  },
  "Tiroir chauffe-plat": {
    label: "TIROIR CHAUFFE-PLAT",
    questions: [
      { label: "Fonction(s) ?", type: 'multi', options: ["Maintien au chaud assiette", "Maintien au chaud plat", "Décongélation", "Cuisson basse température"] },
      { label: "Commentaires", type: 'text' }
    ]
  },
  "Cafetière": {
    label: "CAFETIÈRE",
    questions: [
      { label: "Agencement ?", type: 'single', options: ["Encastrée", "Posée sur plan de travail", "Indifférent"] },
      { label: "Si encastrée, fonctions souhaitées ?", type: 'multi', options: ["Diversité préparations (expresso, capuccino...)", "Multi-réservoirs (grains, déca...)", "Facilité d'entretien"] },
      { label: "Commentaires", type: 'text' }
    ]
  },
  "Plaque de cuisson": {
    label: "PLAQUE DE CUISSON",
    questions: [
      { label: "Fréquence d'utilisation ?", type: 'single', options: ["Plusieurs fois / jour", "1x / jour", "3x / semaine", "1x / semaine", "Jamais"] },
      { label: "Technologie(s) ?", type: 'multi', options: ["Induction", "Gaz", "Halogène/radiant", "Tepan Yaki", "Friteuse", "Wok"] },
      { label: "Agencement ?", type: 'single', options: ["Îlot central", "Contre le mur", "Indifférent"] },
      { label: "Zones régulières simultanées ?", type: 'single', options: ["1 zone", "2 zones", "3 zones", "4 zones"] },
      { label: "Zones maximum nécessaires ?", type: 'single', options: ["2 zones", "3 zones", "4 zones", "+ de 4 zones"] },
      { label: "Commentaires", type: 'text' }
    ]
  },
  "Hotte": {
    label: "HOTTE",
    questions: [
      { label: "Utilisation actuelle ?", type: 'single', options: ["Systématiquement", "Souvent", "Rarement", "Jamais"] },
      { label: "Si peu utilisée, pourquoi ?", type: 'multi', options: ["Graisse ne me dérange pas", "Odeurs ne me dérangent pas", "Trop bruyante", "Trop d'entretien", "Pas efficace", "Pas le réflexe", "Préfère ouvrir la fenêtre", "Faible utilisation plaque", "Autre"] },
      { label: "Vos attentes ?", type: 'multi', options: ["Traitement graisse", "Traitement odeurs", "Niveau sonore faible", "Entretien facile", "Allumage auto", "Design", "Eclairage", "Autre"] },
      { label: "Design ?", type: 'single', options: ["Hotte visible", "Hotte cachée", "Indifférent"] },
      { label: "Installation ?", type: 'single', options: ["Recyclage", "Evacuation extérieure", "Indifférent"] },
      { label: "Commentaires", type: 'text' }
    ]
  },
  "Réfrigérateur": {
    label: "RÉFRIGÉRATEUR",
    questions: [
      { label: "Design ?", type: 'single', options: ["Visible", "Caché", "Indifférent"] },
      { label: "Type ?", type: 'single', options: ["Intégrable tout utile", "Intégrable compartiment congel", "Intégrable combiné", "Intégrable grande largeur", "Visible tout utile", "Visible combiné", "Visible grande largeur", "French door", "Frigo américain"] },
      { label: "Autre réfrigérateur/congélateur dans la maison ?", type: 'single', options: ["Oui : réfrigérateur", "Oui : congélateur", "Oui : les deux", "Non"] },
      { label: "Volume de conservation ?", type: 'single', options: ["XXL (> 400L)", "Important (300L)", "Moyen (200L)", "Faible (100L)"] },
      { label: "Vos attentes ?", type: 'multi', options: ["Conservation longue durée", "Glaçons", "Eau fraîche", "Filtres anti-odeurs", "Silencieux", "Eco énergie", "Indépendance frigo/congel", "Pas de givre"] },
      { label: "Commentaires", type: 'text' }
    ]
  },
  "Congélateur": {
    label: "CONGÉLATEUR (INDÉPENDANT)",
    questions: [
      { label: "Design ?", type: 'single', options: ["Visible", "Caché", "Indifférent"] },
      { label: "Modèle ?", type: 'single', options: ["Coffre", "Vertical", "Indifférent"] },
      { label: "Volume de conservation ?", type: 'single', options: ["XXL (> 300L)", "Important (200L)", "Normal (100L)", "Faible (< 100L)"] },
      { label: "Commentaires", type: 'text' }
    ]
  },
  "Cave à vins": {
    label: "CAVE À VINS",
    questions: [
      { label: "Objectif(s) ?", type: 'multi', options: ["Vieillissement", "Mise en température", "Les deux", "Indifférent"] },
      { label: "Agencement ?", type: 'single', options: ["Visible", "Caché", "Indifférent"] },
      { label: "Capacité (bouteilles) ?", type: 'single', options: ["- de 10", "10 à 20", "20 à 50", "50 à 100", "+ de 100"] },
      { label: "Zones de température ?", type: 'single', options: ["1", "2", "3", "Indifférent"] },
      { label: "Commentaires", type: 'text' }
    ]
  },
  "Lave-vaisselle": {
    label: "LAVE-VAISSELLE",
    questions: [
      { label: "Fréquence d'utilisation ?", type: 'single', options: ["Plusieurs fois / jour", "1x / jour", "3x / semaine", "1x / semaine", "- de 1x / semaine"] },
      { label: "Positionnement ?", type: 'single', options: ["En hauteur", "Sous plan de travail", "Indifférent"] },
      { label: "Hauteur ?", type: 'single', options: ["Standard 820mm", "Optimisé 860mm", "Indifférent"] },
      { label: "Programmes importants ?", type: 'multi', options: ["Automatique", "Hygiène", "Verres fragiles", "Auto-nettoyant", "Silence", "Express", "Economique"] },
      { label: "Technologies et accessoirisations ?", type: 'multi', options: ["3° tiroir à couverts", "Départ différé", "Infolight", "Flexibilité rangement", "Ouverture auto fin cycle", "Cuve inox", "Paniers accessoirisés"] },
      { label: "Commentaires", type: 'text' }
    ]
  },
  "Lave-linge": {
    label: "LAVE-LINGE",
    questions: [
      { label: "Design ?", type: 'single', options: ["Visible", "Caché", "Indifférent"] },
      { label: "Modèle ?", type: 'single', options: ["Hublot", "Par-dessus", "Indifférent"] },
      { label: "Fonction ?", type: 'single', options: ["Lavage", "Lavage/séchage"] },
      { label: "Commentaires", type: 'text' }
    ]
  },
  "Evier": {
    label: "EVIER",
    questions: [
      { label: "Nombre de bacs ?", type: 'single', options: ["1 bac", "1 bac + vide-sauce", "2 bacs"] },
      { label: "Largeur bac principal ?", type: 'single', options: ["- de 35 cm", "35 à 45 cm", "45 à 55 cm", "55 à 70 cm", "+ de 70 cm"] },
      { label: "Intégration ?", type: 'single', options: ["Encastré", "À fleur", "Sous-plan", "À poser", "Indifférent"] },
      { label: "Matériau ?", type: 'single', options: ["Quartz", "Inox", "Céramique", "Indifférent"] },
      { label: "Égouttoir souhaité ?", type: 'single', options: ["Oui", "Non", "Indifférent"] },
      { label: "Commentaires", type: 'text' }
    ]
  },
  "Mitigeur": {
    label: "MITIGEUR",
    questions: [
      { label: "Type ?", type: 'single', options: ["Sans douchette", "Avec douchette", "Indifférent"] },
      { label: "Coloris ?", type: 'multi', options: ["Chrome", "Inox mat", "Noir", "Cuivre", "Laiton", "Or", "Bronze", "Indifférent"] },
      { label: "Design ?", type: 'single', options: ["Col de cygne", "Coudée 90°", "Escamotable fenêtre", "Professionnel", "Indifférent"] },
      { label: "Technologie(s) ?", type: 'multi', options: ["Filtration eau pure", "Eau bouillante", "Eau fraîche", "Eau gazeuse", "Aucune"] },
      { label: "Commentaires", type: 'text' }
    ]
  },
  "Distributeur savon": { label: "DISTRIBUTEUR SAVON", questions: [{ label: "Commentaires", type: 'text' }] },
  "Égouttoir pliable": { label: "ÉGOUTTOIR PLIABLE", questions: [{ label: "Commentaires", type: 'text' }] },
  "Vidage automatique": { label: "VIDAGE AUTOMATIQUE", questions: [{ label: "Commentaires", type: 'text' }] },
  "Panier égouttoir": { label: "PANIER ÉGOUTTOIR", questions: [{ label: "Commentaires", type: 'text' }] },
  "Planche à découper": { label: "PLANCHE À DÉCOUPER / ÉGOUTTOIR", questions: [{ label: "Commentaires", type: 'text' }] },
  "Bonde + trop-plein": { label: "BONDE + TROP-PLEIN", questions: [{ label: "Commentaires", type: 'text' }] },
  "Cache bonde": { label: "CACHE BONDE", questions: [{ label: "Commentaires", type: 'text' }] },
};

// --- COMPOSANTS UI ---

const QuestionField: React.FC<{ 
  question: Question, 
  value: any, 
  onChange: (v: any) => void 
}> = ({ question, value, onChange }) => {
  if (question.type === 'single') {
    return (
      <div className="space-y-3">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{question.label}</label>
        <div className="flex flex-wrap gap-2">
          {question.options?.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-all ${
                value === opt ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === 'multi') {
    const current = Array.isArray(value) ? value : [];
    const toggle = (opt: string) => {
      const next = current.includes(opt) ? current.filter(v => v !== opt) : [...current, opt];
      onChange(next);
    };

    return (
      <div className="space-y-3">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{question.label}</label>
        <div className="flex flex-wrap gap-2">
          {question.options?.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-all flex items-center gap-2 ${
                current.includes(opt) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
              }`}
            >
              {current.includes(opt) && <Check size={14} />}
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{question.label}</label>
      <textarea
        rows={2}
        placeholder={question.placeholder || "Saisissez ici..."}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[13px] font-medium text-gray-800 outline-none focus:bg-white focus:border-gray-300 transition-all resize-none shadow-inner"
      />
    </div>
  );
};

const AccordionItem: React.FC<{ 
  title: string, 
  onDelete: () => void, 
  data: any, 
  onUpdate: (updates: any) => void,
  isElectro?: boolean
}> = ({ 
  title, 
  onDelete, 
  data, 
  onUpdate,
  isElectro = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = DIAGNOSTIC_CONFIG[title] || { label: title, questions: [] };
  
  // Vérifier si des données ont été saisies
  const isFilled = data && Object.keys(data).length > 0;

  return (
    <div className={`bg-white border rounded-[24px] overflow-hidden transition-all duration-300 ${isOpen ? 'border-indigo-100 shadow-xl ring-4 ring-indigo-50/30' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}>
      <div 
        className="px-6 py-5 flex items-center justify-between cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl transition-colors relative ${isOpen ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
            {isElectro ? <Zap size={20} /> : <Droplets size={20} />}
            {isFilled && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div className="flex flex-col">
            <h4 className={`text-[15px] font-black uppercase tracking-tight ${isOpen ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>{title}</h4>
            {isFilled && !isOpen && (
              <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1">
                <Check size={10} /> Diagnostic rempli
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isFilled && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Réinitialiser le diagnostic"
            >
              <RotateCcw size={18} />
            </button>
          )}
          <div className={`p-1 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-gray-300'}`}>
            <ChevronDown size={22} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-8 pb-8 pt-2 space-y-8 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 gap-8">
            {config.questions.map((q, idx) => (
              <QuestionField 
                key={idx} 
                question={q} 
                value={data?.[q.label]} 
                onChange={(v) => onUpdate({ ...data, [q.label]: v })}
              />
            ))}
          </div>
          {config.questions.length === 0 && (
             <div className="py-10 text-center bg-gray-50 border border-dashed border-gray-200 rounded-[20px]">
               <HelpCircle size={32} className="mx-auto text-gray-200 mb-2" />
               <p className="text-[12px] font-bold text-gray-400 italic">Aucune question spécifique configurée pour cet item.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---

interface ProjectKitchenElectrosProps {
  project: any;
  userProfile: any;
}

const ProjectKitchenElectros: React.FC<ProjectKitchenElectrosProps> = ({ project }) => {
  const electroTypes = Object.keys(DIAGNOSTIC_CONFIG).slice(0, 11); // Les 11 premiers sont des électros
  const sanitaireTypes = Object.keys(DIAGNOSTIC_CONFIG).slice(11); // Le reste sont des sanitaires

  const diagnostics = project.details?.kitchen?.diagnostics || {};

  const handleResetItem = async (type: string) => {
    if (!window.confirm(`Réinitialiser le diagnostic de l'item "${type}" ?`)) return;
    try {
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        [`details.kitchen.diagnostics.${type}`]: deleteField()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateItem = async (type: string, updates: any) => {
    try {
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        [`details.kitchen.diagnostics.${type}`]: updates
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* 1. SECTION ELECTRO */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-lg"><Zap size={24} /></div>
          <div>
            <h3 className="text-[17px] font-black text-gray-900 uppercase tracking-tight">Liste des électroménagers</h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Complétez les diagnostics pour chaque équipement</p>
          </div>
        </div>

        <div className="space-y-4">
          {electroTypes.map(type => (
            <AccordionItem 
              key={type}
              id={type}
              title={type}
              isElectro={true}
              data={diagnostics[type] || {}}
              onDelete={() => handleResetItem(type)}
              onUpdate={(up) => handleUpdateItem(type, up)}
            />
          ))}
        </div>
      </div>

      {/* 2. SECTION SANITAIRE */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Droplets size={24} /></div>
          <div>
            <h3 className="text-[17px] font-black text-gray-900 uppercase tracking-tight">Liste des sanitaires</h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Accessoires et équipements d'eau</p>
          </div>
        </div>

        <div className="space-y-4">
          {sanitaireTypes.map(type => (
            <AccordionItem 
              key={type}
              id={type}
              title={type}
              isElectro={false}
              data={diagnostics[type] || {}}
              onDelete={() => handleResetItem(type)}
              onUpdate={(up) => handleUpdateItem(type, up)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProjectKitchenElectros;