
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Minus, 
  FileText, 
  Search, 
  MapPin, 
  Loader2, 
  Upload, 
  File, 
  X, 
  Star, 
  Calendar,
  Check
} from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from '@firebase/firestore';

// Structure de données hiérarchique identique aux autres composants
const HIERARCHY_DATA: Record<string, Record<string, string[]>> = {
  "Actif commercial": {
    "Prospection terrain": ["Porte-à-porte", "Tour de chantier"],
    "Relance fichier": ["Anciens devis", "Clients perdus", "SAV"],
    "Parrainage": ["Bon de parrainage", "Spontanée"],
    "Prescripteur": ["Artisan partenaire", "Architecte", "Courtier", "Décorateur"],
    "Démarchage téléphonique": ["Appel froid", "Suivi salon", "Relance mailing"]
  },
  "Notoriété": {
    "Bouche-à-oreille": ["Famille/ami", "Voisin"],
    "Recommandation spontanée": ["Sans lien identifié"],
    "Ancien client": ["Autre projet", "Retour suite SAV"],
    "Avis en ligne": ["Google", "PagesJaunes", "Site d’avis"]
  },
  "Marketing": {
    "Publicité digitale": ["Google Ads", "Facebook Ads", "Instagram Ads", "Retargeting"],
    "Site web": ["Formulaire contact", "Prise de RDV en ligne", "Chatbot"],
    "Emailing": ["Newsletter", "Email promo", "Relance devis automatique"],
    "SMS marketing": ["Campagne promo", "Relance devis"],
    "Réseaux sociaux": ["Facebook perso", "Instagram", "TikTok", "Live", "Story promo"],
    "Affichage": ["Panneau pub", "Abribus", "Panneau chantier", "Véhicule floqué"],
    "Média traditionnel": ["Magazine", "Journal gratuit", "Publication pro", "Radio"],
    "Événementiel": ["Salon", "Foire"],
    "Réseaux pro": ["BNI", "Club entrepreneurs", "Groupement métiers"],
    "Événement magasin": ["Portes ouvertes", "Inauguration", "Anniversaire showroom"]
  },
  "Magasin": {
    "Passage magasin": ["Sans RDV"],
    "Vitrine": ["Promo vitrine", "PLV"],
    "Référencement local": ["Google Maps", "PagesJaunes", "GPS", "Plan local"],
    "Bouche-à-oreille local": ["Habitant quartier", "Voisinage proche"]
  },
  "Autres": {
    "Carte de visite": ["Récupérée événement", "Posée en magasin"],
    "Opportunité": ["Spontanée"],
    "Autre": ["À préciser"]
  }
};

const LISTE_CONFRERES = [
  "Arthur Bonnet", "Autres", "Aviva", "But", "Caseo", "Coméra", "Cuisine +", 
  "Cuisine Référence", "Cuisinella", "Cuisines Omega", "Cuisines Vendom", 
  "Darty", "Eco cuisine", "Elton", "Envia Cuisines", "Hygéna", "Ikea", 
  "Inova", "Intérieurs Privés", "Ixina", "Kitchen Family", "Leicht", 
  "Maxima", "MH Cuisine", "Mobalpa", "Morel", "Noblessa", "Perène", 
  "Schmidt", "Socooc", "Stosa", "Aran"
];

const ARTISANS_OPTIONS = [
  "Tous corps d'état",
  "Plombier",
  "Electricien",
  "Plaquiste",
  "Peintre",
  "Platrier/Peintre",
  "Maçon",
  "Chauffagiste",
  "Menuisier/ébéniste",
  "Carreleur"
];

