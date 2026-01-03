
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, ChevronDown, Plus, CheckSquare, Calendar as CalendarIcon, Loader2, Save, CalendarClock, Clock, Search, User as UserIcon, AlertTriangle } from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { collection, addDoc, query, where, onSnapshot, getDocs, doc, updateDoc } from '@firebase/firestore';
import { Task } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: any;
  initialClientId?: string;
  initialProjectId?: string;
  taskToEdit?: Task | null;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  userProfile, 
  initialClientId = '', 
  initialProjectId = '' ,
  taskToEdit = null
}) => {
  const isEdit = !!taskToEdit;
  const [isMemo, setIsMemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [selectedCollaboratorIdx, setSelectedCollaboratorIdx] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState(initialClientId);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [selectedStatusLabel, setSelectedStatusLabel] = useState('A faire');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');

  // Collaborators from Database
  const [collaborators, setCollaborators] = useState<any[]>([]);

  // Client Search States
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);
  const clientSearchRef = useRef<HTMLDivElement>(null);

  // Agenda Integration States
  const [isScheduled, setIsScheduled] = useState(false);
  const [agendaDate, setAgendaDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  
  // Conflict Detection
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [conflictingEvents, setConflictingEvents] = useState<any[]>([]);

  const [clients, setClients] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);

  const statusOptions = [
    'A faire',
    'En attente',
    'Urgent',
    'Prioritaire',
    'Dossier technique',
    'Appel à passer'
  ];

  // Load Collaborators from Firestore
  useEffect(() => {
    if (!isOpen || !userProfile?.companyId) return;

    const q = query(collection(db, 'users'), where('companyId', '==', userProfile.companyId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setCollaborators(users);
      
      // Default selection to current user if found
      if (userProfile) {
        const idx = users.findIndex(u => u.uid === userProfile.uid);
        if (idx !== -1) setSelectedCollaboratorIdx(idx);
      }
    });

    return () => unsubscribe();
  }, [isOpen, userProfile?.companyId]);

  // Load All Appointments for conflict checking
  useEffect(() => {
    if (!isOpen || !userProfile?.companyId) return;

    const q = query(collection(db, 'appointments'), where('companyId', '==', userProfile.companyId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [isOpen, userProfile?.companyId]);

  // Real-time Conflict Checking
  useEffect(() => {
    if (!isScheduled || !agendaDate || collaborators.length === 0) {
      setConflictingEvents([]);
      return;
    }

    const selectedCollab = collaborators[selectedCollaboratorIdx];
    const targetDateFormatted = new Date(agendaDate).toLocaleDateString('fr-FR');
    
    const conflicts = allAppointments.filter(rdv => {
      // Meme jour et meme collaborateur
      if (rdv.date !== targetDateFormatted || rdv.collaborator.name !== selectedCollab.name) return false;
      
      // Verification chevauchement (Overlap)
      // (StartA < EndB) and (EndA > StartB)
      return (startTime < rdv.endTime) && (endTime > rdv.startTime);
    });

    setConflictingEvents(conflicts);
  }, [isScheduled, agendaDate, startTime, endTime, selectedCollaboratorIdx, collaborators, allAppointments]);

  // Click outside to close client search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(event.target as Node)) {
        setShowClientResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pré-remplissage en mode édition ou reset en mode création
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setIsMemo(taskToEdit.type === 'Mémo');
        setSelectedStatusLabel(taskToEdit.statusLabel || 'A faire');
        setNote((taskToEdit as any).note || '');
        setSelectedClientId((taskToEdit as any).clientId || '');
        setSelectedProjectId((taskToEdit as any).projectId || '');
        
        if (collaborators.length > 0) {
          const cIdx = collaborators.findIndex(c => c.name === taskToEdit.collaborator.name);
          setSelectedCollaboratorIdx(cIdx !== -1 ? cIdx : 0);
        }

        if (taskToEdit.date && taskToEdit.date.includes('/')) {
          const [d, m, y] = taskToEdit.date.split('/');
          const formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          setEndDate(formattedDate);
          setAgendaDate(formattedDate); 
        } else {
          setEndDate('');
          setAgendaDate('');
        }
        setIsScheduled(false);
      } else {
        setTitle('');
        setIsMemo(false);
        setSelectedStatusLabel('A faire');
        setNote('');
        setSelectedClientId(initialClientId);
        setSelectedProjectId(initialProjectId);
        setEndDate('');
        setAgendaDate('');
        setIsScheduled(false);
      }
    }
  }, [isOpen, taskToEdit, initialClientId, initialProjectId, collaborators]);

  useEffect(() => {
    if (!isOpen || !userProfile?.companyId) return;

    const fetchData = async () => {
      const clientsQ = query(collection(db, 'clients'), where('companyId', '==', userProfile.companyId));
      const clientsSnap = await getDocs(clientsQ);
      const loadedClients = clientsSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setClients(loadedClients);

      // Sync search query with loaded clients
      if (selectedClientId) {
        const found = loadedClients.find(c => c.id === selectedClientId);
        if (found) setClientSearchQuery(found.name);
      } else {
        setClientSearchQuery('');
      }

      const projectsQ = query(collection(db, 'projects'), where('companyId', '==', userProfile.companyId));
      const projectsSnap = await getDocs(projectsQ);
      setAllProjects(projectsSnap.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().projectName,
        clientId: doc.data().clientId
      })));
    };

    fetchData();
  }, [isOpen, userProfile?.companyId]);

  // Filtrage dynamique des clients pour l'autocomplétion
  const filteredClients = useMemo(() => {
    if (!clientSearchQuery.trim()) return clients;
    const normalized = clientSearchQuery.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(normalized));
  }, [clientSearchQuery, clients]);

  const filteredProjects = useMemo(() => {
    if (!selectedClientId) return [];
    return allProjects.filter(p => p.clientId === selectedClientId);
  }, [selectedClientId, allProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.companyId || !title || collaborators.length === 0) return;

    setIsLoading(true);
    try {
      const selectedCollab = collaborators[selectedCollaboratorIdx];
      const selectedProjectName = allProjects.find(p => p.id === selectedProjectId)?.name || '';
      const selectedClientName = clients.find(c => c.id === selectedClientId)?.name || '';

      const taskData: any = {
        title: title,
        subtitle: selectedProjectName,
        type: isMemo ? 'Mémo' : 'Tâche manuelle',
        statusLabel: selectedStatusLabel,
        tagColor: selectedStatusLabel === 'Prioritaire' ? 'purple' : 
                  selectedStatusLabel === 'Urgent' ? 'pink' : 'gray',
        date: endDate ? new Date(endDate).toLocaleDateString('fr-FR') : '',
        collaborator: {
          name: selectedCollab.name,
          avatar: selectedCollab.avatar
        },
        hasNote: !!note,
        note: note,
        clientId: selectedClientId,
        projectId: selectedProjectId,
      };

      let taskId = '';

      if (isEdit && taskToEdit) {
        taskId = taskToEdit.id;
        await updateDoc(doc(db, 'tasks', taskToEdit.id), taskData);
      } else {
        const docRef = await addDoc(collection(db, 'tasks'), {
          ...taskData,
          status: 'pending',
          statusType: 'toggle',
          companyId: userProfile.companyId,
          createdAt: new Date().toISOString()
        });
        taskId = docRef.id;
      }

      if (isScheduled && agendaDate) {
        const rdvDate = new Date(agendaDate).toLocaleDateString('fr-FR');
        await addDoc(collection(db, 'appointments'), {
          clientId: selectedClientId || null,
          clientName: selectedClientName || 'Client divers',
          projectId: selectedProjectId || null,
          projectName: selectedProjectName || null,
          title: `[Tâche] ${title}`,
          type: 'Autre',
          date: rdvDate,
          startTime: startTime,
          endTime: endTime,
          location: 'Showroom',
          status: 'confirmé',
          collaborator: {
            name: selectedCollab.name,
            avatar: selectedCollab.avatar
          },
          companyId: userProfile.companyId,
          taskId: taskId,
          createdAt: new Date().toISOString()
        });
      }
      
      onClose();
    } catch (error) {
      console.error("Erreur Firestore tâche:", error);
      alert("Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <div className={`p-2.5 border rounded-xl shadow-sm ${isEdit ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                {isEdit ? <Save size={20} /> : <CheckSquare size={20} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {isEdit ? `Modifier : ${taskToEdit?.title}` : "Créer une tâche manuelle ou un mémo"}
                </h2>
                {isEdit && <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Mode édition actif</p>}
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all hover:rotate-90">
              <X size={22} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 ml-1">Titre de la tâche / mémo*</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Appeler M. Dubois pour le devis"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:border-gray-900 outline-none transition-all"
              />
            </div>

            {/* Toggle Type Section */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
              <label className="block text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-[0.1em]">Nature de l'entrée</label>
              <div className="flex items-center gap-6">
                <span className={`text-sm font-bold transition-all ${!isMemo ? 'text-gray-900 scale-105' : 'text-gray-400 opacity-60'}`}>Tâche manuelle</span>
                <button 
                  type="button"
                  onClick={() => setIsMemo(!isMemo)}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none shadow-sm ${isMemo ? 'bg-[#A886D7]' : 'bg-gray-800'}`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md ${isMemo ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
                <span className={`text-sm font-bold transition-all ${isMemo ? 'text-gray-900 scale-105' : 'text-gray-400 opacity-60'}`}>Mémo</span>
              </div>
            </div>

            {/* Collaborator and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-6 space-y-2">
                <label className="block text-xs font-bold text-gray-500 ml-1">Collaborateur assigné</label>
                <div className="relative group">
                  <select 
                    className="w-full appearance-none flex items-center pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:border-[#A886D7] focus:ring-2 focus:ring-purple-50 outline-none transition-all cursor-pointer"
                    onChange={(e) => setSelectedCollaboratorIdx(parseInt(e.target.value))}
                    value={selectedCollaboratorIdx}
                  >
                    {collaborators.length > 0 ? (
                      collaborators.map((c, i) => (
                        <option key={i} value={i}>{c.name}</option>
                      ))
                    ) : (
                      <option>Chargement...</option>
                    )}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                     {collaborators.length > 0 && (
                       <img src={collaborators[selectedCollaboratorIdx]?.avatar} className="w-6 h-6 rounded-full border border-white shadow-sm" alt="" />
                     )}
                  </div>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-6 space-y-2">
                <label className="block text-xs font-bold text-gray-500 ml-1">Échéance de la tâche</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-purple-50 outline-none transition-all cursor-pointer"
                  />
                  <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Agenda Schedule Block */}
            <div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${isScheduled ? 'bg-indigo-50/30 border-indigo-100 shadow-sm' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isScheduled ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                    <CalendarClock size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Placer dans l'agenda</h3>
                    <p className="text-[10px] text-gray-400 font-medium">Bloquer un créneau pour réaliser cette tâche</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsScheduled(!isScheduled)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 shadow-sm ${isScheduled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isScheduled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {isScheduled && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider ml-1">Jour de réalisation</label>
                      <div className="relative">
                        <input 
                          type="date"
                          value={agendaDate}
                          onChange={(e) => setAgendaDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-indigo-900 outline-none focus:border-indigo-400 transition-all cursor-pointer"
                        />
                        <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider ml-1">Heure de début</label>
                      <div className="relative">
                        <input 
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-indigo-900 outline-none focus:border-indigo-400 transition-all"
                        />
                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider ml-1">Heure de fin</label>
                      <div className="relative">
                        <input 
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-indigo-900 outline-none focus:border-indigo-400 transition-all"
                        />
                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Conflict Alert Section */}
                  {conflictingEvents.length > 0 && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-4 animate-in slide-in-from-left-4 duration-300">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <AlertTriangle size={20} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[13px] font-bold text-orange-900">Chevauchement d'agenda détecté !</p>
                        <p className="text-[12px] text-orange-700 leading-relaxed font-medium">
                          Attention, <strong>{collaborators[selectedCollaboratorIdx]?.name}</strong> a déjà des événements placés sur ce créneau : <br/>
                          <span className="italic">{conflictingEvents.map(c => c.title).join(', ')}</span>.
                        </p>
                        <p className="text-[11px] text-orange-600 font-black uppercase tracking-tighter mt-1 italic">⚠️ Attention au surmenage</p>
                      </div>
                    </div>
                  )}

                  {!agendaDate && (
                    <p className="col-span-full text-[10px] text-red-500 font-bold italic mt-1 px-1">
                      ⚠️ Veuillez renseigner le "Jour de réalisation" pour valider l'inscription à l'agenda.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Client, Project, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* COMPOSANT RECHERCHE CLIENT MODERNISÉ */}
              <div className="space-y-2 relative" ref={clientSearchRef}>
                <label className="block text-xs font-bold text-gray-500 ml-1">Client lié (optionnel)</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value);
                      setShowClientResults(true);
                      if (!e.target.value) setSelectedClientId('');
                    }}
                    onFocus={() => setShowClientResults(true)}
                    placeholder="Chercher un client..."
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:border-[#A886D7] outline-none transition-all shadow-sm"
                  />
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  {selectedClientId && (
                    <button 
                      type="button"
                      onClick={() => { setSelectedClientId(''); setClientSearchQuery(''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Dropdown de résultats */}
                {showClientResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[110] overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 space-y-1">
                      {filteredClients.length > 0 ? (
                        filteredClients.map(client => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setSelectedClientId(client.id);
                              setClientSearchQuery(client.name);
                              setShowClientResults(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${selectedClientId === client.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
                          >
                            <div className={`p-1.5 rounded-lg ${selectedClientId === client.id ? 'bg-white text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                              <UserIcon size={14} />
                            </div>
                            <span className="text-sm font-bold">{client.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400 text-xs font-medium italic">
                          Aucun client trouvé pour "{clientSearchQuery}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 ml-1">Projet lié (optionnel)</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:border-[#A886D7] outline-none transition-all cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                    disabled={!selectedClientId}
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                  >
                    <option value="">{!selectedClientId ? 'Choisir un client d\'abord' : 'Aucun'}</option>
                    {filteredProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 ml-1">Marqueur Statut</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:border-[#A886D7] outline-none transition-all cursor-pointer"
                    value={selectedStatusLabel}
                    onChange={(e) => setSelectedStatusLabel(e.target.value)}
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Note de la tâche / mémo</label>
              <textarea 
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Précisions sur la demande du client..."
                className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#A886D7] focus:ring-4 focus:ring-purple-50/50 placeholder:text-gray-300 resize-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-gray-100 flex justify-center bg-gray-50/10">
            <button 
              type="submit"
              disabled={isLoading || !title || collaborators.length === 0}
              className={`group flex items-center gap-3 px-10 py-4 rounded-2xl text-sm font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${isEdit ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                isEdit ? <Save size={20} /> : <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              )}
              <span>{isLoading ? 'Traitement...' : (isEdit ? 'Mettre à jour la tâche' : `Créer la ${isMemo ? 'note mémo' : 'tâche manuelle'}`)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
