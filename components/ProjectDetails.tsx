
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  PenSquare, 
  Calendar, 
  CheckSquare, 
  Trash2, 
  Phone, 
  Mail, 
  Plus, 
  Minus,
  ChevronRight,
  FileText,
  Loader2,
  Check,
  Euro,
  StickyNote,
  Upload,
  MapPin,
  Search,
  MessageSquare,
  Sparkles,
  Trees,
  Factory,
  Wind,
  Columns,
  MinusSquare,
  File
} from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';

interface ProjectDetailsProps {
  project: any;
  userProfile: any;
  onBack: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project: initialProject, userProfile, onBack }) => {
  const [activeTab, setActiveTab] = useState('Etude client');
  const [activeSubTab, setActiveSubTab] = useState('Découverte');
  const [activeKitchenTab, setActiveKitchenTab] = useState('Ambiance');
  
  const [project, setProject] = useState<any>(initialProject);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // États pour la recherche d'adresse de facturation
  const [billingAddressSearch, setBillingAddressSearch] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(doc(db, 'projects', initialProject.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.id ? { id: docSnap.id, ...docSnap.data() } : docSnap.data();
        setProject(data);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [initialProject.id]);

  useEffect(() => {
    if (!project?.clientId) return;
    const fetchClient = async () => {
      const snap = await getDoc(doc(db, 'clients', project.clientId));
      if (snap.exists()) setClientData(snap.data());
    };
    fetchClient();
  }, [project?.clientId]);

  // Recherche BAN pour l'adresse de facturation
  useEffect(() => {
    const fetchAddresses = async () => {
      if (billingAddressSearch.length < 4) {
        setAddressSuggestions([]);
        return;
      }
      setIsSearchingAddress(true);
      try {
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(billingAddressSearch)}&limit=5`);
        const data = await response.json();
        setAddressSuggestions(data.features || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearchingAddress(false);
      }
    };
    const timer = setTimeout(fetchAddresses, 300);
    return () => clearTimeout(timer);
  }, [billingAddressSearch]);

  const handleUpdate = async (field: string, value: any) => {
    try {
      const projectRef = doc(db, 'projects', project.id);
      if (field.includes('.')) {
        const parts = field.split('.');
        let updateObj: any = {};
        updateObj[field] = value;
        await updateDoc(projectRef, updateObj);
      } else {
        await updateDoc(projectRef, { [field]: value });
      }
    } catch (e) {
      console.error("Erreur update projet:", e);
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
    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm w-full">
      <span className="text-[13px] font-bold text-gray-400">{label}</span>
      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={() => onChange(Math.max(0, (value || 0) - 1))}
          className="w-7 h-7 bg-gray-400 text-white rounded flex items-center justify-center hover:bg-gray-500 transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="text-sm font-bold text-gray-900 min-w-[20px] text-center">{value || 0}</span>
        <button 
          type="button"
          onClick={() => onChange((value || 0) + 1)}
          className="w-7 h-7 bg-gray-400 text-white rounded flex items-center justify-center hover:bg-gray-500 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );

  const ProgressCircle = ({ progress, color, size = "w-4 h-4" }: { progress: number; color: string; size?: string }) => {
    const strokeColor = color?.includes('D946EF') ? '#D946EF' : color?.includes('F97316') ? '#F97316' : color?.includes('0EA5E9') ? '#0EA5E9' : '#3B82F6';
    return (
      <svg className={`${size} mr-1.5`} viewBox="0 0 36 36">
        <path className="text-gray-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
        <path style={{ stroke: strokeColor }} strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  };

  const CustomToggle = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => (
    <div className="flex items-center gap-3">
      <span className={`text-[12px] font-bold ${!value ? 'text-gray-900' : 'text-gray-300'}`}>Non</span>
      <button 
        type="button"
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${value ? 'bg-gray-400' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${value ? 'right-1' : 'left-1'}`} />
      </button>
      <span className={`text-[12px] font-bold ${value ? 'text-gray-900' : 'text-gray-300'}`}>Oui</span>
    </div>
  );

  const mainTabs = [
    { label: 'Etude client', key: 'Etude client' },
    { label: 'Tâches (0)', key: 'Tâches' },
    { label: 'Calendrier', key: 'Calendrier' },
    { label: 'Documents', key: 'Documents' }
  ];

  const subTabs = ['Découverte', 'Découverte cuisine', 'Présentation commerciale', 'Devis en cours'];

  const kitchenTabs = [
    { id: 'Ambiance', label: 'Ambiance', icon: 'file' },
    { id: 'Meubles', label: 'Meubles', icon: 'plus' },
    { id: 'Electros & sanitaires', label: 'Electros & sanitaires', icon: 'plus' },
    { id: 'Estimation financière', label: 'Estimation financière', icon: 'plus' }
  ];

  const ambianceOptions = [
    { id: 'Moderne', icon: Sparkles },
    { id: 'Rustique', icon: Trees },
    { id: 'Industriel', icon: Factory },
    { id: 'Scandinave', icon: Wind },
    { id: 'Classique', icon: Columns },
    { id: 'Minimaliste', icon: MinusSquare },
  ];

  if (loading && !project) {
    return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-gray-200" size={48} /></div>;
  }

  const companyName = userProfile?.companyName || 'Ma Société';

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      <div className="flex-1 flex flex-col h-full overflow-y-auto hide-scrollbar">
        
        {/* Main Header Section */}
        <div className="px-8 py-6 bg-white shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-6">
              <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 shadow-sm hover:bg-gray-50 transition-all">
                <ArrowLeft size={18} />
              </button>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-0.5 bg-gray-50 border border-gray-100 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest">{project.metier}</span>
                  <span className="text-[11px] font-bold text-gray-300">Créé le {project.addedDate}</span>
                </div>
                <div className="flex items-center gap-4">
                  <h1 className="text-[20px] font-bold text-gray-900">{project.projectName}</h1>
                  <div className="flex items-center gap-1.5">
                    <ProgressCircle progress={project.progress || 0} color="#D946EF" />
                    <span className="text-[12px] font-bold text-[#D946EF]">{project.progress}%</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tight ${project.statusColor || 'bg-gray-100 text-gray-400'}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-6 mb-1">
                <span className="text-[14px] font-bold text-gray-900 uppercase">{project.clientName}</span>
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-700">
                  <Phone size={14} className="text-gray-300" /> {clientData?.details?.phone || 'Non renseigné'}
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-700">
                  <Mail size={14} className="text-gray-300" /> {clientData?.details?.email || 'Non renseigné'}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <PenSquare size={16} /> Modifier le titre
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <Calendar size={16} /> Planifier un RDV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <CheckSquare size={16} /> Ajouter une tâche
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <Trash2 size={16} /> Projet perdu
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Tabs Navigation (Top Ribbon style) */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex gap-10">
              {mainTabs.map((tab) => (
                <button 
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 pb-4 text-[14px] font-bold transition-all relative ${activeTab === tab.key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full animate-in fade-in" />
                  )}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all">
              <FileText size={16} className="text-gray-400" /> Résumé des informations
            </button>
          </div>
        </div>

        {/* Dynamic Sub-Navigation Menu */}
        {activeTab === 'Etude client' && (
          <div className="bg-white border-b border-gray-100 px-8 flex gap-12 shrink-0 z-10 sticky top-0">
            {subTabs.map((sub) => (
              <button 
                key={sub}
                onClick={() => setActiveSubTab(sub)}
                className={`py-4 text-[14px] font-bold transition-all relative ${
                  activeSubTab === sub 
                  ? 'text-gray-900' 
                  : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                {sub}
                {activeSubTab === sub && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 rounded-t-full animate-in slide-in-from-bottom-1" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-8 space-y-6 flex-1 bg-[#F9FAFB]">
          
          {activeTab === 'Etude client' && activeSubTab === 'Découverte' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Attribution */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="text-[15px] font-bold text-gray-900">Attribution</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Agence</label>
                    <div className="relative">
                      <div className="w-full bg-[#FBFBFB] border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 flex items-center justify-between">
                        {companyName}
                        <Check size={16} className="text-green-500" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Agenceur référent</label>
                    <div className="relative">
                      <div className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3">
                        <img src={project.agenceur?.avatar || 'https://i.pravatar.cc/150?u=fallback'} className="w-6 h-6 rounded-full border border-gray-50 shadow-sm" alt="" />
                        <span className="text-sm font-bold text-gray-900">{project.agenceur?.name}</span>
                        <ChevronDown size={18} className="ml-auto text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Origine du Projet */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="text-[15px] font-bold text-gray-900">Origine du Projet</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Origine du projet</label>
                    <div className="relative">
                      <select value={project.origine || ''} onChange={(e) => handleUpdate('origine', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none">
                        <option value="">Sélectionner</option>
                        <option>Relation</option><option>Web</option><option>Parrainage</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Sous origine</label>
                    <div className="relative">
                      <select value={project.sousOrigine || ''} onChange={(e) => handleUpdate('sousOrigine', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none">
                        <option value="">Choisir</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Nom</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none">
                        <option>Choisir</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Lien parrain</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none">
                        <option>Choisir</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Projet */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-6 shadow-sm">
                <h3 className="text-[15px] font-bold text-gray-900">Projet</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Adresse chantier</label>
                    <div className="w-full bg-[#FBFBFB] border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 truncate">
                      {project.details?.adresseChantier || 'Sélectionner'}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Adresse facturation</label>
                    <div className="space-y-3">
                      <div className="relative">
                        <select 
                          value={project.details?.billingAddressType || 'Main'} 
                          onChange={(e) => handleUpdate('details.billingAddressType', e.target.value)}
                          className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none"
                        >
                          <option value="Main">Même adresse que l'adresse principale</option>
                          <option value="Other">Autre adresse</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                      {project.details?.billingAddressType === 'Other' && (
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                          <input 
                            type="text" 
                            placeholder="Rechercher une adresse de facturation..."
                            value={billingAddressSearch || project.details?.billingAddress || ''}
                            onChange={(e) => {
                              setBillingAddressSearch(e.target.value);
                              handleUpdate('details.billingAddress', e.target.value);
                            }}
                            className="w-full bg-[#FBFBFB] border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-bold text-gray-900 outline-none"
                          />
                          {isSearchingAddress && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-300" size={16} />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Métier de l'étude</label>
                    <div className="relative">
                      <select value={project.metier} onChange={(e) => handleUpdate('metier', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none">
                        <option>Sélectionner</option><option>Cuisiniste</option><option>Bainiste</option><option>Dressing</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Exécution des travaux</label>
                    <div className="relative">
                      <select value={project.details?.execution || ''} onChange={(e) => handleUpdate('details.execution', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none">
                        <option value="">Sélectionner</option>
                        <option>Xora Pilotage</option>
                        <option>Client direct</option>
                        <option>Architecte</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Artisan.s nécessaire.s</label>
                    <div className="pt-2"><CustomToggle value={project.details?.artisansNeeded} onChange={(v) => handleUpdate('details.artisansNeeded', v)} /></div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Artisan.s</label>
                    <div className="relative">
                      <select disabled={!project.details?.artisansNeeded} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none disabled:bg-gray-50 disabled:text-gray-300">
                        <option>Sélectionner</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Date Prévisionnelle Signature</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={project.details?.dateSignature || ''} 
                        onChange={(e) => handleUpdate('details.dateSignature', e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none" 
                      />
                      <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Dates prévisionnelles chantier</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={project.details?.dateChantier || ''} 
                        onChange={(e) => handleUpdate('details.dateChantier', e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none" 
                      />
                      <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">Date installation cuisine</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={project.details?.dateInstallation || ''} 
                        onChange={(e) => handleUpdate('details.dateInstallation', e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none" 
                      />
                      <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enveloppe financière */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-[15px] font-bold text-gray-900">Enveloppe financière</h3>
                  <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50">
                    <StickyNote size={14} /> Ajouter une note
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Fourchette basse Budget</label>
                    <div className="relative">
                      <input type="number" placeholder="0" value={project.details?.budgetLow || ''} onChange={(e) => handleUpdate('details.budgetLow', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-gray-900 outline-none" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">€</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Fourchette haute Budget</label>
                    <div className="relative">
                      <input type="number" placeholder="0" value={project.details?.budgetHigh || ''} onChange={(e) => handleUpdate('details.budgetHigh', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-gray-900 outline-none" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">€</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Budget global du chantier</label>
                    <div className="relative">
                      <input type="number" placeholder="0" value={project.details?.budgetGlobal || ''} onChange={(e) => handleUpdate('details.budgetGlobal', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-gray-900 outline-none" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">€</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Financement du projet</label>
                    <div className="relative">
                      <select value={project.details?.financementType || 'Inconnu'} onChange={(e) => handleUpdate('details.financementType', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none">
                        <option>Financement</option><option>Comptant</option><option>Inconnu</option><option>Autre</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  {project.details?.financementType === 'Financement' && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2">
                      <label className="text-[11px] font-medium text-gray-400">Organisme financement</label>
                      <div className="relative">
                        <select value={project.details?.financementOrganism || ''} onChange={(e) => handleUpdate('details.financementOrganism', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none">
                          <option value="">Sélectionner</option><option>Sofinco</option><option>Cetelem</option><option>Banque Populaire</option><option>Autre</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Installation */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-6 shadow-sm">
                <h3 className="text-[15px] font-bold text-gray-900">Installation</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Dépose</label>
                    <div className="relative">
                      <select value={project.details?.deposeBy || ''} onChange={(e) => handleUpdate('details.deposeBy', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none">
                        <option value="">Sélectionner</option><option>{companyName}</option><option>Client</option><option>Autre professionnel</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Installation</label>
                    <div className="relative">
                      <select value={project.details?.installBy || ''} onChange={(e) => handleUpdate('details.installBy', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none">
                        <option value="">Sélectionner</option><option>{companyName}</option><option>Client</option><option>Autre professionnel</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Livraison à charge de</label>
                    <div className="relative">
                      <select value={project.details?.deliveryBy || ''} onChange={(e) => handleUpdate('details.deliveryBy', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none">
                        <option value="">Sélectionner</option><option>{companyName}</option><option>Client</option><option>Autre professionnel</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-400">Plans techniques</label>
                  <div className="pt-2"><CustomToggle value={project.details?.plansTechniques} onChange={(v) => handleUpdate('details.plansTechniques', v)} /></div>
                  {project.details?.plansTechniques && (
                    <div className="mt-4 animate-in zoom-in-95 duration-200">
                      <button className="flex items-center gap-3 px-5 py-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all"><Upload size={18} /> Import des plans techniques</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Concurrence */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-6 shadow-sm">
                <h3 className="text-[15px] font-bold text-gray-900">Concurrence</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Nombre de confrères consultés</label>
                    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
                      <div className="px-3 py-1.5 text-sm font-bold text-gray-400 flex-1">{project.details?.nbConfreres || 0} Confrères</div>
                      <div className="flex gap-1 pr-1">
                        <button onClick={() => handleUpdate('details.nbConfreres', Math.max(0, (project.details?.nbConfreres || 0) - 1))} className="p-1 bg-gray-400 text-white rounded"><Minus size={14} /></button>
                        <button onClick={() => handleUpdate('details.nbConfreres', (project.details?.nbConfreres || 0) + 1)} className="p-1 bg-gray-400 text-white rounded"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Confrères</label>
                    <input type="text" placeholder="Ex: Mobalpa, Schmidt..." value={project.details?.confreres || ''} onChange={(e) => handleUpdate('details.confreres', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Budget</label>
                    <div className="relative flex items-center">
                      <input type="number" value={project.details?.budgetConcurrence || ''} onChange={(e) => handleUpdate('details.budgetConcurrence', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none" />
                      <span className="absolute right-4 text-gray-900 font-bold">€</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Statut des projets</label>
                    <div className="relative">
                      <select value={project.details?.concurrenceStatus || ''} onChange={(e) => handleUpdate('details.concurrenceStatus', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none">
                        <option value="">Sélectionner</option><option>En cours d'étude</option><option>Xora favori</option><option>Hésitant</option><option>Perdu (Prix trop haut)</option><option>Perdu (Technique)</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Permis de construire */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-6 shadow-sm">
                <h3 className="text-[15px] font-bold text-gray-900">Permis de construire</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-400">Permis de construire accordé</label>
                    <div className="pt-2"><CustomToggle value={project.details?.permisConstruire} onChange={(v) => handleUpdate('details.permisConstruire', v)} /></div>
                  </div>
                  {project.details?.permisConstruire && (
                    <div className="space-y-1.5 animate-in slide-in-from-left-2">
                      <label className="text-[11px] font-medium text-gray-400">Date d'obtention Permis</label>
                      <div className="relative">
                        <input type="date" value={project.details?.datePermis || ''} onChange={(e) => handleUpdate('details.datePermis', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none" />
                        <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'Etude client' && activeSubTab === 'Découverte cuisine' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* Third Level Menu (Kitchen specific) - Full Width */}
              <div className="bg-[#f0f2f5] p-1 rounded-full flex gap-1 w-full">
                {kitchenTabs.map((kt) => {
                  const isActive = activeKitchenTab === kt.id;
                  return (
                    <button
                      key={kt.id}
                      onClick={() => setActiveKitchenTab(kt.id)}
                      className={`flex-1 px-8 py-2.5 rounded-full text-[13px] font-bold transition-all flex items-center justify-center gap-3 ${
                        isActive 
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-100' 
                        : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {kt.label}
                      {kt.icon === 'file' ? (
                        <File size={14} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
                      ) : (
                        !isActive && (
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-100">
                            <Plus size={12} className="text-gray-400" />
                          </div>
                        )
                      )}
                    </button>
                  );
                })}
              </div>

              {activeKitchenTab === 'Ambiance' && (
                <div className="space-y-6">
                  {/* Ambiance */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 shadow-sm">
                    <h3 className="text-[15px] font-bold text-gray-900">Ambiance</h3>
                    <div className="space-y-4">
                      <label className="text-[11px] font-bold text-gray-400">Ambiance.s recherchée.s (Selection multiple)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {ambianceOptions.map((opt) => {
                          const isSelected = (project.details?.kitchen?.ambianceSelection || []).includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              onClick={() => toggleAmbiance(opt.id)}
                              className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all ${
                                isSelected 
                                ? 'bg-[#1A1C23] border-[#1A1C23] text-white shadow-lg transform scale-105' 
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
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400">Ambiance appréciée</label>
                        <textarea 
                          placeholder="Écrire un commentaire"
                          value={project.details?.kitchen?.ambianceAppreciee || ''}
                          onChange={(e) => handleUpdate('details.kitchen.ambianceAppreciee', e.target.value)}
                          className="w-full h-32 bg-white border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 outline-none focus:border-gray-900 transition-all resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400">Ambiance à éviter</label>
                        <textarea 
                          placeholder="Écrire un commentaire"
                          value={project.details?.kitchen?.ambianceAEviter || ''}
                          onChange={(e) => handleUpdate('details.kitchen.ambianceAEviter', e.target.value)}
                          className="w-full h-32 bg-white border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 outline-none focus:border-gray-900 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modèle final */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 shadow-sm">
                    <h3 className="text-[15px] font-bold text-gray-900">Modèle final (Présentation client)</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400">Mobilier</label>
                        <textarea 
                          placeholder="Écrire un commentaire"
                          value={project.details?.kitchen?.modeleMobilier || ''}
                          onChange={(e) => handleUpdate('details.kitchen.modeleMobilier', e.target.value)}
                          className="w-full h-28 bg-white border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 outline-none focus:border-gray-900 transition-all resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400">Poignées</label>
                        <textarea 
                          placeholder="Écrire un commentaire"
                          value={project.details?.kitchen?.modelePoignees || ''}
                          onChange={(e) => handleUpdate('details.kitchen.modelePoignees', e.target.value)}
                          className="w-full h-28 bg-white border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 outline-none focus:border-gray-900 transition-all resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400">Plan de travail</label>
                        <textarea 
                          placeholder="Écrire un commentaire"
                          value={project.details?.kitchen?.modelePlanTravail || ''}
                          onChange={(e) => handleUpdate('details.kitchen.modelePlanTravail', e.target.value)}
                          className="w-full h-28 bg-white border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 outline-none focus:border-gray-900 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Matériaux client conservés */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 shadow-sm">
                    <h3 className="text-[15px] font-bold text-gray-900">Matériaux client conservés</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400">Sol cuisine</label>
                        <textarea 
                          placeholder="Écrire un commentaire"
                          value={project.details?.kitchen?.matSol || ''}
                          onChange={(e) => handleUpdate('details.kitchen.matSol', e.target.value)}
                          className="w-full h-28 bg-white border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 outline-none focus:border-gray-900 transition-all resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400">Mur cuisine</label>
                        <textarea 
                          placeholder="Écrire un commentaire"
                          value={project.details?.kitchen?.matMur || ''}
                          onChange={(e) => handleUpdate('details.kitchen.matMur', e.target.value)}
                          className="w-full h-28 bg-white border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 outline-none focus:border-gray-900 transition-all resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400">Autre.s</label>
                        <textarea 
                          placeholder="Écrire un commentaire"
                          value={project.details?.kitchen?.matAutre || ''}
                          onChange={(e) => handleUpdate('details.kitchen.matAutre', e.target.value)}
                          className="w-full h-28 bg-white border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 outline-none focus:border-gray-900 transition-all resize-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      <div className="md:col-span-4 space-y-2">
                        <label className="text-[11px] font-bold text-gray-400">Sélection Mobilier</label>
                        <div className="relative">
                          <select 
                            value={project.details?.kitchen?.selectionMobilier || ''} 
                            onChange={(e) => handleUpdate('details.kitchen.selectionMobilier', e.target.value)}
                            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm font-bold text-gray-400 outline-none"
                          >
                            <option value="">Sélectionner</option>
                            <option>Bois</option><option>Laqué</option><option>Mat</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                      <div className="md:col-span-8 space-y-2">
                        <label className="text-[11px] font-bold text-gray-400">Description (Sol, mur, déco, etc...)</label>
                        <textarea 
                          placeholder="Écrire un commentaire"
                          value={project.details?.kitchen?.descriptionGenerale || ''}
                          onChange={(e) => handleUpdate('details.kitchen.descriptionGenerale', e.target.value)}
                          className="w-full h-32 bg-white border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 outline-none focus:border-gray-900 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeKitchenTab === 'Meubles' && (
                <div className="space-y-6">
                  {/* Rangements */}
                  <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-[15px] font-bold text-gray-900">Rangements</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Volume de rangement actuel</label>
                        <input type="text" placeholder="Saisir" value={project.details?.kitchen?.volumeActuel || ''} onChange={(e) => handleUpdate('details.kitchen.volumeActuel', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Volume de rangement souhaité</label>
                        <input type="text" placeholder="Saisir" value={project.details?.kitchen?.volumeSouhaite || ''} onChange={(e) => handleUpdate('details.kitchen.volumeSouhaite', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Accessoire de meuble */}
                  <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-[15px] font-bold text-gray-900">Accessoire de meuble</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Sélectionner les accessoires</label>
                        <div className="relative">
                          <select value={project.details?.kitchen?.accessoiresSelection || ''} onChange={(e) => handleUpdate('details.kitchen.accessoiresSelection', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none">
                            <option value="">Sélectionner</option>
                            <option>Tiroirs à l'anglaise</option><option>Range-couverts</option><option>Accessoire d'angle</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Commentaire</label>
                        <input type="text" placeholder="Saisir" value={project.details?.kitchen?.accessoiresCommentaire || ''} onChange={(e) => handleUpdate('details.kitchen.accessoiresCommentaire', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Éclairages */}
                  <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-[15px] font-bold text-gray-900">Éclairages</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Luminosité pièce</label>
                        <div className="relative">
                          <select value={project.details?.kitchen?.luminositePiece || ''} onChange={(e) => handleUpdate('details.kitchen.luminositePiece', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none">
                            <option value="">Sélectionner</option>
                            <option>Sombre</option><option>Lumineux</option><option>Très lumineux</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Température de l'éclairage</label>
                        <div className="relative">
                          <select value={project.details?.kitchen?.tempEclairage || ''} onChange={(e) => handleUpdate('details.kitchen.tempEclairage', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none">
                            <option value="">Sélectionner</option>
                            <option>Chaud</option><option>Froid</option><option>Neutre</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-400">Description de l'éclairage</label>
                      <textarea placeholder="Écrire un commentaire" value={project.details?.kitchen?.descEclairage || ''} onChange={(e) => handleUpdate('details.kitchen.descEclairage', e.target.value)} className="w-full h-24 bg-white border border-gray-100 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none resize-none" />
                    </div>
                  </div>

                  {/* Plan de dépose */}
                  <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-[15px] font-bold text-gray-900">Plan de dépose</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Appareil.s à poser</label>
                        <div className="relative">
                          <select value={project.details?.kitchen?.appareilsAPoser || ''} onChange={(e) => handleUpdate('details.kitchen.appareilsAPoser', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none">
                            <option value="">Sélectionner</option>
                            <option>Plaque</option><option>Evier</option><option>Les deux</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Longueur à prévoir</label>
                        <div className="relative">
                          <select value={project.details?.kitchen?.longueurDepose || ''} onChange={(e) => handleUpdate('details.kitchen.longueurDepose', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none">
                            <option value="">Sélectionner</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-gray-400">Description</label>
                      <textarea placeholder="Écrire un commentaire" value={project.details?.kitchen?.descDepose || ''} onChange={(e) => handleUpdate('details.kitchen.descDepose', e.target.value)} className="w-full h-24 bg-white border border-gray-100 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none resize-none" />
                    </div>
                  </div>

                  {/* Plan de préparation */}
                  <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-[15px] font-bold text-gray-900">Plan de préparation</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Longueur à prévoir</label>
                        <div className="relative">
                          <input type="number" placeholder="" value={project.details?.kitchen?.longueurPrepa || ''} onChange={(e) => handleUpdate('details.kitchen.longueurPrepa', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">mm</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Description gestion des déchets</label>
                        <textarea placeholder="Écrire un commentaire" value={project.details?.kitchen?.descDechetsPrepa || ''} onChange={(e) => handleUpdate('details.kitchen.descDechetsPrepa', e.target.value)} className="w-full h-24 bg-white border border-gray-100 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none resize-none" />
                      </div>
                    </div>
                  </div>

                  {/* Plan de travail */}
                  <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-[15px] font-bold text-gray-900">Plan de travail</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Hauteur actuelle</label>
                        <div className="relative">
                          <input type="number" value={project.details?.kitchen?.hauteurActuelle || ''} onChange={(e) => handleUpdate('details.kitchen.hauteurActuelle', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">mm</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Hauteur souhaitée</label>
                        <div className="relative">
                          <input type="number" value={project.details?.kitchen?.hauteurSouhaitee || ''} onChange={(e) => handleUpdate('details.kitchen.hauteurSouhaitee', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">mm</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Espace repas</label>
                        <div className="relative">
                          <select value={project.details?.kitchen?.espaceRepas || ''} onChange={(e) => handleUpdate('details.kitchen.espaceRepas', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none">
                            <option value="">Sélectionner</option>
                            <option>Table</option><option>Bar</option><option>Ilot</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Usage Cuisine */}
                  <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-6 shadow-sm">
                    <h3 className="text-[15px] font-bold text-gray-900">Usage Cuisine</h3>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[11px] font-medium text-gray-400">Personnes partageant le repas quotidiennement</label>
                        <div className="grid grid-cols-2 gap-4">
                          <Counter label="Adultes" value={project.details?.kitchen?.usageQuotidienAdultes} onChange={(v) => handleUpdate('details.kitchen.usageQuotidienAdultes', v)} />
                          <Counter label="Enfants" value={project.details?.kitchen?.usageQuotidienEnfants} onChange={(v) => handleUpdate('details.kitchen.usageQuotidienEnfants', v)} />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-medium text-gray-400">Personnes partageant le repas exceptionnellement</label>
                        <div className="grid grid-cols-2 gap-4">
                          <Counter label="Adultes" value={project.details?.kitchen?.usageExceptionnelAdultes} onChange={(v) => handleUpdate('details.kitchen.usageExceptionnelAdultes', v)} />
                          <Counter label="Enfants" value={project.details?.kitchen?.usageExceptionnelEnfants} onChange={(v) => handleUpdate('details.kitchen.usageExceptionnelEnfants', v)} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Objectif.s nouvelle cuisine (Selection multiple)</label>
                        <div className="relative">
                          <select value={project.details?.kitchen?.objectifs || ''} onChange={(e) => handleUpdate('details.kitchen.objectifs', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none">
                            <option value="">Sélectionner</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Description gestion des déchets</label>
                        <textarea placeholder="Écrire un commentaire" value={project.details?.kitchen?.descDechetsUsage || ''} onChange={(e) => handleUpdate('details.kitchen.descDechetsUsage', e.target.value)} className="w-full h-24 bg-white border border-gray-100 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none resize-none" />
                      </div>
                    </div>
                  </div>

                  {/* Type de rangements */}
                  <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-6 shadow-sm">
                    <h3 className="text-[15px] font-bold text-gray-900">Type de rangements</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-gray-400">Meubles bas (Selection multiple)</label>
                          <div className="relative">
                            <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none"><option value="">Sélectionner</option></select>
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-gray-400">Description meubles bas</label>
                          <textarea placeholder="Écrire un commentaire" className="w-full h-24 bg-white border border-gray-100 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none resize-none" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-gray-400">Meubles hauts (Selection multiple)</label>
                          <div className="relative">
                            <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none"><option value="">Sélectionner</option></select>
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-gray-400">Description meubles hauts</label>
                          <textarea placeholder="Écrire un commentaire" className="w-full h-24 bg-white border border-gray-100 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none resize-none" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-gray-400">Colonnes (Selection multiple)</label>
                          <div className="relative">
                            <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none"><option value="">Sélectionner</option></select>
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-gray-400">Description colonnes</label>
                          <textarea placeholder="Écrire un commentaire" className="w-full h-24 bg-white border border-gray-100 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none resize-none" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Gestion des déchets</label>
                        <div className="relative">
                          <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-400 outline-none"><option value="">Sélectionner</option></select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400">Description gestion des déchets</label>
                        <textarea placeholder="Écrire un commentaire" className="w-full h-32 bg-white border border-gray-100 rounded-xl p-4 text-sm font-bold text-gray-900 outline-none resize-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activeKitchenTab !== 'Ambiance' && activeKitchenTab !== 'Meubles') && (
                <div className="h-64 flex flex-col items-center justify-center text-center p-12 bg-white border border-gray-100 rounded-3xl animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                    <Plus size={32} />
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-800 mb-1">Section {activeKitchenTab}</h3>
                  <p className="text-[12px] text-gray-400">Détails techniques de la partie {activeKitchenTab.toLowerCase()}.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Etude client' && (activeSubTab !== 'Découverte' && activeSubTab !== 'Découverte cuisine') && (
            <div className="h-96 flex flex-col items-center justify-center text-center p-12 bg-white border border-gray-100 rounded-3xl animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
                <Plus size={40} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Section {activeSubTab}</h3>
              <p className="text-sm text-gray-400 max-w-sm">Cet espace est prêt à recevoir vos plans, présentations et documents relatifs à cette phase du projet.</p>
            </div>
          )}

          <div className="pb-20" />
        </div>
      </div>

      {/* Right Sidebar Monitoring */}
      <div className="w-24 bg-white border-l border-gray-100 flex flex-col items-center py-10 gap-8 shrink-0 relative shadow-lg">
        <button className="p-4 text-gray-400 hover:text-gray-900 transition-all"><ChevronRight size={24} className="rotate-180" /></button>
        <div className="w-12 h-px bg-gray-50"></div>
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <ProgressCircle progress={project.progress || 2} color="#D946EF" size="w-8 h-8" />
            <span className="text-[10px] font-bold text-gray-900">{project.progress || 2}%</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-40">
            <ProgressCircle progress={0} color="#3B82F6" size="w-8 h-8" />
            <span className="text-[10px] font-bold text-blue-500">0%</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-20">
            <ProgressCircle progress={0} color="#F97316" size="w-8 h-8" />
            <span className="text-[10px] font-bold text-orange-500">0%</span>
          </div>
        </div>
        <div className="mt-auto flex flex-col items-center gap-4">
          <button className="p-4 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"><Mail size={22} /></button>
          <button className="p-4 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"><MessageSquare size={22} /></button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