const Section = ({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) => (
  <div className="bg-white border border-gray-100 rounded-[24px] p-8 space-y-6 shadow-sm mb-6">
    <div className="flex justify-between items-center">
      <h3 className="text-[15px] font-bold text-gray-800">{title}</h3>
      {action}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {children}
    </div>
  </div>
);

const Field = ({ label, children, colSpan = "col-span-12 md:col-span-3" }: { label: string; children?: React.ReactNode; colSpan?: string }) => (
  <div className={colSpan}>
    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
    {children}
  </div>
);

const Select = ({ value, onChange, options, placeholder = "Sélectionner", disabled = false }: any) => (
  <div className="relative group">
    <select 
      disabled={disabled}
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 transition-all shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
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
        className={`w-full flex items-center justify-between bg-white border rounded-xl px-4 py-3 text-[13px] transition-all shadow-sm ${
          disabled ? 'bg-gray-50 text-gray-400 border-gray-100' : 'border-gray-100 hover:border-gray-300'
        }`}
      >
        <span className={`font-bold truncate ${!Array.isArray(value) || value.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
          {displayValue()}
        </span>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 right-0 md:top-full md:bottom-auto md:mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
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
                  <span className={`text-[12px] ${isSelected ? 'font-bold' : 'font-medium'}`}>{opt}</span>
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

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center gap-3">
    <span className={`text-[12px] font-bold ${!value ? 'text-gray-900' : 'text-gray-300'}`}>Non</span>
    <button 
      type="button" 
      onClick={() => onChange(!value)} 
      className={`w-12 h-6 rounded-full relative transition-all duration-300 ${value ? 'bg-gray-800' : 'bg-gray-300'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${value ? 'right-1' : 'left-1'}`}></div>
    </button>
    <span className={`text-[12px] font-bold ${value ? 'text-gray-900' : 'text-gray-300'}`}>Oui</span>
  </div>
);

const CurrencyInput = ({ value, onChange, placeholder = "0" }: any) => {
  const formatValue = (val: string | number) => {
    if (val === undefined || val === null || val === '') return '';
    const numericValue = val.toString().replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    onChange(rawValue);
  };

  return (
    <div className="relative group">
      <input 
        type="text" 
        placeholder={placeholder} 
        value={formatValue(value)} 
        onChange={handleInputChange}
        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 transition-all shadow-sm pr-10"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-gray-900 pointer-events-none">€</span>
    </div>
  );
};

interface ProjectGeneralDiscoveryProps {
  project: any;
  userProfile: any;
}

const ProjectGeneralDiscovery: React.FC<ProjectGeneralDiscoveryProps> = ({ project, userProfile }) => {
  const companyName = userProfile?.companyName || 'Ma Société';
  
  // Address Search states
  const [chantierSearch, setChantierSearch] = useState(project.details?.adresseChantier || '');
  const [factuSearch, setFactuSearch] = useState(project.details?.adresseFacturation || '');
  const [suggestionsChantier, setSuggestionsChantier] = useState<any[]>([]);
  const [suggestionsFactu, setSuggestionsFactu] = useState<any[]>([]);
  const [isSearchingChantier, setIsSearchingChantier] = useState(false);
  const [isSearchingFactu, setIsSearchingFactu] = useState(false);
  const [showChantierSuggestions, setShowChantierSuggestions] = useState(false);
  const [showFactuSuggestions, setShowFactuSuggestions] = useState(false);
  
  const [clientAddresses, setClientAddresses] = useState<any[]>([]);
  
  const chantierRef = useRef<HTMLDivElement>(null);
  const factuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project?.clientId) return;
    const fetchClient = async () => {
      const snap = await getDoc(doc(db, 'clients', project.clientId));
      if (snap.exists()) {
        const data = snap.data();
        const addresses: any[] = [];
        if (data.details?.address) {
          addresses.push({ label: data.details.address, type: 'Principale', isMain: true });
        }
        if (data.details?.properties && Array.isArray(data.details.properties)) {
          data.details.properties.forEach((p: any) => {
            if (p.address && p.address !== data.details.address) {
              addresses.push({ label: p.address, type: p.usage || 'Secondaire', isMain: false });
            }
          });
        }
        setClientAddresses(addresses);
      }
    };
    fetchClient();
  }, [project?.clientId]);

  const handleUpdate = async (field: string, value: any) => {
    try {
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, { [field]: value });
    } catch (e) {
      console.error("Erreur update découverte:", e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chantierRef.current && !chantierRef.current.contains(event.target as Node)) {
        setShowChantierSuggestions(false);
      }
      if (factuRef.current && !factuRef.current.contains(event.target as Node)) {
        setShowFactuSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAddr = async () => {
      if (chantierSearch.length < 4 || clientAddresses.some(a => a.label === chantierSearch)) {
        setSuggestionsChantier([]);
        return;
      }
      setIsSearchingChantier(true);
      try {
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(chantierSearch)}&limit=5`);
        const data = await response.json();
        setSuggestionsChantier(data.features || []);
      } catch (error) { console.error(error); } finally { setIsSearchingChantier(false); }
    };
    const timer = setTimeout(fetchAddr, 300);
    return () => clearTimeout(timer);
  }, [chantierSearch, clientAddresses]);

  useEffect(() => {
    const fetchAddr = async () => {
      if (factuSearch.length < 4 || clientAddresses.some(a => a.label === factuSearch)) {
        setSuggestionsFactu([]);
        return;
      }
      setIsSearchingFactu(true);
      try {
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(factuSearch)}&limit=5`);
        const data = await response.json();
        setSuggestionsFactu(data.features || []);
      } catch (error) { console.error(error); } finally { setIsSearchingFactu(false); }
    };
    const timer = setTimeout(fetchAddr, 300);
    return () => clearTimeout(timer);
  }, [factuSearch, clientAddresses]);

  const categories = useMemo(() => Object.keys(HIERARCHY_DATA), []);
  const currentCategory = project.details?.category || '';
  const currentOrigin = project.origine || '';
  const origins = useMemo(() => currentCategory ? Object.keys(HIERARCHY_DATA[currentCategory] || {}) : [], [currentCategory]);
  const subOrigins = useMemo(() => (currentCategory && currentOrigin) ? (HIERARCHY_DATA[currentCategory]?.[currentOrigin] || []) : [], [currentCategory, currentOrigin]);

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    return dateStr;
  };

  const handleDateChange = (field: string, val: string) => {
    if (!val) {
      handleUpdate(field, '');
      return;
    }
    const [y, m, d] = val.split('-');
    handleUpdate(field, `${d}/${m}/${y}`);
  };

  const updateConfrereField = (index: number, field: string, value: any) => {
    const currentList = [...(project.details?.confreresList || [])];
    if (!currentList[index]) currentList[index] = {};
    currentList[index] = { ...currentList[index], [field]: value };
    handleUpdate('details.confreresList', currentList);
  };

  const nbConfreres = project.details?.nbConfreres || 0;

  // Composant local pour gérer une plage de dates
  const DateRangeField = ({ startField, endField, startValue, endValue }: any) => (
    <div className="flex items-center gap-2">
      <div className="relative group flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-indigo-600 transition-colors pointer-events-none z-10" size={14} />
        <input 
          type="date" 
          value={formatDateForInput(startValue)} 
          onChange={(e) => handleDateChange(startField, e.target.value)} 
          className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-2 py-3 text-[12px] font-bold text-gray-900 outline-none focus:border-indigo-400 shadow-sm transition-all cursor-pointer" 
        />
      </div>
      <span className="text-[10px] font-black text-gray-300 uppercase shrink-0">au</span>
      <div className="relative group flex-1">
        <input 
          type="date" 
          value={formatDateForInput(endValue)} 
          onChange={(e) => handleDateChange(endField, e.target.value)} 
          className="w-full bg-white border border-gray-100 rounded-xl px-3 py-3 text-[12px] font-bold text-gray-900 outline-none focus:border-indigo-400 shadow-sm transition-all cursor-pointer" 
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* 1. Attribution */}
      <Section title="Attribution">
        <Field label="Agence" colSpan="col-span-12 md:col-span-6">
          <div className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 flex items-center justify-between shadow-sm">
            {companyName}
            <ChevronDown size={16} className="text-gray-300" />
          </div>
        </Field>
        <Field label="Agenceur référent" colSpan="col-span-12 md:col-span-6">
          <div className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <img src={project.agenceur?.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-50 shadow-sm" alt="" />
            <span className="text-[13px] font-bold text-gray-900">{project.agenceur?.name}</span>
            <ChevronDown size={18} className="ml-auto text-gray-400" />
          </div>
        </Field>
      </Section>

      {/* 2. Origine du projet */}
      <Section title="Origine du Projet">
        <Field label="Origine" colSpan="col-span-12 md:col-span-4">
          <Select 
            value={currentCategory} 
            options={categories} 
            onChange={(v: string) => handleUpdate('details.category', v)} 
            placeholder="Sélectionner une origine"
          />
        </Field>
        <Field label="Sous-origine" colSpan="col-span-12 md:col-span-4">
          <Select 
            disabled={!currentCategory}
            value={currentOrigin} 
            options={origins} 
            onChange={(v: string) => handleUpdate('origine', v)} 
            placeholder="Sélectionner une sous-origine"
          />
        </Field>
        <Field label="Sources" colSpan="col-span-12 md:col-span-4">
          <Select 
            disabled={!currentOrigin}
            value={project.details?.subOrigin} 
            options={subOrigins} 
            onChange={(v: string) => handleUpdate('details.subOrigin', v)} 
            placeholder="Sélectionner une source"
          />
        </Field>
      </Section>

      {/* 3. Projet */}
      <Section title="Projet">
        <Field label="Adresse chantier" colSpan="col-span-12 md:col-span-6">
          <div className="relative" ref={chantierRef}>
            <div className="relative group">
              <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearchingChantier ? 'text-indigo-500' : 'text-gray-400 group-focus-within:text-indigo-600'}`} size={18} />
              <input 
                type="text" 
                value={chantierSearch}
                onChange={(e) => {
                  setChantierSearch(e.target.value);
                  setShowChantierSuggestions(true);
                }}
                onFocus={() => setShowChantierSuggestions(true)}
                placeholder="Choisir ou saisir l'adresse du chantier..."
                className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-12 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
              />
              {chantierSearch && (
                <button 
                  onClick={() => { setChantierSearch(''); handleUpdate('details.adresseChantier', ''); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {showChantierSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-200 flex flex-col">
                {clientAddresses.map((addr, idx) => (
                  <button key={idx} type="button" onClick={() => { setChantierSearch(addr.label); handleUpdate('details.adresseChantier', addr.label); setShowChantierSuggestions(false); }} className="w-full px-5 py-4 text-left hover:bg-indigo-50 flex items-start gap-4 border-b border-gray-50 last:border-0 group transition-all">
                    <div className={`mt-1 p-1.5 rounded-lg ${addr.isMain ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}><MapPin size={16} /></div>
                    <div className="flex flex-col"><span className="text-[13px] font-bold text-gray-900">{addr.label}</span><span className="text-[10px] text-indigo-400 font-black uppercase tracking-tighter">{addr.type}</span></div>
                  </button>
                ))}
                {suggestionsChantier.map((f: any) => (
                  <button key={f.properties.id} type="button" onClick={() => { setChantierSearch(f.properties.label); handleUpdate('details.adresseChantier', f.properties.label); setShowChantierSuggestions(false); }} className="w-full px-5 py-4 text-left hover:bg-indigo-50 flex items-start gap-4 border-b border-gray-50 last:border-0 group transition-all">
                    <div className="mt-1 p-1.5 bg-gray-50 rounded-lg text-gray-300 group-hover:text-indigo-600 transition-all"><Search size={16} /></div>
                    <div className="flex flex-col"><span className="text-[13px] font-bold text-gray-900">{f.properties.name}</span><span className="text-[11px] text-gray-400 font-medium">{f.properties.postcode} {f.properties.city}</span></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Field label="Adresse facturation" colSpan="col-span-12 md:col-span-6">
          <div className="relative" ref={factuRef}>
            <div className="relative group">
              <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearchingFactu ? 'text-indigo-500' : 'text-gray-400 group-focus-within:text-indigo-600'}`} size={18} />
              <input 
                type="text" 
                value={factuSearch}
                onChange={(e) => {
                  setFactuSearch(e.target.value);
                  setShowFactuSuggestions(true);
                }}
                onFocus={() => setShowFactuSuggestions(true)}
                placeholder="Choisir ou saisir l'adresse de facturation..."
                className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-12 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
              />
            </div>
            {showFactuSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-200 flex flex-col">
                {clientAddresses.map((addr, idx) => (
                  <button key={idx} type="button" onClick={() => { setFactuSearch(addr.label); handleUpdate('details.adresseFacturation', addr.label); setShowFactuSuggestions(false); }} className="w-full px-5 py-4 text-left hover:bg-indigo-50 flex items-start gap-4 border-b border-gray-50 last:border-0 group transition-all">
                    <div className={`mt-1 p-1.5 rounded-lg ${addr.isMain ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}><MapPin size={16} /></div>
                    <div className="flex flex-col"><span className="text-[13px] font-bold text-gray-900">{addr.label}</span><span className="text-[10px] text-indigo-400 font-black uppercase tracking-tighter">{addr.type}</span></div>
                  </button>
                ))}
                {suggestionsFactu.map((f: any) => (
                  <button key={f.properties.id} type="button" onClick={() => { setFactuSearch(f.properties.label); handleUpdate('details.adresseFacturation', f.properties.label); setShowFactuSuggestions(false); }} className="w-full px-5 py-4 text-left hover:bg-indigo-50 flex items-start gap-4 border-b border-gray-50 last:border-0 group transition-all">
                    <div className="mt-1 p-1.5 bg-gray-50 rounded-lg text-gray-300 group-hover:text-indigo-600 transition-all"><Search size={16} /></div>
                    <div className="flex flex-col"><span className="text-[13px] font-bold text-gray-900">{f.properties.name}</span><span className="text-[11px] text-gray-400 font-medium">{f.properties.postcode} {f.properties.city}</span></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Field label="Métier de l'étude" colSpan="col-span-12 md:col-span-3">
          <Select value={project.metier} options={['Cuisine', 'Cuisine extérieure', 'Salle de bain', 'Mobilier', 'Dressing', 'Bureau']} onChange={(v: string) => handleUpdate('metier', v)} />
        </Field>
        <Field label="Exécution des travaux" colSpan="col-span-12 md:col-span-3">
          <Select value={project.details?.executionTravaux} options={['Client', 'Artisan(s) client', companyName, 'Artisans sté', 'Ne sait pas']} onChange={(v: string) => handleUpdate('details.executionTravaux', v)} />
        </Field>
        <Field label="Artisan.s nécessaire.s" colSpan="col-span-6 md:col-span-2">
          <div className="pt-2"><Toggle value={project.details?.artisansNecessaires || false} onChange={(v) => handleUpdate('details.artisansNecessaires', v)} /></div>
        </Field>
        {project.details?.artisansNecessaires && (
          <Field label="Artisan.s" colSpan="col-span-12 md:col-span-4">
            <MultiSelect 
              value={project.details?.artisanSelection || []} 
              options={ARTISANS_OPTIONS} 
              onChange={(v: string[]) => handleUpdate('details.artisanSelection', v)} 
              placeholder="Choisir artisan.s..."
            />
          </Field>
        )}

        <Field label="Date Prévisionnelle Signature" colSpan="col-span-12 md:col-span-4">
          <DateRangeField 
            startField="details.dateSignatureStart"
            endField="details.dateSignatureEnd"
            startValue={project.details?.dateSignatureStart}
            endValue={project.details?.dateSignatureEnd}
          />
        </Field>
        <Field label="Dates prévisionnel chantier" colSpan="col-span-12 md:col-span-4">
          <DateRangeField 
            startField="details.dateChantierStart"
            endField="details.dateChantierEnd"
            startValue={project.details?.dateChantierStart}
            endValue={project.details?.dateChantierEnd}
          />
        </Field>
        <Field label="Date installation cuisine" colSpan="col-span-12 md:col-span-4">
          <DateRangeField 
            startField="details.dateInstallationStart"
            endField="details.dateInstallationEnd"
            startValue={project.details?.dateInstallationStart}
            endValue={project.details?.dateInstallationEnd}
          />
        </Field>
      </Section>

      {/* 4. Enveloppe financière */}
      <Section title="Enveloppe financière" action={<button className="flex items-center gap-2 text-[11px] font-bold text-gray-800 hover:text-indigo-600 transition-colors"><FileText size={14} /> Ajouter une note</button>}>
        <Field label="Fourchette basse Budget" colSpan="col-span-12 md:col-span-4">
          <CurrencyInput value={project.details?.budgetBas} onChange={(v: string) => handleUpdate('details.budgetBas', v)} />
        </Field>
        <Field label="Fourchette haute Budget" colSpan="col-span-12 md:col-span-4">
          <CurrencyInput value={project.details?.budgetHaut} onChange={(v: string) => handleUpdate('details.budgetHaut', v)} />
        </Field>
        <Field label="Budget global du chantier" colSpan="col-span-12 md:col-span-4">
          <CurrencyInput value={project.details?.budgetGlobal} onChange={(v: string) => handleUpdate('details.budgetGlobal', v)} />
        </Field>
      </Section>

      {/* 5. Installation */}
      <Section title="Installation">
        <Field label="Dépose" colSpan="col-span-12 md:col-span-4">
          <Select value={project.details?.depose} options={[companyName, 'Client', 'Autre']} onChange={(v: string) => handleUpdate('details.depose', v)} />
        </Field>
        <Field label="Installation" colSpan="col-span-12 md:col-span-4">
          <Select value={project.details?.installationType} options={[companyName, 'Client', 'Autre']} onChange={(v: string) => handleUpdate('details.installationType', v)} />
        </Field>
        <Field label="Livraison à charge de" colSpan="col-span-12 md:col-span-4">
          <Select value={project.details?.livraisonCharge} options={[companyName, 'Client', 'Autre']} onChange={(v: string) => handleUpdate('details.livraisonCharge', v)} />
        </Field>
        
        <div className="col-span-12 pt-4">
           <Field label="Plans techniques nécessaires" colSpan="col-span-12">
             <div className="pt-1"><Toggle value={project.details?.plansTechniques || false} onChange={(v) => handleUpdate('details.plansTechniques', v)} /></div>
           </Field>
        </div>

        {project.details?.plansTechniques && (
          <div className="col-span-12 animate-in slide-in-from-top-4 duration-300">
             <Field label="Date de remise des plans" colSpan="col-span-12 md:col-span-12">
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-indigo-600 transition-colors pointer-events-none z-10" size={18} />
                  <input 
                    type="date" 
                    value={formatDateForInput(project.details?.dateRemisePlans)} 
                    onChange={(e) => handleDateChange('details.dateRemisePlans', e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all cursor-pointer" 
                  />
                </div>
             </Field>
          </div>
        )}
      </Section>

      {/* 6. Concurrence */}
      <Section title="Concurrence">
        <Field label="Nombre de confrères consultés" colSpan="col-span-12 md:col-span-4">
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
             <span className="text-[13px] font-bold text-gray-200 italic">Confrères</span>
             <div className="flex items-center gap-3">
                <button type="button" onClick={() => handleUpdate('details.nbConfreres', Math.max(0, (project.details?.nbConfreres || 0) - 1))} className="w-7 h-7 bg-gray-100 text-gray-600 rounded flex items-center justify-center hover:bg-gray-200"><Minus size={14} /></button>
                <span className="text-sm font-bold text-gray-900">{nbConfreres}</span>
                <button type="button" onClick={() => handleUpdate('details.nbConfreres', (project.details?.nbConfreres || 0) + 1)} className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center hover:bg-black shadow-md"><Plus size={14} /></button>
             </div>
          </div>
        </Field>
        
        {/* Dynamic fields for each consultant */}
        {nbConfreres > 0 && Array.from({ length: nbConfreres }).map((_, idx) => (
          <div key={idx} className="col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-gray-50 mt-2 animate-in slide-in-from-top-2 duration-300">
            <Field label={`Confrère #${idx + 1}`} colSpan="col-span-12 md:col-span-4">
              <Select 
                value={project.details?.confreresList?.[idx]?.nom || ''} 
                options={LISTE_CONFRERES} 
                onChange={(v: string) => updateConfrereField(idx, 'nom', v)} 
                placeholder="Choisir un confrère..."
              />
            </Field>
            <Field label="Budget annoncé" colSpan="col-span-12 md:col-span-4">
              <CurrencyInput 
                value={project.details?.confreresList?.[idx]?.budget || ''} 
                onChange={(v: string) => updateConfrereField(idx, 'budget', v)} 
              />
            </Field>
            <Field label="Statut du projet" colSpan="col-span-12 md:col-span-4">
              <Select 
                value={project.details?.confreresList?.[idx]?.statut || ''} 
                options={['En attente de devis', 'Devenu trop cher', 'Signature imminente', 'Projet arrêté']} 
                onChange={(v: string) => updateConfrereField(idx, 'statut', v)} 
              />
            </Field>
          </div>
        ))}
      </Section>

      {/* 7. Permis de construire */}
      <Section title="Permis de construire">
        <Field label="Permis de construire accordé" colSpan="col-span-6 md:col-span-3">
          <div className="pt-2"><Toggle value={project.details?.permisAccorde || false} onChange={(v) => handleUpdate('details.permisAccorde', v)} /></div>
        </Field>
        
        {project.details?.permisAccorde && (
          <Field label="Date d'obtention Permis" colSpan="col-span-12 md:col-span-3">
            <div className="relative group animate-in slide-in-from-left-2 duration-300">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-indigo-600 transition-colors pointer-events-none z-10" size={18} />
              <input 
                type="date" 
                value={formatDateForInput(project.details?.datePermis)} 
                onChange={(e) => handleDateChange('details.datePermis', e.target.value)} 
                className="w-full bg-white border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-indigo-400 shadow-sm transition-all cursor-pointer" 
              />
            </div>
          </Field>
        )}
      </Section>
    </div>
  );
};

export default ProjectGeneralDiscovery;
