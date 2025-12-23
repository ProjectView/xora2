import React, { useState } from 'react';
import { 
  Box, 
  Download, 
  Upload, 
  Plus, 
  Search, 
  ChevronDown, 
  Eye, 
  MoreHorizontal, 
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  PenSquare,
  Trash2
} from 'lucide-react';
import { ARTICLES } from '../constants';

const Articles: React.FC = () => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-gray-800">
            <Box size={24} />
            <h2 className="text-xl font-bold">Liste des articles <span className="text-gray-400 text-lg font-normal">(1429)</span></h2>
        </div>
        
        <div className="flex items-center space-x-3">
             <button className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Download size={16} className="mr-2" />
                Exporter
            </button>
            <button className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Upload size={16} className="mr-2" />
                Importer
            </button>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-50">
                <Plus size={16} className="mr-2" />
                Ajouter un article
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
                type="text" 
                placeholder="Rechercher" 
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-800"
            />
          </div>
          
          {['Métier', 'Famille', 'Gamme', 'Fournisseur'].map((filter) => (
             <div key={filter} className="md:col-span-2.25 relative flex-1">
                 <button className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                    <span className="truncate">{filter}</span>
                    <ChevronDown size={14} />
                 </button>
             </div>
          ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col flex-1">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-medium">
                          <th className="px-6 py-4">Métier</th>
                          <th className="px-6 py-4">Famille</th>
                          <th className="px-6 py-4">Gamme</th>
                          <th className="px-6 py-4">Nom fournisseur</th>
                          <th className="px-6 py-4">Référence</th>
                          <th className="px-6 py-4">Prix public HT</th>
                          <th className="px-6 py-4">Prix de vente TTC</th>
                          <th className="px-6 py-4 text-right">Action rapide</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {ARTICLES.map((article) => (
                          <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-800">{article.metier}</td>
                              <td className="px-6 py-4 text-sm text-gray-800">{article.famille}</td>
                              <td className="px-6 py-4 text-sm text-gray-800">{article.gamme}</td>
                              <td className="px-6 py-4 text-sm text-gray-800 font-medium">{article.fournisseur}</td>
                              <td className="px-6 py-4 text-sm text-gray-800">{article.reference}</td>
                              <td className="px-6 py-4 text-sm text-gray-800">{article.prixPublicHT}</td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">{article.prixVenteTTC}</td>
                              <td className="px-6 py-4">
                                  <div className="flex justify-end space-x-2 relative">
                                      <button className="p-1.5 border border-gray-200 rounded hover:bg-gray-100 text-gray-500">
                                          <Eye size={16} />
                                      </button>
                                      <button 
                                        onClick={() => setActiveMenuId(activeMenuId === article.id ? null : article.id)}
                                        className="p-1.5 border border-gray-200 rounded hover:bg-gray-100 text-gray-500"
                                      >
                                          <MoreHorizontal size={16} />
                                      </button>
                                      
                                      {/* Popup Menu */}
                                      {activeMenuId === article.id && (
                                          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48 py-1 animate-in fade-in zoom-in duration-100">
                                              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                                                  <PenSquare size={14} className="mr-2" />
                                                  Modifier l'article
                                              </button>
                                              <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center">
                                                  <Trash2 size={14} className="mr-2" />
                                                  Supprimer l'article
                                              </button>
                                          </div>
                                      )}
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500 bg-white mt-auto">
                <div>Actuellement <span className="font-semibold text-gray-900">1 à 11 sur 320</span> résultats</div>
                <div className="flex items-center space-x-2">
                    <button className="p-1 border border-gray-200 rounded hover:bg-gray-50"><ChevronsLeft size={16} /></button>
                    <button className="p-1 border border-gray-200 rounded hover:bg-gray-50"><ChevronLeft size={16} /></button>
                    <button className="w-8 h-8 bg-gray-800 text-white rounded text-xs font-medium">1</button>
                    <button className="w-8 h-8 border border-gray-200 rounded hover:bg-gray-50 text-xs font-medium">2</button>
                    <button className="w-8 h-8 border border-gray-200 rounded hover:bg-gray-50 text-xs font-medium">3</button>
                    <span>...</span>
                    <button className="w-8 h-8 border border-gray-200 rounded hover:bg-gray-50 text-xs font-medium">36</button>
                    <button className="p-1 border border-gray-200 rounded hover:bg-gray-50"><ChevronRight size={16} /></button>
                    <button className="px-2 border border-gray-200 rounded hover:bg-gray-50"><ChevronsLeft size={16} className="rotate-180" /></button>
                </div>
           </div>
      </div>
    </div>
  );
};

export default Articles;