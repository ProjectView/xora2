
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, PenSquare, MessageSquare, Phone, Mail, ChevronDown, Camera, Loader2, Database, Check } from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { doc, updateDoc, onSnapshot, writeBatch, collection, query, where, getDocs } from '@firebase/firestore';

interface UserProfileProps {
  userProfile: any;
  setUserProfile: (profile: any) => void;
  onBack?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userProfile, setUserProfile, onBack }) => {
  const [activeTab, setActiveTab] = useState('Informations collaborateur');
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    civility: userProfile?.civility || 'Mr',
    lastName: userProfile?.lastName || '',
    firstName: userProfile?.firstName || '',
    email: userProfile?.email || '',
    portable: userProfile?.portable || userProfile?.phone || '',
    fixed: userProfile?.fixed || '',
    contractType: userProfile?.contractType || 'CDI',
    jobTitle: userProfile?.jobTitle || userProfile?.role || 'Agenceur',
    hasPhone: userProfile?.hasPhone ?? true,
    hasCar: userProfile?.hasCar ?? true,
    hasLaptop: userProfile?.hasLaptop ?? true,
    agendaColor: userProfile?.agendaColor || '#A8A8A8',
    isSubscriptionActive: userProfile?.isSubscriptionActive ?? true,
    avatar: userProfile?.avatar || `https://i.pravatar.cc/150?u=${userProfile?.uid}`
  });

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        lastName: userProfile.lastName || prev.lastName,
        firstName: userProfile.firstName || prev.firstName,
        email: userProfile.email || prev.email,
        jobTitle: userProfile.jobTitle || userProfile.role || prev.jobTitle,
        avatar: userProfile.avatar || prev.avatar
      }));
    }
  }, [userProfile]);

  // FONCTION DE SYNCHRONISATION (Lien dynamique simulé)
  const syncProfileEverywhere = async (newName: string, newAvatar: string) => {
    if (!userProfile?.uid) return;
    setIsSyncing(true);
    try {
      const batch = writeBatch(db);
      
      // 1. Chercher tous les clients ajoutés par cet utilisateur
      const clientsQ = query(collection(db, 'clients'), where('addedBy.uid', '==', userProfile.uid));
      const clientsSnap = await getDocs(clientsQ);
      clientsSnap.forEach(d => {
        batch.update(doc(db, 'clients', d.id), {
          "addedBy.name": newName,
          "addedBy.avatar": newAvatar
        });
      });

      // 2. Chercher tous les projets gérés par cet utilisateur
      const projectsQ = query(collection(db, 'projects'), where('agenceur.uid', '==', userProfile.uid));
      const projectsSnap = await getDocs(projectsQ);
      projectsSnap.forEach(d => {
        batch.update(doc(db, 'projects', d.id), {
          "agenceur.name": newName,
          "agenceur.avatar": newAvatar
        });
      });

      await batch.commit();
    } catch (e) {
      console.error("Erreur synchro profil:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdate = async (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    try {
      if (userProfile?.uid) {
        const userRef = doc(db, 'users', userProfile.uid);
        
        let finalFirst = formData.firstName;
        let finalLast = formData.lastName;
        let finalAvatar = formData.avatar;

        if (field === 'firstName') finalFirst = value;
        if (field === 'lastName') finalLast = value.toUpperCase();
        if (field === 'avatar') finalAvatar = value;

        const fullName = `${finalFirst} ${finalLast}`;
        
        // Update user document
        await updateDoc(userRef, { 
          [field]: value,
          name: fullName,
          lastName: finalLast 
        });

        // Sync snapshots if critical info changed
        if (field === 'firstName' || field === 'lastName' || field === 'avatar') {
          await syncProfileEverywhere(fullName, finalAvatar);
        }

        setUserProfile({ ...userProfile, ...newFormData, name: fullName, lastName: finalLast });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert("L'image est trop lourde (max 1Mo)."); return; }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await handleUpdate('avatar', base64String);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-y-auto hide-scrollbar font-sans">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      <div className="px-10 py-8 flex justify-between items-start shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 shadow-sm hover:bg-gray-50 transition-all cursor-pointer"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-4">
            <div onClick={handleAvatarClick} className="relative group cursor-pointer w-16 h-16 flex-shrink-0">
              <img src={formData.avatar} className={`w-full h-full rounded-full aspect-square object-cover border-2 border-white shadow-md transition-all ${isUploading ? 'opacity-50' : 'group-hover:brightness-75'}`} alt="" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? <Loader2 className="text-white animate-spin" size={18} /> : <Camera className="text-white" size={18} />}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-[20px] font-bold text-gray-900 uppercase tracking-tight">{formData.firstName} {formData.lastName}</h1>
                <span className="px-2 py-0.5 border border-gray-200 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest">Xora</span>
              </div>
              <p className="text-[13px] font-bold text-gray-300">{formData.jobTitle}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-200 mx-2"></div>
          <div className="flex gap-8">
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
               <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm"><Phone size={16} className="text-gray-400" /></div>
               {formData.portable || 'Non renseigné'}
            </div>
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
               <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm"><Mail size={16} className="text-gray-400" /></div>
               {formData.email}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {isSyncing && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[12px] font-bold animate-pulse">
              <Loader2 size={14} className="animate-spin" /> Synchro en cours...
            </div>
          )}
          <button onClick={handleAvatarClick} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all">
            <PenSquare size={16} /> Modifier le profil
          </button>
        </div>
      </div>

      <div className="px-10 flex items-end shrink-0 mt-2 overflow-x-auto hide-scrollbar">
        <div className="flex gap-1">
          {['Informations collaborateur', 'Documents', 'Paramètres avancés'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 text-[13.5px] font-bold whitespace-nowrap transition-all relative rounded-t-[14px] border-t border-x ${isActive ? 'bg-white text-gray-900 border-gray-100 z-10' : 'bg-[#F1F3F5] text-[#ADB5BD] border-transparent'}`} style={isActive ? { marginBottom: '-1px' } : {}}>
                {tab}
                {isActive && <div className="absolute -bottom-[2px] left-0 right-0 h-[3px] bg-white z-20" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white mx-10 mb-10 flex-1 border border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] flex flex-col min-h-0 relative p-10 space-y-8 rounded-b-3xl">
        {activeTab === 'Paramètres avancés' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="p-8 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                <div className="flex items-center gap-4 text-gray-900">
                   <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-800"><Database size={24} /></div>
                   <div>
                      <h3 className="text-lg font-bold uppercase tracking-tight">Maintenance profil</h3>
                      <p className="text-sm text-gray-400 font-medium">Les données de la société ont été déplacées dans le menu "Notre entreprise".</p>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <>
            <div className="w-full h-16 bg-gradient-to-r from-[#F97316] via-[#D946EF] to-[#0EA5E9] rounded-2xl flex items-center justify-between px-8 text-white shadow-lg overflow-hidden relative">
               <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
               <div className="relative flex items-center gap-4">
                  <span className="text-[14px] font-bold tracking-tight">Abonnement Xora Actif</span>
                  <span className="px-2 py-0.5 bg-white border border-white rounded text-[10px] font-bold text-gray-900 uppercase tracking-widest">Xora</span>
               </div>
               <div className="relative flex items-center gap-4">
                  <span className={`text-[12px] font-bold ${!formData.isSubscriptionActive ? 'text-white' : 'text-white/40'}`}>Non</span>
                  <button onClick={() => handleUpdate('isSubscriptionActive', !formData.isSubscriptionActive)} className="w-14 h-7 bg-black/30 rounded-full relative shadow-inner p-1">
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${formData.isSubscriptionActive ? 'ml-auto' : 'mr-auto'}`}></div>
                  </button>
                  <span className={`text-[12px] font-bold ${formData.isSubscriptionActive ? 'text-white' : 'text-white/40'}`}>Oui</span>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Civilité du membre</label>
                  <div className="relative">
                    <select value={formData.civility} onChange={(e) => handleUpdate('civility', e.target.value)} className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-medium"><option>Mr</option><option>Mme</option></select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Nom du membre</label>
                  <input type="text" value={formData.lastName} onChange={(e) => handleUpdate('lastName', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-medium uppercase" />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Prénom du membre</label>
                  <input type="text" value={formData.firstName} onChange={(e) => handleUpdate('firstName', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-medium" />
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Email professionnel</label>
                  <input type="email" value={formData.email} readOnly className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-400 outline-none font-medium cursor-not-allowed" />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Téléphone portable</label>
                  <input type="text" value={formData.portable} onChange={(e) => handleUpdate('portable', e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-medium" />
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
