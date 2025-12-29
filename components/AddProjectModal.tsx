
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Briefcase, ArrowLeft, Check, Loader2, Search, User, Phone, Mail, ChevronDown, MapPin } from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { collection, addDoc, query, where, onSnapshot, doc } from '@firebase/firestore';

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

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  clientId?: string;
  clientName?: string;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, userProfile, clientId, clientName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [agenceurs, setAgenceurs] = useState<any[]>([]);
  const [clientAddresses, setClientAddresses] = useState<string[]>([]);
  
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [showSponsorDropdown, setShowSponsorDropdown] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<any | null>(null);
  const sponsorRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    categorie: '',
    origine: '',
    sousOrigine: '',
    projectName: "Pose d'une cuisine",
    agenceurReferent: userProfile?.name || '',
    agenceurAvatar: userProfile?.avatar || '',
    agenceurUid: userProfile?.uid || '',
    adresseChantier: '',
    metier: 'Cuisiniste',
    selectedClientId: clientId || ''
  });

  // Chargement des Agenceurs
  useEffect(() => {
    if (!isOpen || !userProfile?.companyId) return;

    const usersQ = query(collection(db, 'users'), where('companyId', '==', userProfile.companyId));
    const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
      let fetched: any[] = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      
      // Sécurité : Toujours inclure l'utilisateur courant
      if (userProfile && !fetched.find(u => u.uid === userProfile.uid)) {
        fetched = [{ 
          uid: userProfile.uid, 
          name: userProfile.name, 
          avatar: userProfile.avatar 
        }, ...fetched];
      }
      
      setAgenceurs(fetched);
      
      // Initialiser le référent si vide
      if (!formData.agenceurUid && userProfile) {
        setFormData(prev => ({
          ...prev,
          agenceurReferent: userProfile.name,
          agenceurAvatar: userProfile.avatar,
          agenceurUid: userProfile.uid
        }));
      }
    });

    return () => unsubscribeUsers();
  }, [isOpen, userProfile?.companyId]);

  // Chargement des Adresses
  useEffect(() => {
    if (!isOpen || !clientId) return;

    const unsubClient = onSnapshot(doc(db, 'clients', clientId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const addresses: string[] = [];
        if (data.details?.address) addresses.push(data.details.address);
        if (data.details?.properties && Array.isArray(data.details.properties)) {
          data.details.properties.forEach((p: any) => {
            if (p.address && !addresses.includes(p.address)) addresses.push(p.address);
          });
        }
        setClientAddresses(addresses);
        if (addresses.length > 0 && !formData.adresseChantier) {
          setFormData(prev => ({ ...prev, adresseChantier: addresses[0] }));
        }
      }
    });
    return () => unsubClient();
  }, [isOpen, clientId]);

  useEffect(() => {
    if (!isOpen || !userProfile?.companyId) return;
    const clientsQ = query(collection(db, 'clients'), where('companyId', '==', userProfile.companyId));
    const unsubscribeClients = onSnapshot(clientsQ, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribeClients();
  }, [isOpen, userProfile?.companyId]);

  const categories = useMemo(() => Object.keys(HIERARCHY_DATA), []);
  const origines = useMemo(() => formData.categorie ? Object.keys(HIERARCHY_DATA[formData.categorie] || {}) : [], [formData.categorie]);
  const sousOrigines = useMemo(() => (formData.categorie && formData.origine) ? (HIERARCHY_DATA[formData.categorie]?.[formData.origine] || []) : [], [formData.categorie, formData.origine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.companyId || !formData.categorie || !formData.origine) return;
    setIsLoading(true);
    try {
      const finalClientId = clientId || formData.selectedClientId;
      const finalClientName = clientName || clients.find(c => c.id === formData.selectedClientId)?.name || 'Client Inconnu';
      
      await addDoc(collection(db, 'projects'), {
        projectName: formData.projectName,
        clientName: finalClientName,
        clientId: finalClientId,
        companyId: userProfile.companyId,
        metier: formData.metier,
        categorie: formData.categorie,
        origine: formData.origine,
        sousOrigine: formData.sousOrigine,
        addedDate: new Date().toLocaleDateString('fr-FR'),
        progress: 2,
        status: 'Études à réaliser',
        statusColor: 'bg-[#FAE8FF] text-[#D946EF]',
        agenceur: {
          uid: formData.agenceurUid,
          name: formData.agenceurReferent,
          avatar: formData.agenceurAvatar
        },
        details: { adresseChantier: formData.adresseChantier },
        createdAt: new Date().toISOString()
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[950px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-[#FBFBFB]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 border border-gray-200 rounded-xl text-gray-800 bg-white shadow-sm"><Briefcase size={20} /></div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Créer une fiche projet</h2>
                <p className="text-[11px] text-gray-400 font-medium">Pour le client : <span className="text-gray-900 font-bold uppercase">{clientName}</span></p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 border border-gray-200 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-gray-900 shadow-sm"><X size={20} /></button>
          </div>
          <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[75vh] hide-scrollbar">
            <div className="bg-[#FBFBFB] border border-gray-100 rounded-2xl p-6 grid grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Catégorie</label>
                <div className="relative">
                  <select value={formData.categorie} onChange={(e) => setFormData({...formData, categorie: e.target.value, origine: '', sousOrigine: ''})} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-gray-900 transition-all font-bold shadow-sm">
                    <option value="">Sélectionner</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Origine du contact</label>
                <div className="relative">
                  <select value={formData.origine} onChange={(e) => setFormData({...formData, origine: e.target.value, sousOrigine: ''})} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-gray-900 transition-all font-bold shadow-sm">
                    <option value="">Sélectionner</option>
                    {origines.map(orig => <option key={orig} value={orig}>{orig}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sous origine</label>
                <div className="relative">
                  <select value={formData.sousOrigine} onChange={(e) => setFormData({...formData, sousOrigine: e.target.value})} className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-gray-900 transition-all font-bold shadow-sm">
                    <option value="">Sélectionner</option>
                    {sousOrigines.map(so => <option key={so} value={so}>{so}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="bg-[#FBFBFB] border border-gray-100 rounded-2xl p-6 grid grid-cols-12 gap-6">
              <div className="col-span-4 space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Titre du projet*</label>
                <input required type="text" value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-bold shadow-sm" />
              </div>
              <div className="col-span-4 space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Agenceur référent</label>
                <div className="relative">
                  <select value={formData.agenceurReferent} onChange={(e) => {
                    const found = agenceurs.find(a => a.name === e.target.value);
                    setFormData({...formData, agenceurReferent: e.target.value, agenceurUid: found?.uid || '', agenceurAvatar: found?.avatar || ''});
                  }} className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-bold shadow-sm">
                    {agenceurs.map(a => <option key={a.uid} value={a.name}>{a.name}</option>)}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <img src={formData.agenceurAvatar || 'https://i.pravatar.cc/150?u=fallback'} className="w-6 h-6 rounded-full border border-white shadow-sm" alt="" />
                  </div>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
              </div>
              <div className="col-span-4 space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Lieu du chantier</label>
                <div className="relative">
                  <select value={formData.adresseChantier} onChange={(e) => setFormData({...formData, adresseChantier: e.target.value})} className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-bold shadow-sm">
                    {clientAddresses.length > 0 ? clientAddresses.map(addr => <option key={addr} value={addr}>{addr}</option>) : <option value="">Aucune adresse renseignée</option>}
                  </select>
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
                {clientAddresses.length === 0 && <p className="text-[10px] text-red-500 font-bold ml-1">Veuillez renseigner une adresse sur la fiche client.</p>}
              </div>
            </div>
            <div className="bg-[#FBFBFB] border border-gray-100 rounded-2xl p-6 space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Métier concerné par l'étude*</label>
              <div className="grid grid-cols-3 gap-4">
                 {['Cuisiniste', 'Bainiste', 'Rénovateur'].map(m => (
                   <button key={m} type="button" onClick={() => setFormData({...formData, metier: m})} className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-3 ${formData.metier === m ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                     {m}
                   </button>
                 ))}
              </div>
            </div>
          </div>
          <div className="px-8 py-8 flex gap-4 bg-[#FBFBFB] border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 bg-white border border-gray-200 rounded-2xl text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">Abandonner</button>
            <button type="submit" disabled={isLoading || !formData.categorie || !formData.origine || clientAddresses.length === 0} className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[#1A1C23] text-white rounded-2xl text-[14px] font-bold shadow-xl hover:bg-black transition-all disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} Créer la fiche projet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;
