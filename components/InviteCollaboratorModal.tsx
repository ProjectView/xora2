
import React, { useState } from 'react';
import { X, UserPlus, Mail, User, ChevronDown, CheckCircle2, Loader2, Send } from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { collection, addDoc, serverTimestamp } from '@firebase/firestore';

interface InviteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
}

const InviteCollaboratorModal: React.FC<InviteCollaboratorModalProps> = ({ isOpen, onClose, userProfile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'Agenceur'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !userProfile?.companyId) return;

    setIsLoading(true);
    try {
      const inviteEmail = formData.email.toLowerCase().trim();
      const appUrl = window.location.origin;
      // Lien qui sera utilisé par le collaborateur pour s'enregistrer
      const registrationLink = `${appUrl}/register?inviteId=${userProfile.companyId}&email=${encodeURIComponent(inviteEmail)}&role=${formData.role}`;

      // Structure compatible avec l'extension "Trigger Email from Firestore"
      await addDoc(collection(db, 'invitations'), {
        // Champs pour l'extension Email
        to: inviteEmail,
        message: {
          subject: `🚀 Invitation à rejoindre ${userProfile.companyName || 'Xora'}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; padding: 24px;">
              <h2 style="color: #111827;">Bonjour ${formData.firstName},</h2>
              <p style="color: #4b5563; line-height: 1.6;">
                <strong>${userProfile.name}</strong> vous invite à rejoindre l'équipe de <strong>${userProfile.companyName || 'votre agence'}</strong> sur la plateforme XORA en tant que <strong>${formData.role}</strong>.
              </p>
              <div style="margin: 32px 0; text-align: center;">
                <a href="${registrationLink}" style="background-color: #111827; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Accepter l'invitation et créer mon mot de passe
                </a>
              </div>
              <p style="color: #9ca3af; font-size: 12px;">
                Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
              </p>
            </div>
          `,
        },
        // Meta-données pour votre logique interne
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        companyId: userProfile.companyId,
        companyName: userProfile.companyName || 'Xora Partner',
        invitedBy: userProfile.name,
        invitedByUid: userProfile.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({ email: '', firstName: '', lastName: '', role: 'Agenceur' });
      }, 2500);
    } catch (error) {
      console.error("Erreur invitation:", error);
      alert("Une erreur est survenue lors de l'envoi de l'invitation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {success ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Invitation envoyée !</h3>
              <p className="text-gray-500 mt-2">Un email a été envoyé à <strong>{formData.email}</strong> pour rejoindre votre équipe.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#FBFBFB]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Inviter un membre</h2>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Société : {userProfile?.companyName}</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                <X size={22} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Adresse Email du collaborateur*</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" size={18} />
                  <input 
                    required
                    type="email" 
                    placeholder="exemple@professionnel.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-gray-900 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      placeholder="Jean" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-gray-900 transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Nom</label>
                  <input 
                    type="text" 
                    placeholder="DUBOIS" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-4 bg-[#F8F9FA] border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-gray-900 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Rôle dans l'organisation</label>
                <div className="relative">
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full appearance-none px-4 py-4 bg-[#F8F9FA] border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-gray-900 transition-all shadow-inner"
                  >
                    <option>Agenceur</option>
                    <option>Administrateur</option>
                    <option>Poseur</option>
                    <option>Démonstrateur</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-[10px] text-gray-400 font-medium px-1 mt-2 italic">L'administrateur possède les droits de gestion sur toute la société.</p>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 bg-[#FBFBFB] flex justify-center">
              <button 
                type="submit"
                disabled={isLoading || !formData.email}
                className="w-full flex items-center justify-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-2xl text-[15px] font-bold shadow-2xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
                Envoyer l'invitation par mail
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteCollaboratorModal;
