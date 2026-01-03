
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
  StickyNote,
  PenSquare,
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { collection, query, where, onSnapshot, limit, doc, deleteDoc, updateDoc } from '@firebase/firestore';
import { FinancialKPI, StatusCard, Task, Client, Page } from '../types';
import AddTaskModal from './AddTaskModal';

interface DashboardProps {
  userProfile?: any;
  onClientClick?: (client: Client) => void;
  onAddClientClick?: () => void;
  onNavigate?: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, onClientClick, onAddClientClick, onNavigate }) => {
  const [isKPIOpen, setIsKPIOpen] = useState(true);
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);
  const [statusCards, setStatusCards] = useState<StatusCard[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userProfile?.companyId) return;

    const errorHandler = (error: any) => {
      console.error("Dashboard Snapshot Error:", error);
      if (error.code === 'permission-denied') setHasPermissionError(true);
    };

    // 1. Charger les KPIs financiers
    const kpisRef = collection(db, 'kpis');
    const kpisQuery = query(kpisRef, where('companyId', '==', userProfile.companyId));
    
    const unsubscribeKpis = onSnapshot(kpisQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FinancialKPI[];
      setKpis(data);
    }, errorHandler);

    // 2. Charger les compteurs de statut
    const statusRef = collection(db, 'status_overview');
    const statusQuery = query(statusRef, where('companyId', '==', userProfile.companyId));
    
    const unsubscribeStatus = onSnapshot(statusQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StatusCard[];
      const sortedData = [...data].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      setStatusCards(sortedData);
    }, errorHandler);

    // 3. Charger les tâches prioritaires
    const tasksRef = collection(db, 'tasks');
    const tasksQuery = query(
      tasksRef, 
      where('companyId', '==', userProfile.companyId),
      limit(20)
    );
    
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
      // On affiche les tâches non terminées, triées par date de création ou retard
      const filteredTasks = data
        .filter(t => t.status !== 'completed')
        .slice(0, 8);
      
      setTasks(filteredTasks);
      setIsLoading(false);
    }, errorHandler);

    // 4. Charger TOUS les clients de l'entreprise pour la recherche locale
    const clientsRef = collection(db, 'clients');
    const clientsQuery = query(clientsRef, where('companyId', '==', userProfile.companyId));
    
    const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];
      setAllClients(data);
    }, errorHandler);

    return () => {
      unsubscribeKpis();
      unsubscribeStatus();
      unsubscribeTasks();
      unsubscribeClients();
    };
  }, [userProfile?.companyId]);

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Attention, vous êtes sur de vouloir supprimer ?")) return;
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

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'tasks', id), { status });
    } catch (e) {
      console.error(e);
    }
  };

  // Filtrage local des résultats de recherche
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const normalizedQuery = searchQuery.toLowerCase();
    return allClients
      .filter(client => client.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 5); 
  }, [searchQuery, allClients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderIcon = (iconName: string) => {
    const props = { size: 20, className: "text-white" };
    switch (iconName) {
      case 'euro': return <Euro {...props} />;
      case 'target': return <Target {...props} />;
      case 'search': return <Search {...props} />;
      case 'file': return <FileText {...props} />;
      case 'user': return <User {...props} />;
      case 'trending-up': return <TrendingUp {...props} />;
      case 'pie-chart': return <PieChart {...props} />;
      case 'bar-chart': return <BarChart3 {...props} />;
      default: return <Euro {...props} />;
    }
  };

  if (hasPermissionError) {
    return (
      <div className="h-full w-full flex items-center justify-center p-10">
        <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center space-y-4 max-w-md">
          <AlertTriangle className="text-red-500 mx-auto" size={48} />
          <h2 className="text-lg font-bold text-red-900">Erreur de permission Firestore</h2>
          <p className="text-sm text-red-700">L'application ne peut pas lire les données. Veuillez vérifier que les règles de sécurité Firestore sont configurées sur votre console Firebase.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-gray-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Search Bar Section */}
      <div ref={searchRef} className="relative z-30">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              placeholder="Rechercher un client" 
              className="w-full pl-10 pr-4 py-2 border-b border-gray-200 focus:outline-none focus:border-gray-400 text-sm bg-white text-gray-800 placeholder-gray-400 font-medium"
            />
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && (searchQuery.length > 0 || searchResults.length >= 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            <div className="p-2 space-y-1">
              {searchResults.length > 0 ? (
                <>
                  {searchResults.map((client) => (
                    <button 
                      key={client.id}
                      onClick={() => onClientClick?.(client)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors group"
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-gray-900">{client.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-widest ${
                        client.status === 'Leads' ? 'bg-purple-100 text-purple-600' :
                        client.status === 'Prospect' ? 'bg-fuchsia-100 text-fuchsia-600' :
                        'bg-cyan-100 text-cyan-600'
                      }`}>
                        {client.status === 'Leads' ? 'Etudes à réaliser' : client.status}
                      </span>
                    </button>
                  ))}
                  <div className="h-px bg-gray-100 my-2 mx-4"></div>
                </>
              ) : searchQuery.length > 0 ? (
                <div className="py-6 text-center text-gray-400 text-sm font-medium">
                  Aucun client trouvé pour "{searchQuery}"
                </div>
              ) : null}

              {/* Add Client Button */}
              <div className="px-3 pb-3">
                <button 
                  onClick={() => {
                    onAddClientClick?.();
                    setShowSearchDropdown(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200/60 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
                >
                  <Plus size={16} className="text-gray-400" />
                  <span>Ajouter une fiche lead</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Financial KPI Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <button 
            onClick={() => setIsKPIOpen(!isKPIOpen)}
            className="w-full p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 bg-white transition-colors"
        >
            <h3 className="font-semibold text-gray-800">Liste des KPI financiers</h3>
            {isKPIOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>
        
        {isKPIOpen && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-gray-100 bg-white">
                {kpis.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-gray-400 text-sm italic">
                    Aucun KPI financier configuré.
                  </div>
                ) : kpis.map((kpi) => (
                    <div key={kpi.id} className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow bg-[#FBFBFB]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-[#A886D7] shadow-sm">
                                {renderIcon(kpi.iconName)}
                            </div>
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
                            <div className="text-right mt-1">
                                <span className="text-xs font-bold text-gray-900">{kpi.percentage}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-3">
             {statusCards.length === 0 ? (
               <div className="p-10 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs">
                 Statistiques vides
               </div>
             ) : statusCards.map((card) => {
                let bgClass = "bg-purple-100";
                let textClass = "text-purple-900";
                let arrowClass = "text-purple-700";
                
                if(card.color === 'fuchsia') { bgClass = "bg-[#FAE8FF]"; textClass = "text-fuchsia-900"; arrowClass = "text-fuchsia-700"; }
                if(card.color === 'blue') { bgClass = "bg-[#E0F2FE]"; textClass = "text-blue-900"; arrowClass = "text-blue-700"; }
                if(card.color === 'cyan') { bgClass = "bg-[#CFFAFE]"; textClass = "text-cyan-900"; arrowClass = "text-cyan-700"; }
                if(card.color === 'orange') { bgClass = "bg-[#FFEDD5]"; textClass = "text-orange-900"; arrowClass = "text-orange-700"; }

                return (
                    <div key={card.id} className={`${bgClass} rounded-xl p-4 flex flex-col justify-between relative group hover:shadow-md transition-all min-h-[95px] border border-white/50`}>
                        <div className="flex justify-between items-start">
                             <span className={`font-bold text-[11px] uppercase tracking-wider ${textClass}`}>{card.label}</span>
                             <div className="bg-white/60 p-1 rounded-md cursor-pointer hover:bg-white transition-colors">
                                <ArrowUpRight size={14} className={arrowClass} />
                             </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-900 mt-1">{card.count}</span>
                    </div>
                );
             })}
        </div>

        <div className="lg:col-span-9">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 h-full flex flex-col overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
                    <div>
                        <div className="flex items-center gap-3">
                           <h3 className="text-[18px] font-black text-gray-900 uppercase tracking-tight">Priorité des tâches & mémos</h3>
                           <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase tracking-widest">{tasks.length} actives</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-bold mt-1 flex items-center gap-2 uppercase tracking-widest">
                           <Clock size={12} className="text-gray-300" />
                           {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                          onClick={() => { setEditingTask(null); setIsAddTaskModalOpen(true); }}
                          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-[12px] font-black hover:bg-gray-50 text-gray-800 shadow-sm transition-all active:scale-95"
                        >
                            <Plus size={16} className="text-[#A886D7]" />
                            <span>AJOUTER UNE TÂCHE</span>
                        </button>
                        <button 
                          onClick={() => onNavigate?.('tasks')}
                          className="p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-900 active:scale-95"
                        >
                            <ArrowUpRight size={18} className="" />
                        </button>
                    </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {tasks.length === 0 ? (
                      <div className="py-20 text-center text-gray-400 font-medium border-2 border-dashed border-gray-50 rounded-[24px] bg-[#FBFBFB]">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-100 shadow-sm">
                           <CheckCircle2 size={32} />
                        </div>
                        <p className="text-[14px] font-bold text-gray-400">Toutes les tâches sont à jour ! 🎉</p>
                      </div>
                    ) : tasks.map((task, index) => (
                        <div key={task.id} className="group bg-white border border-gray-100 rounded-[20px] p-5 flex flex-col lg:flex-row lg:items-center justify-between hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/20 transition-all">
                            <div className="flex items-center space-x-5 mb-4 lg:mb-0">
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#FBFBFB] border border-gray-100 rounded-xl text-[12px] font-black text-gray-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                                        <h4 className="font-black text-gray-900 uppercase text-[13.5px] group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                                        <span className="px-2.5 py-1 text-[9px] font-black bg-gray-50 border border-gray-100 text-gray-400 rounded-lg uppercase tracking-tight">
                                           {task.type}
                                        </span>
                                        {task.statusLabel && (
                                            <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${
                                                task.tagColor === 'purple' ? 'bg-purple-100 text-purple-600' :
                                                task.tagColor === 'blue' ? 'bg-cyan-100 text-cyan-600' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                                {task.statusLabel}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1.5">
                                       <div className="flex items-center gap-1.5">
                                          <img src={task.collaborator.avatar} className="w-5 h-5 rounded-full border border-white shadow-sm" alt="" />
                                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{task.collaborator.name}</span>
                                       </div>
                                       <span className={`text-[11px] font-black uppercase tracking-widest ${task.isLate ? 'text-red-500' : 'text-gray-300'}`}>
                                          {task.date || 'Sans échéance'}
                                       </span>
                                       {task.subtitle && <span className="text-[10px] font-black text-indigo-300 uppercase tracking-tight">• {task.subtitle}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6 w-full lg:w-auto justify-between lg:justify-end">
                                <div className="min-w-[180px]">
                                  {task.statusType === 'progress' ? (
                                      <div className="flex items-center gap-3">
                                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                              <div className={`h-full rounded-full transition-all duration-1000 ${task.tagColor === 'purple' ? 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.4)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'}`} style={{ width: `${task.progress}%` }}></div>
                                          </div>
                                          <span className={`text-[11px] font-black ${task.tagColor === 'purple' ? 'text-fuchsia-500' : 'text-blue-500'}`}>{task.progress}%</span>
                                      </div>
                                  ) : (
                                      <div className="flex bg-[#F8F9FA] rounded-full border border-gray-200 p-0.5 w-full">
                                          <button 
                                            onClick={() => updateTaskStatus(task.id, 'pending')}
                                            className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-full transition-all ${task.status === 'pending' ? 'bg-white shadow-sm text-gray-800 border border-gray-100' : 'text-gray-300 hover:text-gray-600'}`}
                                          >
                                             À faire
                                          </button>
                                          <button 
                                            onClick={() => updateTaskStatus(task.id, 'in-progress')}
                                            className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-full transition-all ${task.status === 'in-progress' ? 'bg-white shadow-sm text-gray-800 border border-gray-100' : 'text-gray-300 hover:text-gray-600'}`}
                                          >
                                             En cours
                                          </button>
                                          <button 
                                            onClick={() => updateTaskStatus(task.id, 'completed')}
                                            className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-full transition-all ${task.status === 'completed' ? 'bg-white shadow-sm text-gray-800 border border-gray-100' : 'text-gray-300 hover:text-gray-600'}`}
                                          >
                                             Terminé
                                          </button>
                                      </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-1 relative shrink-0">
                                    {task.isLate && (
                                      <div className="p-2 bg-red-50 text-red-500 rounded-lg animate-pulse">
                                         <AlertTriangle size={16} />
                                      </div>
                                    )}
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === task.id ? null : task.id); }}
                                      className={`p-2 rounded-lg transition-all ${activeMenuId === task.id ? 'bg-gray-100 text-gray-900' : 'text-gray-300 hover:bg-gray-50 hover:text-gray-600'}`}
                                    >
                                       <MoreVertical size={20} />
                                    </button>

                                    {activeMenuId === task.id && (
                                      <>
                                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
                                        <div className="absolute right-0 top-12 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 w-48 animate-in fade-in zoom-in-95 duration-150">
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

      <div className="w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-bold text-gray-800">Agenda personnel</h3>
                        <div className="relative">
                            <select className="text-xs bg-white border border-gray-200 rounded px-3 py-1.5 text-gray-700 outline-none appearance-none pr-8 font-bold focus:border-gray-400 shadow-sm">
                                <option>S-12 (Courante)</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <button 
                      onClick={() => onNavigate?.('agenda')}
                      className="p-2 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors active:scale-95"
                    >
                        <ArrowUpRight size={18} className="text-gray-400" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <div className="grid grid-cols-5 gap-4 min-w-[800px]">
                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day, i) => (
                            <div key={i} className="text-center pb-3 border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
                        ))}
                        {[0, 1, 2, 3, 4].map((colIndex) => (
                            <div key={colIndex} className="pt-2 space-y-2">
                                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-white hover:shadow-md transition-all group border-dashed">
                                    <div className="text-[9px] text-gray-400 mb-1 font-bold flex justify-between uppercase"><span>09:00</span><Plus size={10} className="text-gray-300" /></div>
                                    <div className="text-[11px] font-bold text-gray-300 italic">Libre</div>
                                </div>
                            </div>
                        ))}
                    </div>
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
