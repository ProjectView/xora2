
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Clock,
  CheckSquare
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from '@firebase/firestore';
import { Appointment } from '../types';
import AddTaskModal from './AddTaskModal';

interface AgendaProps {
  userProfile: any;
}

const Agenda: React.FC<AgendaProps> = ({ userProfile }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'Jours' | 'Semaine' | 'Mois'>('Semaine');
  const [filterUser, setFilterUser] = useState(userProfile?.name || '');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // --- Gestion du temps (Navigation dynamique) ---
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme premier jour
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return {
        label: d.toLocaleDateString('fr-FR', { weekday: 'long' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('fr-FR', { month: 'long' }),
        fullDate: d.toLocaleDateString('fr-FR'), // Format DD/MM/YYYY
        isToday: d.toLocaleDateString('fr-FR') === new Date().toLocaleDateString('fr-FR')
      };
    });
  }, [currentDate]);

  const dateRangeLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.dayNum}/${start.fullDate.split('/')[1]} - ${end.dayNum}/${end.fullDate.split('/')[1]}`;
  }, [weekDays]);

  const changeWeek = (direction: 'next' | 'prev') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 à 18:00

  // --- Données Firestore ---
  useEffect(() => {
    if (!userProfile?.companyId) return;
    const q = query(collection(db, 'appointments'), where('companyId', '==', userProfile.companyId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Appointment[];
      setAppointments(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [userProfile?.companyId]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(rdv => {
      const matchesSearch = rdv.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           rdv.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUser = filterUser ? rdv.collaborator.name === filterUser : true;
      return matchesSearch && matchesUser;
    });
  }, [appointments, searchQuery, filterUser]);

  const getPositionStyles = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutesFrom8am = (startH - 8) * 60 + startM;
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    const rowHeight = 80; 
    return {
      top: `${(startMinutesFrom8am / 60) * rowHeight}px`,
      height: `${(durationMinutes / 60) * rowHeight}px`
    };
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans animate-in fade-in duration-300">
      <div className="p-8 space-y-6 flex-1 flex flex-col min-h-0">
        
        {/* Barre d'outils combinée (Navigation + Action) */}
        <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm shrink-0">
          <div className="flex items-center gap-5">
            {/* Segmented View Control */}
            <div className="flex bg-white rounded-full p-1 border border-gray-200 shadow-sm">
              {['Jours', 'Semaine', 'Mois'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-6 py-1.5 text-xs font-bold rounded-full transition-all ${
                    viewMode === mode ? 'bg-[#1A1C23] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Navigation Temporelle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl px-2 py-1 gap-4 shadow-sm">
               <button onClick={() => changeWeek('prev')} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"><ChevronLeft size={16} /></button>
               <span className="text-xs font-black text-gray-800 uppercase tracking-widest min-w-[100px] text-center">
                 {dateRangeLabel}
               </span>
               <button onClick={() => changeWeek('next')} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAddTaskModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
            >
               <CheckSquare size={16} className="text-indigo-500" />
               Ajouter une tâche
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-[12px] font-bold shadow-lg hover:bg-black transition-all active:scale-95">
               <Plus size={16} className="text-white/70" />
               Ajouter un rendez-vous
            </button>
          </div>
        </div>

        {/* Barre de Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-800 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par client ou objet..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:border-gray-400 transition-all placeholder:text-gray-200 shadow-sm"
            />
          </div>
          <div className="relative group">
            <select 
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm font-bold text-gray-800 outline-none hover:border-gray-400 transition-all cursor-pointer shadow-sm"
            >
              <option value="">Tous les collaborateurs</option>
              <option value={userProfile?.name}>{userProfile?.name} (Moi)</option>
              <option value="Thomas">Thomas</option>
              <option value="Céline">Céline</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          </div>
        </div>

        {/* Grille de l'Agenda */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl shadow-gray-100/50 overflow-hidden relative flex-1 flex flex-col min-h-0">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-300" size={32} />
            </div>
          )}

          <div className="overflow-auto flex-1 custom-scrollbar">
            <div className="min-w-[1000px] flex flex-col h-full">
              {/* En-têtes des Jours */}
              <div className="flex border-b border-gray-100 bg-[#FCFCFD] sticky top-0 z-40">
                <div className="w-20 shrink-0 border-r border-gray-50 flex items-center justify-center">
                  <Clock size={16} className="text-gray-200" />
                </div>
                {weekDays.map((day, i) => (
                  <div key={i} className={`flex-1 py-5 text-center border-l border-gray-50 ${day.isToday ? 'bg-indigo-50/20' : ''}`}>
                    <div className={`text-[10px] font-black uppercase tracking-[0.1em] ${day.isToday ? 'text-indigo-600' : 'text-gray-300'}`}>
                      {day.label}
                    </div>
                    <div className={`text-[14px] font-black mt-1 ${day.isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
                      {day.dayNum} {day.month}
                    </div>
                    {day.isToday && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mx-auto mt-1 animate-pulse"></div>}
                  </div>
                ))}
              </div>

              {/* Corps de la Grille */}
              <div className="flex relative min-h-[880px] bg-white">
                {/* Colonne des Heures */}
                <div className="w-20 shrink-0 bg-[#FCFCFD]/50 border-r border-gray-50 sticky left-0 z-30">
                  {hours.map((hour) => (
                    <div key={hour} className="h-20 text-[11px] font-black text-gray-300 text-center pt-2">
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-50 shadow-sm">{hour}:00</span>
                    </div>
                  ))}
                </div>

                {/* Colonnes des Jours */}
                <div className="flex-1 grid grid-cols-7 relative">
                  {/* Lignes Horizontales de fond */}
                  <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
                    {hours.map((hour) => (
                      <div key={hour} className="h-20 border-b border-gray-50/50 w-full"></div>
                    ))}
                  </div>

                  {weekDays.map((day, dayIdx) => (
                    <div key={dayIdx} className={`relative h-full border-l border-gray-50/30 ${day.isToday ? 'bg-indigo-50/5' : ''}`}>
                      {/* Rendu des RDV */}
                      {filteredAppointments
                        .filter(rdv => rdv.date === day.fullDate)
                        .map(rdv => {
                          const styles = getPositionStyles(rdv.startTime, rdv.endTime);
                          return (
                            <div 
                              key={rdv.id}
                              className="absolute inset-x-1.5 rounded-xl bg-[#C6F6D5] border-l-4 border-[#38A169] p-3 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all z-20 overflow-hidden flex flex-col justify-between shadow-md"
                              style={styles}
                            >
                              <div className="space-y-0.5">
                                <h4 className="text-[11.5px] font-black text-[#22543D] leading-tight truncate uppercase tracking-tighter">{rdv.title}</h4>
                                {rdv.clientName && <p className="text-[10px] font-bold text-[#2F855A] truncate opacity-80">{rdv.clientName}</p>}
                              </div>
                              <div className="flex justify-between items-end mt-2">
                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-white/40 rounded uppercase text-[#22543D]">{rdv.type}</span>
                                <span className="text-[9px] font-black text-[#38A169]">{rdv.startTime}</span>
                              </div>
                            </div>
                          );
                        })
                      }

                      {/* Ligne de temps actuel */}
                      {day.isToday && (
                        <div 
                          className="absolute left-0 right-0 border-t-2 border-red-500 z-30 pointer-events-none flex items-center"
                          style={{ 
                            top: `${((new Date().getHours() - 8) * 60 + new Date().getMinutes()) / 60 * 80}px` 
                          }}
                        >
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1.5 shadow-lg"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        userProfile={userProfile}
      />
    </div>
  );
};

export default Agenda;
