
import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Book, 
  Briefcase, 
  Box, 
  Calendar, 
  BarChart2, 
  LogOut, 
  ChevronsLeft,
  ChevronRight
} from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  setCurrentPage, 
  onLogout,
  isCollapsed,
  setIsCollapsed
}) => {
  const LOGO_URL = "https://framerusercontent.com/images/BrlQcPpho2hjJ0qjdKGIdbfXY.png?width=1024&height=276";
  const MINI_LOGO = "https://framerusercontent.com/images/7u9hI9mH9N3V2H2B3v4V5z.png"; // Placeholder pour logo réduit si existant

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, page: 'dashboard' as Page },
    { id: 'tasks', label: 'Tâches & mémo', icon: CheckSquare, page: 'tasks' as Page },
    { id: 'directory', label: 'Annuaire', icon: Book, page: 'directory' as Page },
  ];

  const bottomItems = [
    { id: 'projects', label: 'Suivi projets', icon: Briefcase, page: 'projects' as Page },
    { id: 'articles', label: 'Articles', icon: Box, page: 'articles' as Page },
    { id: 'agenda', label: 'Agenda', icon: Calendar, page: 'agenda' as Page },
    { id: 'kpi', label: 'KPI', icon: BarChart2, page: 'kpi' as Page },
    { id: 'company', label: 'Notre entreprise', icon: Briefcase, page: 'company' as Page },
  ];

  const isActive = (pageName: string) => currentPage === pageName;

  return (
    <div className={`${isCollapsed ? 'w-24' : 'w-72'} h-screen bg-white border-r border-gray-100 flex flex-col font-sans text-gray-600 transition-all duration-300 ease-in-out z-50 shrink-0 shadow-sm overflow-hidden`}>
      
      {/* Header Logo & Collapse Toggle */}
      <div className={`p-6 pb-10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <img src={LOGO_URL} className="h-8 w-auto animate-in fade-in duration-500" alt="Xora Logo" />
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 text-gray-400 hover:text-gray-900 ${isCollapsed ? 'rotate-180' : ''}`}
        >
          <ChevronsLeft size={22} />
        </button>
      </div>

      {/* Main Menu Scrollable Area */}
      <div className="flex-1 px-4 space-y-8 overflow-y-auto hide-scrollbar">
        
        {/* Navigation Section */}
        <div className="space-y-1.5">
          {!isCollapsed && <p className="px-3 text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 animate-in fade-in">Principal</p>}
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.page)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3.5 rounded-2xl transition-all duration-200 group relative ${
                isActive(item.page) 
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                  : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900'
              }`}
            >
              <item.icon 
                size={22} 
                className={`${isCollapsed ? 'm-0' : 'mr-4'} ${isActive(item.page) ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`} 
              />
              {!isCollapsed && (
                <span className={`text-[15px] font-bold whitespace-nowrap animate-in slide-in-from-left-2`}>
                  {item.label}
                </span>
              )}
              {isCollapsed && isActive(item.page) && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gray-900 rounded-l-full" />
              )}
            </button>
          ))}
        </div>

        {/* Administration Section */}
        <div className="space-y-1.5">
          {!isCollapsed && <p className="px-3 text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 animate-in fade-in">Gestion</p>}
          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.page)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3.5 rounded-2xl transition-all duration-200 group relative ${
                isActive(item.page)
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                  : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900'
              }`}
            >
              <item.icon 
                size={22} 
                className={`${isCollapsed ? 'm-0' : 'mr-4'} ${isActive(item.page) ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`} 
              />
              {!isCollapsed && (
                <span className="text-[15px] font-bold whitespace-nowrap animate-in slide-in-from-left-2">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 mt-auto border-t border-gray-50">
        <button 
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group overflow-hidden`}
        >
          {!isCollapsed && <span className="text-[15px] font-bold whitespace-nowrap">Se déconnecter</span>}
          <LogOut size={20} className={`${isCollapsed ? '' : 'ml-auto'} opacity-40 group-hover:opacity-100 transition-opacity`} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
