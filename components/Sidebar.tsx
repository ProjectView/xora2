import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Book, 
  Users, 
  Briefcase, 
  Hammer, 
  UserSquare, 
  FileText, 
  Box, 
  Calendar, 
  BarChart2, 
  Building2, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  ChevronsLeft
} from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onLogout }) => {
  const [isAnnuaireOpen, setIsAnnuaireOpen] = useState(true);

  const LOGO_URL = "https://framerusercontent.com/images/BrlQcPpho2hjJ0qjdKGIdbfXY.png?width=1024&height=276";

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, page: 'dashboard' as Page },
    { id: 'tasks', label: 'Tâches & mémo', icon: CheckSquare, page: 'tasks' as Page },
  ];

  const directoryItems = [
    { id: 'clients', label: 'Clients & prospects', icon: Users, page: 'directory' as Page },
    { id: 'suppliers', label: 'Fournisseurs', icon: Building2, page: 'suppliers' as Page },
    { id: 'artisans', label: 'Artisans', icon: Hammer, page: 'artisans' as Page },
    { id: 'institutional', label: 'Institutionnel', icon: UserSquare, page: 'institutional' as Page },
    { id: 'prescriber', label: 'Prescripteur', icon: FileText, page: 'prescriber' as Page },
    { id: 'subcontractor', label: 'Sous traitant', icon: Briefcase, page: 'subcontractor' as Page },
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
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col font-sans text-gray-600 overflow-y-auto hide-scrollbar shrink-0">
      {/* Header Logo Official */}
      <div className="p-6 pb-8 flex items-center justify-between">
        <img src={LOGO_URL} className="h-7 w-auto" alt="Xora Logo" />
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <ChevronsLeft size={18} className="text-gray-300" />
        </button>
      </div>

      {/* Main Menu */}
      <div className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.page)}
            className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm transition-all ${
              isActive(item.page) 
                ? 'bg-gray-100 text-gray-900 font-bold border-l-4 border-gray-900' 
                : 'hover:bg-gray-50 text-gray-500 font-medium'
            }`}
          >
            <item.icon size={18} className={`mr-3 ${isActive(item.page) ? 'text-gray-900' : 'text-gray-300'}`} />
            {item.label}
          </button>
        ))}

        {/* Annuaire Group */}
        <div className="pt-2">
          <button
            onClick={() => setIsAnnuaireOpen(!isAnnuaireOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm hover:bg-gray-50 text-gray-900 font-bold"
          >
            <div className="flex items-center">
              <Book size={18} className="mr-3 text-gray-900" />
              Annuaire
            </div>
            {isAnnuaireOpen ? <ChevronDown size={16} className="text-gray-300" /> : <ChevronRight size={16} className="text-gray-300" />}
          </button>

          {isAnnuaireOpen && (
            <div className="mt-1 space-y-1">
              {directoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.page)}
                  className={`w-full flex items-center pl-10 pr-3 py-2 rounded-xl text-sm transition-all ${
                    isActive(item.page)
                      ? 'bg-gray-50 text-gray-900 font-bold'
                      : 'hover:bg-gray-50 text-gray-500 font-medium hover:text-gray-700'
                  }`}
                >
                  <item.icon size={16} className={`mr-3 ${isActive(item.page) ? 'text-gray-900' : 'text-gray-300'}`} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Items */}
        <div className="pt-2 border-t border-gray-50 mt-2 space-y-1">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.page)}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive(item.page)
                  ? 'bg-gray-100 text-gray-900 font-bold border-l-4 border-gray-900'
                  : 'hover:bg-gray-50 text-gray-500 font-medium hover:text-gray-700'
              }`}
            >
              <item.icon size={18} className={`mr-3 ${isActive(item.page) ? 'text-gray-900' : 'text-gray-300'}`} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 mt-auto border-t border-gray-50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center px-3 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-all group"
        >
          Se déconnecter
          <LogOut size={16} className="ml-auto opacity-40 group-hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;