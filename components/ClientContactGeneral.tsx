
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, ChevronUp, Plus, Search, MapPin, Loader2, X, Check, Navigation, User, Phone, Mail } from 'lucide-react';
import { Client } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot, collection, query, where } from 'firebase/firestore';

// Structure de données hiérarchique
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

interface ClientContactGeneralProps {
  client: Client;
}

const ClientContactGeneral: React.FC<ClientContactGeneralProps> = ({ client: initialClient }) => {
  const [client, setClient] = useState<Client>(initialClient);
  const [isContactExpanded, setIsContactExpanded] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressSearch, setAddressSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // États pour les coordonnées éditables (local state pour fluidité)
  const [contactData, setContactData] = useState({
    civility: '',
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
    fixed: ''
  });

  // États pour le parrainage
  const [allClients, setAllClients] = useState<any[]>([]);
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [showSponsorDropdown, setShowSponsorDropdown] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const sponsorRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Écouter les mises à jour du client en temps réel et synchroniser l'état local
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'clients', initialClient.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setClient({ id: docSnap.id, ...data } as Client);
        
        // On ne met à jour l'état local que si l'utilisateur n'est pas en train d'écrire (optionnel, mais ici on simplifie)
        const details = data.details || {};
        const nameParts = data.name ? data.name.split(' ') : ['', ''];
        
        setContactData({
          civility: details.civility || 'Mme',
          lastName: details.lastName || nameParts.slice(1).join(' ') || '',
          firstName: details.firstName || nameParts[0] || '',
          email: details.email || '',
          phone: details.phone || '',
          fixed: details.fixed || ''
        });
      }
    });
    return () => unsub();
  }, [initialClient.id]);

  // Charger les autres clients pour la recherche de parrain
  useEffect(() => {
    if (!client.companyId) return;
    const q = query(collection(db, 'clients'), where('companyId', '==', client.companyId));
    const unsub = onSnapshot(q, (snap) => {
      setAllClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [client.companyId]);

  // Handlers pour la sauvegarde Firestore
  const saveContactField = async (field: string, value: any) => {
    try {
      const clientRef = doc(db, 'clients', client.id);
      const updates: any = { [`details.${field}`]: value };
      
      // Si on change le nom ou le prénom, on met à jour le champ "name" global
      if (field === 'firstName' || field === 'lastName') {
        const newFirstName = field === 'firstName' ? value : contactData.firstName;
        const newLastName = field === 'lastName' ? value : contactData.lastName;
        updates.name = `${newFirstName} ${newLastName}`.toUpperCase().trim();
      }
      
      await updateDoc(clientRef, updates);
    } catch (e) {
      console.error("Erreur lors de la sauvegarde :", e);
    }
  };

  // BAN Address logic...
  useEffect(() => {
    const fetchAddresses = async () => {
      if (addressSearch.length < 4) { setSuggestions([]); return; }
      setIsSearching(true);
      try {
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(addressSearch)}&limit=5`);
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) { console.error(error); } finally { setIsSearching(false); }
    };
    const timer = setTimeout(fetchAddresses, 300);
    return () => clearTimeout(timer);
  }, [addressSearch]);

  const handleSelectAddress = async (feature: any) => {
    const fullAddress = feature.properties.label;
    const city = feature.properties.city;
    const [longitude, latitude] = feature.geometry.coordinates;
    await updateDoc(doc(db, 'clients', client.id), {
      "details.address": fullAddress,
      "details.lat": latitude,
      "details.lng": longitude,
      "location": city
    });
    setIsEditingAddress(false);
    setAddressSearch('');
    setSuggestions([]);
  };

  // Map logic...
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current || isEditingAddress) return;
    const details = (client as any).details || {};
    const lat = details.lat;
    const lng = details.lng;
    if (lat && lng) {
      if (mapRef.current) mapRef.current.remove();
      const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([lat, lng], 15);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
      const color = client.status === 'Client' ? '#06b6d4' : client.status === 'Prospect' ? '#d946ef' : '#a855f7';
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7]
      });
      L.marker([lat, lng], { icon: customIcon }).addTo(map);
      mapRef.current = map;
    }
    return () => { if (mapRef.current) mapRef.current.remove(); mapRef.current = null; };
  }, [client.details?.lat, client.details?.lng, isEditingAddress, client.status]);

  // Hiérarchie d'origine
  const currentCategory = client.details?.category || '';
  const currentOrigin = client.origin || '';
  const currentSubOrigin = client.details?.subOrigin || '';

  const categories = useMemo(() => Object.keys(HIERARCHY_DATA), []);
  const origins = useMemo(() => currentCategory ? Object.keys(HIERARCHY_DATA[currentCategory] || {}) : [], [currentCategory]);
  const subOrigins = useMemo(() => (currentCategory && currentOrigin) ? (HIERARCHY_DATA[currentCategory]?.[currentOrigin] || []) : [], [currentCategory, currentOrigin]);

  const filteredSponsors = useMemo(() => {
    const search = sponsorSearch.trim().toLowerCase();
    if (!search || allClients.length === 0) return [];
    return allClients.filter(c => c.id !== client.id && c.name.toLowerCase().includes(search)).slice(0, 5);
  }, [sponsorSearch, allClients, client.id]);

  const handleCategoryChange = async (val: string) => {
    await updateDoc(doc(db, 'clients', client.id), { "details.category": val, "origin": "", "details.subOrigin": "" });
  };

  const handleOriginChange = async (val: string) => {
    const updates: any = { "origin": val, "details.subOrigin": "" };
    if (val !== 'Parrainage') {
      updates["details.sponsorId"] = null;
      updates["details.sponsorName"] = null;
    }
    await updateDoc(doc(db, 'clients', client.id), updates);
  };

  const handleSubOriginChange = async (val: string) => {
    await updateDoc(doc(db, 'clients', client.id), { "details.subOrigin": val });
  };

  return (
    <div className="space-y-6 max-w-full animate-in fade-in duration-500 pb-20">
      
      {/* Section Coordonnées */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[16px] font-bold text-gray-900">Coordonnées</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-50 transition-all">
            <Plus size={14} /> Ajouter un contact
          </button>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsContactExpanded(!isContactExpanded)}>
            <h4 className="text-sm font-bold text-gray-900">{client.name}</h4>
            <div className="p-1 hover:bg-gray-100 rounded">{isContactExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}</div>
          </div>
          {isContactExpanded && (
            <div className="p-6 space-y-6 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Civilité client</label>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:border-gray-900 transition-all" 
                      value={contactData.civility} 
                      onChange={(e) => {
                        setContactData({...contactData, civility: e.target.value});
                        saveContactField('civility', e.target.value);
                      }}
                    >
                      <option>Mme</option><option>M.</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Nom du client</label>
                  <input 
                    type="text" 
                    value={contactData.lastName} 
                    onChange={(e) => setContactData({...contactData, lastName: e.target.value})}
                    onBlur={(e) => saveContactField('lastName', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:border-gray-900 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Prénom client</label>
                  <input 
                    type="text" 
                    value={contactData.firstName} 
                    onChange={(e) => setContactData({...contactData, firstName: e.target.value})}
                    onBlur={(e) => saveContactField('firstName', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:border-gray-900 transition-all" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Email Client</label>
                  <input 
                    type="email" 
                    value={contactData.email} 
                    onChange={(e) => setContactData({...contactData, email: e.target.value})}
                    onBlur={(e) => saveContactField('email', e.target.value)}
                    placeholder="email@exemple.com" 
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:border-gray-900 transition-all placeholder:text-gray-300" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Téléphone portable</label>
                  <div className="flex">
                    <div className="flex items-center gap-1 px-3 border border-r-0 border-gray-200 rounded-l-lg bg-white">
                      <span className="text-sm">🇫🇷</span>
                      <ChevronDown size={12} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      value={contactData.phone} 
                      onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                      onBlur={(e) => saveContactField('phone', e.target.value)}
                      placeholder="06..." 
                      className="flex-1 bg-white border border-gray-200 rounded-r-lg px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:border-gray-900 transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Téléphone fixe</label>
                  <div className="flex">
                    <div className="flex items-center gap-1 px-3 border border-r-0 border-gray-200 rounded-l-lg bg-white">
                      <span className="text-sm">🇫🇷</span>
                      <ChevronDown size={12} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      value={contactData.fixed} 
                      onChange={(e) => setContactData({...contactData, fixed: e.target.value})}
                      onBlur={(e) => saveContactField('fixed', e.target.value)}
                      placeholder="04..." 
                      className="flex-1 bg-white border border-gray-200 rounded-r-lg px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:border-gray-900 transition-all" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Adresse + Map */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center"><h3 className="text-sm font-bold text-gray-900">Adresse du bien principal</h3>{isEditingAddress && <button onClick={() => setIsEditingAddress(false)} className="text-[11px] font-bold text-red-500 hover:underline">Annuler</button>}</div>
        {isEditingAddress ? (
          <div className="space-y-3 animate-in fade-in duration-300" ref={searchRef}>
            <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input autoFocus type="text" placeholder="Entrez l'adresse..." value={addressSearch} onChange={(e) => setAddressSearch(e.target.value)} className="w-full bg-[#FBFBFB] border border-gray-200 rounded-xl pl-12 pr-10 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-400 transition-all" />{isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={16} className="animate-spin text-gray-300" /></div>}</div>
            {suggestions.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-50">
                {suggestions.map((feature: any) => (<button key={feature.properties.id} type="button" onClick={() => handleSelectAddress(feature)} className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-start gap-4 border-b border-gray-50 last:border-0 group transition-all"><div className="mt-1 p-1.5 bg-gray-50 rounded-lg text-gray-300 group-hover:text-gray-900 group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all"><MapPin size={16} /></div><div className="flex flex-col"><span className="text-[13px] font-bold text-gray-900">{feature.properties.name}</span><span className="text-[11px] text-gray-400">{feature.properties.postcode} {feature.properties.city}</span></div></button>))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {client.details?.address ? (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 h-[220px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner relative"><div ref={mapContainerRef} className="w-full h-full z-0" /><div className="absolute top-3 left-3 z-10"><div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: client.status === 'Client' ? '#06b6d4' : client.status === 'Prospect' ? '#d946ef' : '#a855f7' }}></div><span className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">{client.status}</span></div></div></div>
                <div className="flex-1 space-y-4 py-2"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400"><MapPin size={24} /></div><div><h4 className="text-[15px] font-bold text-gray-900 leading-snug">{client.details.address}</h4>{client.details.complement && <p className="text-[12px] text-gray-400 mt-1">{client.details.complement}</p>}</div></div><div className="flex gap-2"><button onClick={() => setIsEditingAddress(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"><Plus size={14} /> Modifier</button></div></div>
              </div>
            ) : (
              <div onClick={() => setIsEditingAddress(true)} className="p-10 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50/50 hover:border-gray-200 transition-all group"><div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4 group-hover:scale-110 transition-transform"><MapPin size={32} /></div><p className="text-[13px] font-bold text-gray-900">Aucune adresse renseignée</p></div>
            )}
          </div>
        )}
      </div>

      {/* Section Origine client */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-gray-900">Origine client</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-gray-400">Catégorie</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-900 transition-all font-bold" 
                value={currentCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Sélectionner</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-gray-400">Origine du contact</label>
            <div className="relative">
              <select 
                disabled={!currentCategory}
                className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-900 transition-all font-bold disabled:bg-gray-50" 
                value={currentOrigin}
                onChange={(e) => handleOriginChange(e.target.value)}
              >
                <option value="">Sélectionner</option>
                {origins.map(orig => <option key={orig} value={orig}>{orig}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-medium text-gray-400">Sous origine</label>
            <div className="relative">
              <select 
                disabled={!currentOrigin}
                className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-900 transition-all font-bold disabled:bg-gray-50" 
                value={currentSubOrigin}
                onChange={(e) => handleSubOriginChange(e.target.value)}
              >
                <option value="">Sélectionner</option>
                {subOrigins.map(so => <option key={so} value={so}>{so}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientContactGeneral;
