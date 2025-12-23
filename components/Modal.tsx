import React, { useState } from 'react';
import { X, ChevronDown, Plus, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, userProfile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    civility: 'Mme',
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
    address: '',
    complement: '',
    origin: 'Relation',
    subOrigin: 'Bouche à oreille',
    companyName: '',
    referent: userProfile?.name || 'Jérémy',
    rgpd: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.companyId) return;
    
    setIsLoading(true);
    try {
      const newClient = {
        name: `${formData.firstName} ${formData.lastName}`.toUpperCase(),
        addedBy: {
          uid: userProfile.uid,
          name: userProfile.name,
          avatar: userProfile.avatar
        },
        origin: formData.origin,
        location: formData.address.split(',').pop()?.trim() || 'Inconnue',
        status: 'Leads', // Par défaut pour une nouvelle fiche
        dateAdded: new Date().toLocaleDateString('fr-FR'),
        companyId: userProfile.companyId,
        details: { ...formData },
        projectCount: 0
      };

      await addDoc(collection(db, 'clients'), newClient);
      onClose();
      // Reset form
      setFormData({
        civility: 'Mme', lastName: '', firstName: '', email: '', phone: '',
        address: '', complement: '', origin: 'Relation', subOrigin: '',
        companyName: '', referent: userProfile?.name, rgpd: false
      });
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      alert("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 shadow-sm text-gray-800">
                       <Plus size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Créer une fiche - clients & prospects</h2>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                  <X size={20} />
              </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
              
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Email</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Adresse*</label>
                      <input 
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        type="text" 
                        placeholder="7 Rue de Provence, 34350 Valras-Plage" 
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-900 transition-all placeholder:text-gray-300" 
                      />
                  </div>
                  <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Complément d'adresse</label>
                      <input 
                        value={formData.complement}
                        onChange={(e) => setFormData({...formData, complement: e.target.value})}
                        type="text" 
                        placeholder="Appartement, Étage..." 
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-900 transition-all placeholder:text-gray-300" 
                      />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Origine</label>
                      <div className="relative">
                          <select 
                            value={formData.origin}
                            onChange={(e) => setFormData({...formData, origin: e.target.value})}
                            className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-900 transition-all"
                          >
                              <option>Relation</option>
                              <option>Web</option>
                              <option>Apporteur</option>
                              <option>Passage magasin</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
                      </div>
                  </div>
                  <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Agenceur référant*</label>
                      <div className="relative">
                          <div className="w-full bg-white border border-gray-200 rounded-xl py-2 px-4 text-sm text-gray-800 flex items-center shadow-sm">
                              <img src={userProfile?.avatar} alt="" className="w-7 h-7 rounded-full mr-3 border border-gray-100" />
                              <span className="font-bold">{userProfile?.name}</span>
                          </div>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
                      </div>
                  </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Consentement RGPD</p>
                    <div className="flex items-center space-x-4">
                        <span className={`text-sm font-bold ${!formData.rgpd ? 'text-gray-900' : 'text-gray-300'}`}>Non</span>
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, rgpd: !formData.rgpd})}
                            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.rgpd ? 'bg-indigo-500' : 'bg-gray-400'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${formData.rgpd ? 'right-1' : 'left-1'}`}></div>
                        </button>
                        <span className={`text-sm font-bold ${formData.rgpd ? 'text-gray-900' : 'text-gray-300'}`}>Oui</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed italic">
                    Mes données ne seront utilisées qu'à cette fin et je pourrai retirer mon consentement à tout moment sur mon accès portail ou sur demande.
                  </p>
              </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-gray-100 flex justify-center bg-gray-50/10">
              <button 
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-3 px-10 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-gray-200 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  )}
                  <span>{isLoading ? 'Enregistrement...' : 'Créer la fiche contact'}</span>
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;