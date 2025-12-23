import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { FinancialKPI, StatusCard, Task } from '../types';

interface DashboardProps {
  userProfile?: any;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile }) => {
  const [isKPIOpen, setIsKPIOpen] = useState(true);
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);
  const [statusCards, setStatusCards] = useState<StatusCard[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.companyId) return;

    // 1. Charger les KPIs financiers
    const kpisRef = collection(db, 'kpis');
    const kpisQuery = query(kpisRef, where('companyId', '==', userProfile.companyId));
    
    const unsubscribeKpis = onSnapshot(kpisQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FinancialKPI[];
      // On trie manuellement si nécessaire ou on laisse Firestore faire
      setKpis(data.length > 0 ? data : []);
    });

    // 2. Charger les compteurs de statut (Status Cards)
    const statusRef = collection(db, 'status_overview');
    const statusQuery = query(statusRef, where('companyId', '==', userProfile.companyId), orderBy('order', 'asc'));
    
    const unsubscribeStatus = onSnapshot(statusQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StatusCard[];
      setStatusCards(data);
    });

    // 3. Charger les tâches prioritaires
    const tasksRef = collection(db, 'tasks');
    // On récupère les tâches en cours, limitées à 6 pour le dashboard
    const tasksQuery = query(
      tasksRef, 
      where('companyId', '==', userProfile.companyId),
      where('status', '!=', 'completed'),
      limit(6)
    );
    
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
      setTasks(data);
      setIsLoading(false);
    });

    return () => {
      unsubscribeKpis();
      unsubscribeStatus();
      unsubscribeTasks();
    };
  }, [userProfile?.companyId]);

  // Helper to render icon for Financial KPI
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'euro': return <Euro size={20} className="text-white" />;
      case 'search': return <Search size={20} className="text-white" />;
      case 'file': return <FileText size={20} className="text-white" />;
      case 'user': return <User size={20} className="text-white" />;
      default: return <Euro size={20} className="text-white" />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-gray-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un client" 
            className="w-full pl-10 pr-4 py-2 border-b border-gray-200 focus:outline-none focus:border-gray-400 text-sm bg-white text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Financial KPI Section - Collapsible */}
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
                    Aucun KPI financier configuré pour votre agence.
                  </div>
                ) : kpis.map((kpi) => (
                    <div key={kpi.id} className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow bg-[#FBFBFB]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-gray-800 shadow-sm">
                                {renderIcon(kpi.iconName)}
                            </div>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-tight">{kpi.label}</span>
                        </div>
                        <div>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                                <span className="text-xs text-gray-400 font-medium">/ {kpi.target}</span>
                            </div>
                            
                            <div className="mt-3 relative h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="absolute top-0 left-0 h-full bg-gray-800 rounded-full transition-all duration-1000" 
                                    style={{ width: `${kpi.percentage}%` }}
                                ></div>
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

      {/* Main Content Grid: Status Cards and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Status Cards Stack */}
        <div className="lg:col-span-3 flex flex-col gap-3">
             {statusCards.length === 0 ? (
               <div className="p-10 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs">
                 Statistiques de dossiers vides
               </div>
             ) : statusCards.map((card) => {
                let bgClass = "bg-purple-100";
                let textClass = "text-purple-900";
                let arrowClass = "text-purple-700";
                
                if(card.color === 'fuchsia') { 
                    bgClass = "bg-[#FAE8FF]"; 
                    textClass = "text-fuchsia-900";
                    arrowClass = "text-fuchsia-700";
                }
                if(card.color === 'blue') { 
                    bgClass = "bg-[#E0F2FE]"; 
                    textClass = "text-blue-900"; 
                    arrowClass = "text-blue-700";
                }
                if(card.color === 'cyan') { 
                    bgClass = "bg-[#CFFAFE]"; 
                    textClass = "text-cyan-900"; 
                    arrowClass = "text-cyan-700";
                }
                if(card.color === 'orange') { 
                    bgClass = "bg-[#FFEDD5]"; 
                    textClass = "text-orange-900"; 
                    arrowClass = "text-orange-700";
                }

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

        {/* Right Column: Tasks Only */}
        <div className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Priorité des tâches & mémos</h3>
                        <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 text-gray-800 shadow-sm transition-colors">
                            <Plus size={16} />
                            <span>Ajouter</span>
                        </button>
                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                            <ArrowUpRight size={18} className="text-gray-400 transform rotate-45" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {tasks.length === 0 ? (
                      <div className="py-20 text-center text-gray-400 font-medium border-2 border-dashed border-gray-50 rounded-xl">
                        Toutes les tâches sont à jour ! 🎉
                      </div>
                    ) : tasks.map((task, index) => (
                        <div key={task.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors bg-[#FBFBFB]">
                            {/* Left Part: ID + Info */}
                            <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-md text-sm font-bold text-gray-400">
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                        <h4 className="font-bold text-gray-900 mr-2 uppercase text-[13px]">{task.title}</h4>
                                        {task.tag && (
                                            <span className={`px-2 py-0.5 text-[9px] rounded-full font-black uppercase tracking-widest ${
                                                task.tagColor === 'blue' ? 'bg-cyan-100 text-cyan-800' :
                                                task.tagColor === 'purple' ? 'bg-fuchsia-100 text-fuchsia-800' :
                                                task.tagColor === 'gray' ? 'bg-gray-800 text-white' : 'bg-gray-100'
                                            }`}>
                                                {task.tag}
                                            </span>
                                        )}
                                    </div>
                                    {task.isLate && (
                                        <p className="text-[11px] text-red-500 font-bold mt-1 uppercase">{task.date}</p>
                                    )}
                                    {!task.isLate && task.date && (
                                        <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase">{task.date}</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Part: Status + Actions */}
                            <div className="flex items-center space-x-4 w-full lg:w-auto justify-between lg:justify-end">
                                {task.statusType === 'progress' ? (
                                    <div className="flex items-center space-x-4 flex-1 lg:flex-none min-w-[180px]">
                                        <div className="w-full lg:w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${task.tagColor === 'purple' ? 'bg-fuchsia-500' : 'bg-blue-500'}`} 
                                                style={{ width: `${task.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-xs font-black ${task.tagColor === 'purple' ? 'text-fuchsia-500' : 'text-blue-500'}`}>
                                          {task.progress}%
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex bg-gray-200 rounded-full border border-gray-100 p-0.5">
                                        <button className="px-3 py-1 text-[10px] font-black uppercase bg-white rounded-full shadow-sm text-gray-900 border border-gray-50">Non commencé</button>
                                        <button className="px-3 py-1 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">En cours</button>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2 pl-4 lg:border-l border-gray-200">
                                    {task.isLate && (
                                        <div className="relative p-1">
                                            <AlertTriangle size={18} className="text-gray-300" />
                                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                        </div>
                                    )}
                                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                        <MoreVertical size={18} className="text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Agenda Section - Full Width */}
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
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                        <ArrowUpRight size={18} className="text-gray-400 transform rotate-45" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="grid grid-cols-5 gap-4 min-w-[800px]">
                        {/* Headers */}
                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day, i) => (
                            <div key={i} className="text-center pb-3 border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                        
                        {/* Columns */}
                        {[0, 1, 2, 3, 4].map((colIndex) => (
                            <div key={colIndex} className="pt-2 space-y-2">
                                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-white hover:shadow-md transition-all group border-dashed">
                                    <div className="text-[9px] text-gray-400 mb-1 font-bold flex justify-between uppercase">
                                        <span>09:00</span>
                                        <Plus size={10} className="text-gray-300" />
                                    </div>
                                    <div className="text-[11px] font-bold text-gray-300 italic">Libre</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
};

export default Dashboard;