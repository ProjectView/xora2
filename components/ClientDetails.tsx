
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  CheckSquare, 
  Phone, 
  Mail, 
  MessageSquare,
  FileText,
  ChevronsRight,
  Loader2
} from 'lucide-react';
import { Client } from '../types';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { doc, onSnapshot, collection, query, where } from '@firebase/firestore';
import ClientTasks from './ClientTasks';
import ClientContactInfo from './ClientContactInfo';
import ClientProjects from './ClientProjects';
import ClientAppointments from './ClientAppointments';

interface ClientDetailsProps {
  client: Client;
  onBack: () => void;
  userProfile?: any;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client: initialClient, onBack, userProfile }) => {
  const [activeTab, setActiveTab] = useState('Information contact');
  const [client, setClient] = useState<Client>(initialClient);
  const [loading, setLoading] = useState(false);
  const [appointmentCount, setAppointmentCount] = useState(0);

  // Synchronisation en temps réel avec Firebase
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(doc(db, 'clients', initialClient.id), (docSnap) => {
      if (docSnap.exists()) {
        setClient({ id: docSnap.id, ...docSnap.data() } as Client);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [initialClient.id]);

  // Compteur de rendez-vous en temps réel
  useEffect(() => {
    const q = query(collection(db, 'appointments'), where('clientId', '==', initialClient.id));
    const unsubCount = onSnapshot(q, (snapshot) => {
      setAppointmentCount(snapshot.size);
    });
    return () => unsubCount();
  }, [initialClient.id]);

  const mainTabs = [
    { label: 'Information contact', key: 'Information contact' },
    { label: `Projet (${client.projectCount || 0})`, key: 'Projet' },
    { label: 'Tâches', key: 'Tâches' },
    { label: `Rendez-vous (${appointmentCount})`, key: 'Rendez-vous' },
    { label: 'Fidélisation', key: 'Fidélisation' },
    { label: 'Documents', key: 'Documents' }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      <div className="flex-1 flex flex-col h-full overflow-y-auto hide-scrollbar">
        
        {/* Header dynamique */}
        <div className="px-10 py-8 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 shadow-sm hover:bg-gray-50 transition-all">
              <ArrowLeft size={20} />
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-gray-300">Créé le {client.dateAdded}</span>
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded uppercase tracking-widest ${
                  client.status === 'Leads' ? 'bg-purple-100 text-purple-600' :
                  client.status === 'Prospect' ? 'bg-fuchsia-100 text-fuchsia-600' :
                  'bg-cyan-100 text-cyan-600'
                }`}>
                  {client.status === 'Leads' ? 'Etudes à réaliser' : client.status}
                </span>
              </div>
              <div className="flex gap-12 items-center">
                <div className="space-y-2">
                  <h1 className="text-[17px] font-bold text-gray-900 leading-tight">{client.name}</h1>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
                    <Phone size={16} className="text-gray-300" /> {(client as any).details?.phone || 'Non renseigné'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
                    <Mail size={16} className="text-gray-300" /> {(client as any).details?.email || 'Non renseigné'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all"><MessageSquare size={16} /> Contacter</button>
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all"><Calendar size={16} /> Planifier un RDV</button>
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all"><Phone size={16} /> Appeler</button>
            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all"><CheckSquare size={16} /> Ajouter une tâche</button>
          </div>
        </div>

        {/* Onglets */}
        <div className="px-10 flex items-end shrink-0 mt-4 overflow-x-auto hide-scrollbar">
          <div className="flex gap-1">
            {mainTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button 
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-8 py-4 text-[13.5px] font-bold whitespace-nowrap transition-all relative rounded-t-[14px] border-t border-x ${
                    isActive 
                    ? 'bg-white text-gray-900 border-gray-100 z-10' 
                    : 'bg-[#F1F3F5] text-[#ADB5BD] border-transparent hover:text-gray-600'
                  }`}
                  style={isActive ? { marginBottom: '-1px' } : {}}
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute -bottom-[2px] left-0 right-0 h-[3px] bg-white z-20" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Corps du dossier */}
        <div className="bg-white flex-1 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] flex flex-col min-h-0 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-300" size={32} />
            </div>
          )}
          <div className="flex-1 px-10 overflow-y-auto hide-scrollbar">
            
            {activeTab === 'Information contact' && <ClientContactInfo client={client} />}

            {activeTab === 'Tâches' && (
              <ClientTasks 
                clientId={client.id} 
                clientName={client.name} 
                userProfile={userProfile} 
              />
            )}

            {activeTab === 'Rendez-vous' && (
              <ClientAppointments 
                clientId={client.id}
                clientName={client.name}
                userProfile={userProfile}
              />
            )}

            {activeTab === 'Projet' && (
              <ClientProjects client={client} userProfile={userProfile} />
            )}
            
            <div className="pb-10"></div>
          </div>
        </div>
      </div>

      {/* Barre latérale droite */}
      <div className="w-24 bg-white border-l border-gray-100 flex flex-col items-center py-10 gap-8 z-40 relative shadow-lg shrink-0">
         <button className="p-4 text-[#CED4DA] hover:text-gray-800 transition-all"><ChevronsRight size={26} /></button>
         <div className="w-12 h-px bg-[#F1F3F5]"></div>
         <button className="p-5 bg-[#F8F9FA] text-[#ADB5BD] rounded-2xl border border-transparent hover:border-gray-200 transition-all shadow-sm"><Mail size={24} /></button>
         <button className="p-5 bg-[#F8F9FA] text-[#ADB5BD] rounded-2xl border border-transparent hover:border-gray-200 transition-all shadow-sm"><Phone size={24} /></button>
         <button className="p-5 bg-[#F8F9FA] text-[#ADB5BD] rounded-2xl border border-transparent hover:border-gray-200 transition-all shadow-sm"><FileText size={24} /></button>
         <button className="p-5 bg-[#F8F9FA] text-[#ADB5BD] rounded-2xl border border-transparent hover:border-gray-200 transition-all shadow-sm"><Calendar size={24} /></button>
         <button className="p-5 bg-[#F8F9FA] text-[#ADB5BD] rounded-2xl border border-transparent hover:border-gray-200 transition-all shadow-sm"><MessageSquare size={24} /></button>
      </div>
    </div>
  );
};

export default ClientDetails;
