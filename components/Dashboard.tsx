
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  ArrowUpRight, 
  Plus, 
  AlertTriangle, 
  MoreVertical, 
  ChevronDown, 
  Euro, 
  FileText, 
  User,
  ChevronUp,
  Loader2,
  Target,
  TrendingUp,
  PieChart,
  BarChart3,
  PenSquare,
  Trash2,
  CheckCircle2,
  Clock,
  GripVertical,
  Calendar,
  MapPin
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, limit, doc, deleteDoc, updateDoc, writeBatch } from '@firebase/firestore';
import { FinancialKPI, Task, Client, Page, Appointment } from '../types';
import AddTaskModal from './AddTaskModal';

interface DashboardProps {
  userProfile?: any;
  onClientClick?: (client: Client) => void;
  onAddClientClick?: () => void;
  onNavigate?: (page: Page, options?: { tab?: string }) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, onClientClick, onAddClientClick, onNavigate }) => {
  const [isKPIOpen, setIsKPIOpen] = useState(true);
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Drag and Drop state
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Calculer les jours de la semaine courante pour l'agenda
  const weekDays = useMemo(() => {
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajuster au Lundi
    startOfWeek.setDate(diff);

    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return {
        label: d.toLocaleDateString('fr-FR', { weekday: 'long' }),
        dateStr: d.toLocaleDateString('fr-FR'),
        isToday: d.toLocaleDateString('fr-FR') === new Date().toLocaleDateString('fr-FR')
      };
    });
  }, []);

  useEffect(() => {
    if (!userProfile?.companyId) return;

    const errorHandler = (error: any) => {
      console.error("Dashboard Snapshot Error:", error);
      if (error.code === 'permission-denied') setHasPermissionError(true);
    };

    // 1. Charger les KPIs financiers
    const unsubscribeKpis = onSnapshot(
      query(collection(db, 'kpis'), where('companyId', '==', userProfile.companyId)),
      (snapshot) => {
        setKpis(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FinancialKPI[]);
      }, errorHandler
    );

    // 2. Charger TOUS les clients
    const unsubscribeClients = onSnapshot(
      query(collection(db, 'clients'), where('companyId', '==', userProfile.companyId)),
      (snapshot) => {
        setAllClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[]);
      }, errorHandler
    );

    // 3. Charger TOUS les projets
    const unsubscribeProjects = onSnapshot(
      query(collection(db, 'projects'), where('companyId', '==', userProfile.companyId)),
      (snapshot) => {
        setAllProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setIsLoading(false);
      }, errorHandler
    );

    // 4. Charger les tâches
    const unsubscribeTasks = onSnapshot(
      query(
        collection(db, 'tasks'), 
        where('companyId', '==', userProfile.companyId),
        limit(50)
      ),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        const sortedData = data.sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
        setTasks(sortedData.filter(t => t.status !== 'completed').slice(0, 8));
      }, errorHandler
    );

    // 5. Charger les rendez-vous (Seulement ceux de l'utilisateur pour le Dashboard perso)
    const unsubscribeAppts = onSnapshot(
      query(
        collection(db, 'appointments'),
        where('companyId', '==', userProfile.companyId),
        where('collaborator.name', '==', userProfile.name)
      ),
      (snapshot) => {
        setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Appointment[]);
      }, errorHandler
    );

    return () => {
      unsubscribeKpis();
      unsubscribeClients();
      unsubscribeProjects();
      unsubscribeTasks();
      unsubscribeAppts();
    };
  }, [userProfile?.companyId, userProfile?.name]);

  const onDragStart = (index: number) => setDraggedItemIndex(index);

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newTasks = [...tasks];
    const draggedItem = newTasks[draggedItemIndex];
    newTasks.splice(draggedItemIndex, 1);
    newTasks.splice(index, 0, draggedItem);
    setDraggedItemIndex(index);
    setTasks(newTasks);
  };

  const onDragEnd = async () => {
    setDraggedItemIndex(null);
    if (!userProfile?.companyId) return;
    try {
      const batch = writeBatch(db);
      tasks.forEach((task, idx) => {
        const taskRef = doc(db, 'tasks', task.id);
        batch.update(taskRef, { orderIndex: idx });
      });
      await batch.commit();
    } catch (e) { console.error(e); }
  };

  const statusCards = useMemo(() => {
    return [
      { id: 'leads', label: 'Leads', count: allClients.filter(c => c.status === 'Leads').length, color: 'purple' },
      { id: 'etudes', label: 'Etudes en cours', count: allProjects.filter(p => p.status?.includes('Étude')).length, color: 'fuchsia' },
      { id: 'commandes', label: 'Commandes clients', count: allProjects.filter(p => p.status?.toLowerCase().includes('command')).length, color: 'blue' },
      { id: 'dossiers', label: 'Dossiers tech & install', count: allProjects.filter(p => p.status?.toLowerCase().includes('tech')).length, color: 'cyan' },
      { id: 'sav', label: 'SAV', count: allProjects.filter(p => p.status?.toLowerCase().includes('sav')).length, color: 'orange' },
    ];
  }, [allClients, allProjects]);

  const updateTaskStatus = async (id: string, status: string) => {
    try { await updateDoc(doc(db, 'tasks', id), { status }); } catch (e) { console.error(e); }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
      setActiveMenuId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsAddTaskModalOpen(true);
    setActiveMenuId(null);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allClients.filter(client => client.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5); 
  }, [searchQuery, allClients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowSearchDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRdvColor = (type: string) => {
    switch (type) {
      case 'R1': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'R2': return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100';
      case 'Métré': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'Pose': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  if (isLoading) {
    return <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 text-gray-300 animate-spin" /></div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-[calc(100vh-64px)] font-sans">
      {/* Search Bar */}
      <div ref={searchRef} className="relative z-30">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un client" 
              className="w-full pl-10 pr-4 py-2 border-b border-gray-200 focus:outline-none focus:border-gray-400 text-sm bg-white text-gray-800 placeholder-gray-400 font-medium"
            />
          </div>
        </div>
        {showSearchDropdown && (searchQuery.length > 0 || searchResults.length >= 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
            <div className="p-2 space-y-1">
              {searchResults.map((client) => (
                <button key={client.id} onClick={() => onClientClick?.(client)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <span className="text-sm font-bold text-gray-900">{client.name}</span>
                  <span className="px-2 py-0.5 text-[9px] font-black bg-purple-100 text-purple-600 rounded uppercase tracking-widest">{client.status}</span>
                </button>
              ))}
              <div className="px-3 pb-3 pt-2">
                <button onClick={() => { onAddClientClick?.(); setShowSearchDropdown(false); }} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200/60 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all">
                  <Plus size={16} className="text-gray-400" />
                  <span>Ajouter une fiche lead</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <button onClick={() => setIsKPIOpen(!isKPIOpen)} className="w-full p-4 flex justify-between items-center bg-white transition-colors">
            <h3 className="font-semibold text-gray-800">Liste des KPI financiers</h3>
            {isKPIOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>
        {isKPIOpen && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-gray-100 bg-white">
                {kpis.map((kpi) => (
                    <div key={kpi.id} className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between shadow-sm bg-[#FBFBFB]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-[#A886D7] shadow-sm"><Euro size={20} className="text-white" /></div>
                            <span className="text-[11px] font-black text-gray-300 uppercase tracking-tight text-right leading-tight max-w-[120px]">{kpi.label}</span>
                        </div>
                        <div>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                                <span className="text-xs text-gray-400 font-medium">/ {kpi.target}</span>
                            </div>
                            <div className="mt-3 relative h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="absolute top-0 left-0 h-full bg-[#A886D7] rounded-full transition-all duration-1000" style={{ width: `${kpi.percentage}%` }}></div>
                            </div>
                            <div className="text-right mt-1"><span className="text-xs font-bold text-gray-900">{kpi.percentage}%</span></div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-3">
             {statusCards.map((card) => (
                <div key={card.id} className={`bg-gray-100 rounded-xl p-4 flex flex-col justify-between relative group hover:shadow-md transition-all min-h-[95px] border border-white/50`}>
                    <div className="flex justify-between items-start">
                         <span className={`font-bold text-[11px] uppercase tracking-wider`}>{card.label}</span>
                         <div className="bg-white/60 p-1 rounded-md cursor-pointer hover:bg-white" onClick={() => onNavigate?.('projects')}><ArrowUpRight size={14} /></div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 mt-1">{card.count || 0}</span>
                </div>
             ))}
        </div>

        <div className="lg:col-span-9">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 h-full flex flex-col overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                       <h3 className="text-[18px] font-black text-gray-900 uppercase tracking-tight">Priorité des tâches & mémos</h3>
                       <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase tracking-widest">{tasks.length} actives</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setEditingTask(null); setIsAddTaskModalOpen(true); }} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-[12px] font-black hover:bg-gray-50 text-gray-800 shadow-sm transition-all active:scale-95">
                            <Plus size={16} className="text-[#A886D7]" />
                            <span>AJOUTER UNE TÂCHE</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {tasks.map((task, index) => (
                        <div 
                          key={task.id} 
                          draggable 
                          onDragStart={() => onDragStart(index)}
                          onDragOver={(e) => onDragOver(e, index)}
                          onDragEnd={onDragEnd}
                          className={`group bg-white border border-gray-100 rounded-[20px] p-5 flex flex-col lg:flex-row lg:items-center justify-between hover:border-indigo-100 hover:shadow-lg transition-all ${draggedItemIndex === index ? 'opacity-40 border-indigo-400 border-dashed bg-indigo-50 shadow-inner scale-95 cursor-grabbing' : 'cursor-default'}`}
                        >
                            <div className="flex items-center space-x-5">
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#FBFBFB] border border-gray-100 rounded-xl text-gray-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors cursor-grab active:cursor-grabbing">
                                    <GripVertical size={18} />
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 uppercase text-[13.5px] group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                                    <div className="flex items-center gap-4 mt-1.5">
                                       <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{task.collaborator.name}</span>
                                       <span className={`text-[11px] font-black uppercase tracking-widest ${task.isLate ? 'text-red-500' : 'text-gray-300'}`}>{task.date || 'Sans échéance'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6 w-full lg:w-auto justify-between lg:justify-end mt-4 lg:mt-0">
                                <div className="flex bg-[#F8F9FA] rounded-full border border-gray-200 p-0.5 min-w-[180px]">
                                    <button onClick={() => updateTaskStatus(task.id, 'pending')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-full transition-all ${task.status === 'pending' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-300'}`}>À faire</button>
                                    <button onClick={() => updateTaskStatus(task.id, 'in-progress')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-full transition-all ${task.status === 'in-progress' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-300'}`}>En cours</button>
                                    <button onClick={() => updateTaskStatus(task.id, 'completed')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-full transition-all ${task.status === 'completed' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-300'}`}>Terminé</button>
                                </div>
                                
                                <div className="relative">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === task.id ? null : task.id); }} 
                                    className={`p-2 rounded-lg transition-all ${activeMenuId === task.id ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-300 hover:bg-gray-50'}`}
                                  >
                                    <MoreVertical size={20} />
                                  </button>

                                  {activeMenuId === task.id && (
                                    <>
                                      <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
                                      <div className="absolute right-0 bottom-full mb-2 lg:bottom-auto lg:top-full lg:mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 w-48 animate-in fade-in zoom-in-95 duration-150">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                                          className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                          <PenSquare size={14} className="text-gray-400" /> Modifier
                                        </button>
                                        <div className="h-px bg-gray-50 my-1 mx-2" />
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                          className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                        >
                                          <Trash2 size={14} /> Supprimer
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* AGENDA PERSONNEL AMÉLIORÉ */}
      <div className="w-full">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <h3 className="text-[18px] font-black text-gray-900 uppercase tracking-tight">Mon agenda de la semaine</h3>
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Vos rendez-vous personnels (Lundi - Vendredi)</p>
                        </div>
                    </div>
                    <button onClick={() => onNavigate?.('agenda')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[12px] font-bold shadow-lg hover:bg-black transition-all">
                      <span>Vue complète</span>
                      <ArrowUpRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {weekDays.map((day, i) => {
                        const dayAppts = appointments.filter(a => a.date === day.dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
                        
                        return (
                            <div key={i} className={`flex flex-col min-h-[300px] rounded-3xl border transition-all ${day.isToday ? 'bg-indigo-50/20 border-indigo-100' : 'bg-gray-50/30 border-gray-100'}`}>
                                <div className={`p-4 text-center border-b ${day.isToday ? 'border-indigo-100' : 'border-gray-100'}`}>
                                    <div className={`text-[10px] font-black uppercase tracking-[0.15em] ${day.isToday ? 'text-indigo-600' : 'text-gray-400'}`}>{day.label}</div>
                                    <div className={`text-[14px] font-black mt-1 ${day.isToday ? 'text-indigo-900' : 'text-gray-600'}`}>{day.dateStr.split('/')[0]} {new Date().toLocaleDateString('fr-FR', { month: 'short' })}</div>
                                </div>
                                
                                <div className="p-3 space-y-2 flex-1 overflow-y-auto">
                                    {dayAppts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                                            <Clock size={20} className="text-gray-400 mb-2" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Libre</span>
                                        </div>
                                    ) : (
                                        dayAppts.map((rdv) => (
                                            <div 
                                              key={rdv.id} 
                                              onClick={() => onNavigate?.('agenda')}
                                              className={`p-3 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group ${getRdvColor(rdv.type)}`}
                                            >
                                                <div className="flex justify-between items-start mb-1.5">
                                                  <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{rdv.startTime}</span>
                                                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded border border-current opacity-40 group-hover:opacity-100 transition-opacity uppercase">{rdv.type}</span>
                                                </div>
                                                <h4 className="text-[12px] font-bold leading-tight line-clamp-2 uppercase tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">{rdv.title}</h4>
                                                <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-gray-400">
                                                   <User size={10} className="shrink-0" />
                                                   <span className="truncate">{rdv.clientName}</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 text-[9px] font-medium text-gray-300">
                                                   <MapPin size={10} className="shrink-0" />
                                                   <span className="truncate">{rdv.location}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                
                                {day.isToday && (
                                  <div className="p-3 pt-0">
                                    <button 
                                      onClick={() => onNavigate?.('agenda')}
                                      className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md shadow-indigo-100"
                                    >
                                      Voir ma journée
                                    </button>
                                  </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
      </div>

      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => { setIsAddTaskModalOpen(false); setEditingTask(null); }}
        userProfile={userProfile}
        taskToEdit={editingTask}
      />
    </div>
  );
};

export default Dashboard;
