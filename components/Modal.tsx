
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, ChevronDown, Plus, Loader2, MapPin, Search, Check } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, userProfile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [addressSearch, setAddressSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    civility: 'Mme',
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    lat: null as number | null,
    lng: null as number | null,
    complement: '',
    category: '', 
    origin: '',   
    subOrigin: '', 
    referent: userProfile?.name || '',
    rgpd: false
  });

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        referent: userProfile?.name || '',
        lastName: '',
        firstName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postcode: '',
        lat: null,
        lng: null,
        complement: '',
        category: '',
        origin: '',
        subOrigin: '',
        rgpd: false
      }));
      setAddressSearch('');
    }
  }, [isOpen, userProfile]);

  // BAN API logic
  useEffect(() => {
    const fetchAddresses = async () => {
      if (addressSearch.length < 4) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(addressSearch)}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error("Erreur API Adresse:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchAddresses, 300);
    return () => clearTimeout(timer);
  }, [addressSearch]);

  // Logic pour la cascade d'origines
  const categories = useMemo(() => Object.keys(HIERARCHY_DATA), []);
  const origins = useMemo(() => formData.category ? Object.keys(HIERARCHY_DATA[formData.category] || {}) : [], [formData.category]);
  const subOrigins = useMemo(() => (formData.category && formData.origin) ? (HIERARCHY_DATA[formData.category]?.[formData.origin] || []) : [], [formData.category, formData.origin]);

  const handleSelectAddress = (feature: any) => {
    const props = feature.properties;
    const [lng, lat] = feature.geometry.coordinates;

    // props.label contient le numéro de voie complet
    setFormData({
      ...formData,
      address: props.label, 
      city: props.city,
      postcode: props.postcode,
      lat: lat,
      lng: lng
    });
    setAddressSearch(props.label);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const companyId = userProfile?.companyId;
    if (!companyId) {
      alert("Erreur : Impossible de lier ce client à votre société.");
      return;
    }
    
    setIsLoading(true);
    try {
      const newClient = {
        name: `${formData.firstName} ${formData.lastName}`.toUpperCase().trim(),
        addedBy: {
          uid: userProfile.uid,
          name: userProfile.name,
          avatar: userProfile.avatar
        },
        origin: formData.origin, // Niveau 2 de la hiérarchie
        location: formData.city || 'Non renseignée',
        status: 'Leads', 
        dateAdded: new Date().toLocaleDateString('fr-FR'),
        companyId: companyId,
        details: {
          ...formData,
          createdAt: new Date().toISOString()
        },
        projectCount: 0
      };

      await addDoc(collection(db, 'clients'), newClient);
      onClose();
    } catch (error) {
      console.error("Erreur creation client:", error);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-30">
              <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 shadow-sm text-gray-800">
                       <Plus size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Créer une fiche contact</h2>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Société : {userProfile?.companyName || 'Chargement...'}</p>
                  </div>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                  <X size={20} />
              </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
              
              {/* Identité */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-3">
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Civilité client*</label>
                      <div className="relative">
                          <select 
                            value={formData.civility}
                            onChange={(e) => setFormData({...formData, civility: e.target.value})}
                            className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-900 transition-all"
                          >
                              <option>Mme</option>
                              <option>M.</option>
                          </select>
                           <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
                      </div>
                  </div>
                  <div className="md:col-span-4">
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Nom du contact*</label>
                      <input 
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        type="text" 
                        placeholder="Ex: DUBOIS" 
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-900 transition-all" 
                      />
                  </div>
                  <div className="md:col-span-5">
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Prénom du contact*</label>
                      <input 
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        type="text" 
                        placeholder="Ex: Chloé" 
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-900 transition-all" 
                      />
                  </div>
              </div>

              {/* Coordonnées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Email professionnel</label>
                      <input 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        type="email" 
                        placeholder="nom@exemple.com" 
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-900 transition-all placeholder:text-gray-300" 
                      />
                  </div>
                  <div>
                       <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Téléphone portable</label>
                       <div className="flex">
                          <div className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-gray-800">
                              <span className="text-lg mr-1">🇫🇷</span>
                              <ChevronDown size={14} className="text-gray-300" />
                          </div>
                          <input 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            type="text" 
                            placeholder="06 12 34 56 78" 
                            className="flex-1 bg-white border border-gray-200 rounded-r-xl py-3 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-900 transition-all placeholder:text-gray-300" 
                          />
                       </div>
                  </div>
              </div>

              {/* Adresse */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative" ref={searchRef}>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Adresse du bien*</label>
                      <div className="relative group">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-indigo-500' : 'text-gray-300 group-focus-within:text-gray-900'}`} size={18} />
                        <input 
                          required
                          value={addressSearch}
                          onChange={(e) => {
                            setAddressSearch(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          type="text" 
                          placeholder="Ex: 7 rue de Provence..." 
                          className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:border-gray-900 transition-all placeholder:text-gray-300" 
                        />
                        {isSearching && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 size={16} className="animate-spin text-indigo-500" />
                          </div>
                        )}
                      </div>

                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-200">
                          {suggestions.map((feature: any) => (
                            <button
                              key={feature.properties.id}
                              type="button"
                              onClick={() => handleSelectAddress(feature)}
                              className="w-full px-5 py-4 text-left hover:bg-indigo-50/50 flex items-start gap-4 border-b border-gray-50 last:border-0 group transition-all"
                            >
                              <div className="mt-1 p-1.5 bg-gray-50 rounded-lg text-gray-300 group-hover:text-indigo-600 group-hover:bg-white transition-all">
                                <MapPin size={16} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-gray-900">{feature.properties.label}</span>
                                <span className="text-[11px] text-gray-400 font-medium">{feature.properties.postcode} {feature.properties.city}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                  <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Complément d'adresse</label>
                      <input 
                        value={formData.complement}
                        onChange={(e) => setFormData({...formData, complement: e.target.value})}
                        type="text" 
                        placeholder="Appartement, Étage, Bâtiment..." 
                        className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-900 transition-all placeholder:text-gray-300" 
                      />
                  </div>
              </div>

              {/* Origine hiérarchique */}
              <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">Origine du contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                      <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Catégorie*</label>
                          <div className="relative">
                              <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value, origin: '', subOrigin: ''})}
                                className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                              >
                                  <option value="">Sélectionner</option>
                                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={14} />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Origine*</label>
                          <div className="relative">
                              <select 
                                disabled={!formData.category}
                                value={formData.origin}
                                onChange={(e) => setFormData({...formData, origin: e.target.value, subOrigin: ''})}
                                className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-indigo-500 transition-all shadow-sm disabled:opacity-50 disabled:bg-gray-100"
                              >
                                  <option value="">Sélectionner</option>
                                  {origins.map(orig => <option key={orig} value={orig}>{orig}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={14} />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Sous-origine</label>
                          <div className="relative">
                              <select 
                                disabled={!formData.origin}
                                value={formData.subOrigin}
                                onChange={(e) => setFormData({...formData, subOrigin: e.target.value})}
                                className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-indigo-500 transition-all shadow-sm disabled:opacity-50 disabled:bg-gray-100"
                              >
                                  <option value="">Sélectionner</option>
                                  {subOrigins.map(so => <option key={so} value={so}>{so}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={14} />
                          </div>
                      </div>
                  </div>
              </div>

              {/* Agenceur référent */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Agenceur référant*</label>
                      <div className="relative">
                          <div className="w-full bg-white border border-gray-100 rounded-xl py-2.5 px-4 text-sm text-gray-800 flex items-center shadow-sm">
                              <img src={userProfile?.avatar} alt="" className="w-7 h-7 rounded-full mr-3 border border-white shadow-sm" />
                              <span className="font-bold">{userProfile?.name}</span>
                              <div className="ml-auto flex items-center gap-1">
                                <Check size={14} className="text-green-500" />
                                <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter">Attribué</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* RGPD */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Consentement RGPD</p>
                      <p className="text-[10px] text-gray-400 font-medium italic mt-0.5">Obligatoire pour les communications marketing</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className={`text-sm font-bold transition-colors ${!formData.rgpd ? 'text-gray-900' : 'text-gray-300'}`}>Non</span>
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, rgpd: !formData.rgpd})}
                            className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-sm ${formData.rgpd ? 'bg-indigo-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-md ${formData.rgpd ? 'right-1' : 'left-1'}`}></div>
                        </button>
                        <span className={`text-sm font-bold transition-colors ${formData.rgpd ? 'text-gray-900' : 'text-gray-300'}`}>Oui</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                    En cochant "Oui", le client accepte que ses données personnelles soient traitées pour la gestion de son projet et l'envoi de communications commerciales XORA.
                  </p>
              </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-gray-100 flex justify-center bg-[#FBFBFB]">
              <button 
                type="submit"
                disabled={isLoading || !formData.lastName || !formData.firstName || !addressSearch || !formData.category || !formData.origin || !userProfile?.companyId}
                className="flex items-center space-x-3 px-12 py-4 bg-gray-900 text-white rounded-2xl text-[15px] font-bold shadow-2xl shadow-gray-200 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  )}
                  <span>{isLoading ? 'Enregistrement en cours...' : 'Créer la fiche contact'}</span>
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
