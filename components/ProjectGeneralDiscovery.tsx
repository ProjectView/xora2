
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, Plus, Minus, FileText, Search, MapPin, Loader2, Upload, File } from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { doc, updateDoc } from '@firebase/firestore';

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

// --- Composants UI Déplacés hors du rendu pour éviter la perte de focus ---

const Section = ({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) => (
  <div className="bg-white border border-gray-100 rounded-[24px] p-8 space-y-6 shadow-sm">
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

const CurrencyInput = ({ value, onChange, placeholder = "0" }: any) => (
  <div className="relative group">
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value || ''} 
      onChange={(e) => {
        const val = e.target.value.replace(/[^0-9.,]/g, '');
        onChange(val);
      }}
      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 transition-all shadow-sm"
    />
    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-gray-900">€</span>
  </div>
);

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
  
  const chantierRef = useRef<HTMLDivElement>(null);
  const factuRef = useRef<HTMLDivElement>(null);

  const handleUpdate = async (field: string, value: any) => {
    try {
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, { [field]: value });
    } catch (e) {
      console.error("Erreur update découverte:", e);
    }
  };

  // BAN API Search for Chantier
  useEffect(() => {
    const fetchAddr = async () => {
      if (chantierSearch.length < 4 || chantierSearch === project.details?.adresseChantier) {
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
  }, [chantierSearch, project.details?.adresseChantier]);

  // BAN API Search for Facturation
  useEffect(() => {
    const fetchAddr = async () => {
      if (factuSearch.length < 4 || factuSearch === project.details?.adresseFacturation) {
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
  }, [factuSearch, project.details?.adresseFacturation]);

  // Hierarchy calculations
  const currentCategory = project.details?.category || '';
  const currentOrigin = project.origine || '';
  const categories = useMemo(() => Object.keys(HIERARCHY_DATA), []);
  const origins = useMemo(() => currentCategory ? Object.keys(HIERARCHY_DATA[currentCategory] || {}) : [], [currentCategory]);
  const subOrigins = useMemo(() => (currentCategory && currentOrigin) ? (HIERARCHY_DATA[currentCategory]?.[currentOrigin] || []) : [], [currentCategory, currentOrigin]);

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    // Expected date format in project is DD/MM/YYYY, input type date needs YYYY-MM-DD
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
        <Field label="Catégorie" colSpan="col-span-12 md:col-span-4">
          <Select 
            value={currentCategory} 
            options={categories} 
            onChange={(v: string) => handleUpdate('details.category', v)} 
            placeholder="Sélectionner une catégorie"
          />
        </Field>
        <Field label="Origine" colSpan="col-span-12 md:col-span-4">
          <Select 
            disabled={!currentCategory}
            value={currentOrigin} 
            options={origins} 
            onChange={(v: string) => handleUpdate('origine', v)} 
            placeholder="Sélectionner une origine"
          />
        </Field>
        <Field label="Sous-origine" colSpan="col-span-12 md:col-span-4">
          <Select 
            disabled={!currentOrigin}
            value={project.details?.subOrigin} 
            options={subOrigins} 
            onChange={(v: string) => handleUpdate('details.subOrigin', v)} 
            placeholder="Sélectionner une sous-origine"
          />
        </Field>
      </Section>

      {/* 3. Projet */}
      <Section title="Projet">
        {/* Adresse Chantier avec recherche */}
        <Field label="Adresse chantier" colSpan="col-span-12 md:col-span-6">
          <div className="relative" ref={chantierRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={chantierSearch}
                onChange={(e) => setChantierSearch(e.target.value)}
                placeholder="Rechercher une adresse..."
                className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-10 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 shadow-sm transition-all"
              />
              {isSearchingChantier && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={16} className="animate-spin text-gray-300" /></div>}
            </div>
            {suggestionsChantier.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-200">
                {suggestionsChantier.map((f: any) => (
                  <button 
                    key={f.properties.id} 
                    type="button" 
                    onClick={() => {
                      setChantierSearch(f.properties.label);
                      handleUpdate('details.adresseChantier', f.properties.label);
                      setSuggestionsChantier([]);
                    }}
                    className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-start gap-4 border-b border-gray-50 last:border-0 group"
                  >
                    <div className="mt-1 p-1.5 bg-gray-50 rounded-lg text-gray-300 group-hover:text-gray-900 transition-all"><MapPin size={16} /></div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-900">{f.properties.name}</span>
                      <span className="text-[11px] text-gray-400">{f.properties.postcode} {f.properties.city}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        {/* Adresse Facturation avec recherche */}
        <Field label="Adresse facturation" colSpan="col-span-12 md:col-span-6">
          <div className="relative" ref={factuRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={factuSearch}
                onChange={(e) => setFactuSearch(e.target.value)}
                placeholder="Rechercher une adresse..."
                className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-10 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 shadow-sm transition-all"
              />
              {isSearchingFactu && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={16} className="animate-spin text-gray-300" /></div>}
            </div>
            {suggestionsFactu.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-200">
                {suggestionsFactu.map((f: any) => (
                  <button 
                    key={f.properties.id} 
                    type="button" 
                    onClick={() => {
                      setFactuSearch(f.properties.label);
                      handleUpdate('details.adresseFacturation', f.properties.label);
                      setSuggestionsFactu([]);
                    }}
                    className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-start gap-4 border-b border-gray-50 last:border-0 group"
                  >
                    <div className="mt-1 p-1.5 bg-gray-50 rounded-lg text-gray-300 group-hover:text-gray-900 transition-all"><MapPin size={16} /></div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-900">{f.properties.name}</span>
                      <span className="text-[11px] text-gray-400">{f.properties.postcode} {f.properties.city}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Field label="Métier de l'étude" colSpan="col-span-12 md:col-span-3">
          <Select value={project.metier} options={['Cuisiniste', 'Bainiste', 'Rénovateur']} onChange={(v: string) => handleUpdate('metier', v)} />
        </Field>
        <Field label="Exécution des travaux" colSpan="col-span-12 md:col-span-3">
          <Select value={project.details?.executionTravaux} options={['Immédiat', 'Dans 3 mois', 'Dans 6 mois']} onChange={(v: string) => handleUpdate('details.executionTravaux', v)} />
        </Field>
        <Field label="Artisan.s nécessaire.s" colSpan="col-span-6 md:col-span-2">
          <div className="pt-2"><Toggle value={project.details?.artisansNecessaires || false} onChange={(v) => handleUpdate('details.artisansNecessaires', v)} /></div>
        </Field>
        <Field label="Artisan.s" colSpan="col-span-12 md:col-span-4">
          <Select value={project.details?.artisanSelection} options={['Choisir']} onChange={(v: string) => handleUpdate('details.artisanSelection', v)} />
        </Field>

        <Field label="Date Prévisionnelle Signature" colSpan="col-span-12 md:col-span-4">
          <input 
            type="date" 
            value={formatDateForInput(project.details?.dateSignature)} 
            onChange={(e) => handleDateChange('details.dateSignature', e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 shadow-sm transition-all" 
          />
        </Field>
        <Field label="Dates prévisionnel chantier" colSpan="col-span-12 md:col-span-4">
          <input 
            type="date" 
            value={formatDateForInput(project.details?.dateChantier)} 
            onChange={(e) => handleDateChange('details.dateChantier', e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 shadow-sm transition-all" 
          />
        </Field>
        <Field label="Date installation cuisine" colSpan="col-span-12 md:col-span-4">
          <input 
            type="date" 
            value={formatDateForInput(project.details?.dateInstallation)} 
            onChange={(e) => handleDateChange('details.dateInstallation', e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 shadow-sm transition-all" 
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
        
        <Field label="Financement du projet" colSpan="col-span-12 md:col-span-6">
          <Select 
            value={project.details?.financement} 
            options={['Comptant', 'Organisme de financement', 'Autre']} 
            onChange={(v: string) => handleUpdate('details.financement', v)} 
          />
        </Field>

        {project.details?.financement === 'Organisme de financement' && (
          <Field label="Organisme financement" colSpan="col-span-12 md:col-span-6">
            <Select value={project.details?.organismeFinancement} options={['Cetelem', 'Sofinco', 'Franfinance', 'Banque Populaire', 'Autre']} onChange={(v: string) => handleUpdate('details.organismeFinancement', v)} />
          </Field>
        )}

        {project.details?.financement === 'Autre' && (
          <Field label="Précisez le financement" colSpan="col-span-12 md:col-span-6">
            <input 
              type="text" 
              placeholder="Ex: Prêt familial..." 
              value={project.details?.financementAutre || ''} 
              onChange={(e) => handleUpdate('details.financementAutre', e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 shadow-sm"
            />
          </Field>
        )}
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
        
        {/* Plans techniques sur une nouvelle ligne */}
        <div className="col-span-12 pt-4">
           <Field label="Plans techniques" colSpan="col-span-12">
             <div className="pt-1"><Toggle value={project.details?.plansTechniques || false} onChange={(v) => handleUpdate('details.plansTechniques', v)} /></div>
           </Field>
        </div>

        {/* Encart de dépôt si activé */}
        {project.details?.plansTechniques && (
          <div className="col-span-12 animate-in slide-in-from-top-4 duration-300">
             <div className="border-2 border-dashed border-gray-100 rounded-3xl p-10 bg-gray-50/50 flex flex-col items-center justify-center text-center group hover:border-indigo-400 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 mb-4 shadow-sm group-hover:scale-110 group-hover:text-indigo-500 transition-all">
                   <Upload size={32} />
                </div>
                <h4 className="text-sm font-bold text-gray-800">Déposer les plans techniques</h4>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs">Formats acceptés : PDF, JPG, PNG, DWG. (Max 10Mo)</p>
                
                {/* Visualisation simulée de fichiers */}
                <div className="flex flex-wrap gap-4 mt-8 justify-center">
                   {[1, 2].map(i => (
                     <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm min-w-[180px]">
                        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg"><File size={16} /></div>
                        <div className="text-left">
                           <p className="text-[10px] font-bold text-gray-900">plan_technique_0{i}.pdf</p>
                           <p className="text-[9px] text-gray-400 uppercase font-bold">PDF • 2.4 MB</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </Section>

      {/* 6. Concurrence */}
      <Section title="Concurrence">
        <Field label="Nombre de confrères consultés" colSpan="col-span-12 md:col-span-3">
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
             <span className="text-[13px] font-bold text-gray-200 italic">Confrères</span>
             <div className="flex items-center gap-3">
                <button type="button" onClick={() => handleUpdate('details.nbConfreres', Math.max(0, (project.details?.nbConfreres || 0) - 1))} className="w-7 h-7 bg-gray-100 text-gray-600 rounded flex items-center justify-center hover:bg-gray-200"><Minus size={14} /></button>
                <span className="text-sm font-bold text-gray-900">{project.details?.nbConfreres || 0}</span>
                <button type="button" onClick={() => handleUpdate('details.nbConfreres', (project.details?.nbConfreres || 0) + 1)} className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center hover:bg-black shadow-md"><Plus size={14} /></button>
             </div>
          </div>
        </Field>
        <Field label="Confrères" colSpan="col-span-12 md:col-span-3">
          <Select value={project.details?.confrereNom} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.confrereNom', v)} />
        </Field>
        <Field label="Budget" colSpan="col-span-12 md:col-span-3">
          <CurrencyInput value={project.details?.budgetConcurrence} onChange={(v: string) => handleUpdate('details.budgetConcurrence', v)} />
        </Field>
        <Field label="Statut des projets" colSpan="col-span-12 md:col-span-3">
          <Select value={project.details?.statutProjetsConcurrence} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.statutProjetsConcurrence', v)} />
        </Field>
      </Section>

      {/* 7. Permis de construire */}
      <Section title="Permis de construire">
        <Field label="Permis de construire accordé" colSpan="col-span-6 md:col-span-3">
          <div className="pt-2"><Toggle value={project.details?.permisAccorde || false} onChange={(v) => handleUpdate('details.permisAccorde', v)} /></div>
        </Field>
        <Field label="Date d'obtention Permis" colSpan="col-span-12 md:col-span-3">
          <input 
            type="date" 
            value={formatDateForInput(project.details?.datePermis)} 
            onChange={(e) => handleDateChange('details.datePermis', e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 shadow-sm transition-all" 
          />
        </Field>
      </Section>
    </div>
  );
};

export default ProjectGeneralDiscovery;
