import React, { useState, useRef } from 'react';
import { ArrowLeft, PenSquare, MessageSquare, Phone, Mail, ChevronDown, Camera, Loader2, Database, Check } from 'lucide-react';
import { db, seedDatabase } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface UserProfileProps {
  userProfile: any;
  setUserProfile: (profile: any) => void;
  onBack?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userProfile, setUserProfile, onBack }) => {
  const [activeTab, setActiveTab] = useState('Informations collaborateur');
  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // État local pour le formulaire, initialisé avec les données réelles de userProfile
  const [formData, setFormData] = useState({
    civility: userProfile?.civility || 'Mr',
    lastName: userProfile?.lastName || userProfile?.name?.split(' ').pop() || '',
    firstName: userProfile?.firstName || userProfile?.name?.split(' ')[0] || '',
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

  const handleUpdate = async (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Sauvegarde automatique dans Firestore
    try {
      if (userProfile?.uid) {
        const userRef = doc(db, 'users', userProfile.uid);
        await updateDoc(userRef, { [field]: value });
        
        // Mettre à jour le nom complet si le prénom ou nom change
        if (field === 'firstName' || field === 'lastName') {
          const fullName = `${field === 'firstName' ? value : formData.firstName} ${field === 'lastName' ? value : formData.lastName}`;
          await updateDoc(userRef, { name: fullName });
          setUserProfile({ ...userProfile, ...newFormData, name: fullName });
        } else {
          setUserProfile({ ...userProfile, ...newFormData });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  const handleSeed = async () => {
    if (!userProfile?.companyId) return;
    setIsSeeding(true);
    try {
      await seedDatabase(userProfile.companyId);
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur seed:", error);
      alert("Erreur lors de l'initialisation.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("L'image est trop lourde (max 1Mo).");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await handleUpdate('avatar', base64String);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const Toggle = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => (
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

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-y-auto hide-scrollbar font-sans">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      {/* Top Profile Header */}
      <div className="px-10 py-8 flex justify-between items-start shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div 
              onClick={handleAvatarClick}
              className="relative group cursor-pointer w-16 h-16 flex-shrink-0"
            >
              <img 
                src={formData.avatar} 
                className={`w-full h-full rounded-full aspect-square object-cover border-2 border-white shadow-md transition-all ${isUploading ? 'opacity-50' : 'group-hover:brightness-75'}`} 
                alt="Avatar" 
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? <Loader2 className="text-white animate-spin" size={18} /> : <Camera className="text-white" size={18} />}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-[20px] font-bold text-gray-900 leading-tight uppercase tracking-tight">
                  {formData.firstName} {formData.lastName}
                </h1>
                <span className="px-2 py-0.5 border border-gray-200 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest">Xora</span>
              </div>
              <p className="text-[13px] font-bold text-gray-300">{formData.jobTitle}</p>
            </div>
          </div>

          <div className="h-10 w-px bg-gray-200 mx-2"></div>

          <div className="flex gap-8">
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
               <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <Phone size={16} className="text-gray-400" />
               </div>
               {formData.portable || 'Non renseigné'}
            </div>
            <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
               <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <Mail size={16} className="text-gray-400" />
               </div>
               {formData.email}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleAvatarClick}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all"
          >
            <PenSquare size={16} /> Modifier le profil
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all">
            <MessageSquare size={16} /> Contacter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-10 flex items-end shrink-0 mt-2 overflow-x-auto hide-scrollbar">
        <div className="flex gap-1">
          {['Informations collaborateur', 'Documents', 'Paramètres avancés'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-[13.5px] font-bold whitespace-nowrap transition-all relative rounded-t-[14px] border-t border-x ${
                  isActive 
                  ? 'bg-white text-gray-900 border-gray-100 z-10' 
                  : 'bg-[#F1F3F5] text-[#ADB5BD] border-transparent'
                }`}
                style={isActive ? { marginBottom: '-1px' } : {}}
              >
                {tab}
                {isActive && (
                  <div className="absolute -bottom-[2px] left-0 right-0 h-[3px] bg-white z-20" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white mx-10 mb-10 flex-1 border border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] flex flex-col min-h-0 relative p-10 space-y-8 rounded-b-3xl">
        
        {activeTab === 'Paramètres avancés' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="p-8 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                <div className="flex items-center gap-4 text-gray-900">
                   <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-800">
                      <Database size={24} />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold uppercase tracking-tight">Initialisation des données</h3>
                      <p className="text-sm text-gray-400 font-medium">Injecter les données de test (KPI, Statuts, Clients) dans Firestore.</p>
                   </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    onClick={handleSeed}
                    disabled={isSeeding || seedSuccess}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold shadow-lg transition-all ${
                      seedSuccess 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-900 text-white hover:bg-black active:scale-[0.98]'
                    }`}
                  >
                    {isSeeding ? <Loader2 className="animate-spin" size={20} /> : (seedSuccess ? <Check size={20} /> : <Database size={20} />)}
                    {isSeeding ? 'Initialisation...' : (seedSuccess ? 'Données injectées !' : 'Initialiser la base de données')}
                  </button>
                  <p className="mt-4 text-xs text-gray-400 italic">Attention : cette action créera de nouveaux documents dans votre projet Firebase.</p>
                </div>
             </div>
          </div>
        ) : (
          <>
            {/* Subscription Banner */}
            <div className="w-full h-16 bg-gradient-to-r from-[#F97316] via-[#D946EF] to-[#0EA5E9] rounded-2xl flex items-center justify-between px-8 text-white shadow-lg overflow-hidden relative">
               <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
               <div className="relative flex items-center gap-4">
                  <span className="text-[14px] font-bold tracking-tight">Abonnement Xora Actif</span>
                  <span className="px-2 py-0.5 bg-white border border-white rounded text-[10px] font-bold text-gray-900 uppercase tracking-widest">Xora</span>
               </div>
               <div className="relative flex items-center gap-4">
                  <span className={`text-[12px] font-bold ${!formData.isSubscriptionActive ? 'text-white' : 'text-white/40'}`}>Non</span>
                  <button 
                    onClick={() => handleUpdate('isSubscriptionActive', !formData.isSubscriptionActive)}
                    className="w-14 h-7 bg-black/30 rounded-full relative shadow-inner p-1"
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${formData.isSubscriptionActive ? 'ml-auto' : 'mr-auto'}`}></div>
                  </button>
                  <span className={`text-[12px] font-bold ${formData.isSubscriptionActive ? 'text-white' : 'text-white/40'}`}>Oui</span>
               </div>
            </div>

            {/* Form Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Civilité du membre</label>
                  <div className="relative">
                    <select 
                      value={formData.civility}
                      onChange={(e) => handleUpdate('civility', e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-medium"
                    >
                      <option>Mr</option>
                      <option>Mme</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Nom du membre</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => handleUpdate('lastName', e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-medium uppercase" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Prénom du membre</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => handleUpdate('firstName', e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-medium" 
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Email Client</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleUpdate('email', e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-medium" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Téléphone portable</label>
                  <div className="flex">
                    <div className="flex items-center gap-1 px-3 border border-r-0 border-gray-100 rounded-l-xl bg-white">
                      <span className="text-sm">🇫🇷</span>
                      <ChevronDown size={12} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Entrer un numéro" 
                      value={formData.portable}
                      onChange={(e) => handleUpdate('portable', e.target.value)}
                      className="flex-1 bg-white border border-gray-100 rounded-r-xl px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-medium" 
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Téléphone fixe</label>
                  <div className="flex">
                    <div className="flex items-center gap-1 px-3 border border-r-0 border-gray-100 rounded-l-xl bg-white">
                      <span className="text-sm">🇫🇷</span>
                      <ChevronDown size={12} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Entrer un numéro" 
                      value={formData.fixed}
                      onChange={(e) => handleUpdate('fixed', e.target.value)}
                      className="flex-1 bg-white border border-gray-100 rounded-r-xl px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-medium" 
                    />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Type de contrat</label>
                  <input 
                    type="text" 
                    value={formData.contractType}
                    onChange={(e) => handleUpdate('contractType', e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-medium" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-medium text-gray-400">Métier</label>
                  <input 
                    type="text" 
                    value={formData.jobTitle}
                    onChange={(e) => handleUpdate('jobTitle', e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:border-gray-900 transition-all font-medium" 
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-4">
                  <label className="text-[11px] font-medium text-gray-400">Téléphone mise à disposition</label>
                  <Toggle value={formData.hasPhone} onChange={(v) => handleUpdate('hasPhone', v)} />
               </div>
               <div className="space-y-4">
                  <label className="text-[11px] font-medium text-gray-400">Voiture</label>
                  <Toggle value={formData.hasCar} onChange={(v) => handleUpdate('hasCar', v)} />
               </div>
               <div className="space-y-4">
                  <label className="text-[11px] font-medium text-gray-400">Ordinateur portable</label>
                  <Toggle value={formData.hasLaptop} onChange={(v) => handleUpdate('hasLaptop', v)} />
               </div>
            </div>

            {/* Color Section */}
            <div className="p-8 bg-[#FBFBFB] border border-gray-100 rounded-2xl space-y-4">
               <h4 className="text-[12px] font-bold text-gray-400">Couleur collaborateur agenda</h4>
               <div className="flex gap-4">
                  <div 
                    className="w-16 h-12 rounded-lg shadow-sm border border-gray-100 shrink-0" 
                    style={{ backgroundColor: formData.agendaColor }}
                  ></div>
                  <div className="relative flex-1">
                    <select 
                      value={formData.agendaColor}
                      onChange={(e) => handleUpdate('agendaColor', e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none cursor-pointer"
                    >
                      <option value="#A8A8A8">A8A8A8 (Gris)</option>
                      <option value="#D946EF">D946EF (Fuchsia)</option>
                      <option value="#0EA5E9">0EA5E9 (Bleu)</option>
                      <option value="#F97316">F97316 (Orange)</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
               </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default UserProfile;