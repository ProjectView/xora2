
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Box, 
  Upload as UploadIcon, 
  Plus, 
  Search, 
  ChevronDown, 
  Eye, 
  MoreHorizontal, 
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  PenSquare,
  Trash2,
  Loader2,
  CheckCircle2,
  Filter,
  Euro,
  X
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc, writeBatch, serverTimestamp } from '@firebase/firestore';
import { Article } from '../types';
import AddArticleModal from './AddArticleModal';

interface ArticlesProps {
  userProfile?: any;
}

const ITEMS_PER_PAGE = 15;

const Articles: React.FC<ArticlesProps> = ({ userProfile }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // États des filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMainTab, setActiveMainTab] = useState<'Tous' | 'Electromenager' | 'Sanitaire'>('Tous');
  const [rubriqueFilter, setRubriqueFilter] = useState('');
  const [familleFilter, setFamilleFilter] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  
  // UI states
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<'rubrique' | 'famille' | 'price' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userProfile?.companyId) return;

    const articlesRef = collection(db, 'articles');
    const q = query(
      articlesRef, 
      where('companyId', '==', userProfile.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articlesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
      
      articlesList.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setArticles(articlesList);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.companyId]);

  // Fermer les dropdowns au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset de la page quand un filtre change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeMainTab, searchQuery, rubriqueFilter, familleFilter, minPrice, maxPrice]);

  // Extraction des valeurs uniques pour les filtres
  const uniqueRubriques = useMemo(() => {
    const set = new Set(articles.map(a => a.rubrique).filter(Boolean));
    return Array.from(set).sort();
  }, [articles]);

  const uniqueFamilles = useMemo(() => {
    const filteredByRubrique = articles.filter(a => !rubriqueFilter || a.rubrique === rubriqueFilter);
    const set = new Set(filteredByRubrique.map(a => a.famille).filter(Boolean));
    return Array.from(set).sort();
  }, [articles, rubriqueFilter]);

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article du catalogue ?")) return;
    try {
      await deleteDoc(doc(db, 'articles', id));
      setActiveMenuId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile?.companyId) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);
      const batch = writeBatch(db);
      let count = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith(';;') || line.toLowerCase().includes('métier;rubrique')) continue;
        const cols = line.split(';');
        if (cols.length < 6) continue;
        const parsePrice = (val: string) => {
            if (!val) return 0;
            const cleaned = val.replace(/[^\d.,]/g, '').replace(',', '.');
            return parseFloat(cleaned) || 0;
        };
        const articleRef = doc(collection(db, 'articles'));
        batch.set(articleRef, {
          metier: cols[0]?.trim() || 'Cuisine',
          rubrique: cols[1]?.trim() || 'Général',
          famille: cols[2]?.trim() || 'Non classé',
          collection: cols[3]?.trim() || '',
          descriptif: cols[4]?.trim() || '',
          prixMiniTTC: parsePrice(cols[5]),
          prixMaxiTTC: parsePrice(cols[6]),
          companyId: userProfile.companyId,
          createdBy: userProfile.name,
          createdAt: serverTimestamp()
        });
        count++;
        if (count >= 490) break; 
      }
      try {
        await batch.commit();
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch (err) {
        console.error(err);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const counts = {
    Tous: articles.length,
    Electromenager: articles.filter(a => a.rubrique === 'Electromenager').length,
    Sanitaire: articles.filter(a => a.rubrique === 'Sanitaire').length
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Filtre Onglet Principal
      const matchesTab = activeMainTab === 'Tous' || article.rubrique === activeMainTab;
      
      // Filtre Recherche (Nom, Rubrique, Famille)
      const query = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        article.descriptif?.toLowerCase().includes(query) ||
        article.rubrique?.toLowerCase().includes(query) ||
        article.famille?.toLowerCase().includes(query);
      
      // Filtre Dropdown Rubrique
      const matchesRubrique = !rubriqueFilter || article.rubrique === rubriqueFilter;
      
      // Filtre Dropdown Famille
      const matchesFamille = !familleFilter || article.famille === familleFilter;
      
      // Filtre Prix (sur le prix maxi conseillé)
      const matchesMinPrice = minPrice === '' || (article.prixMaxiTTC >= minPrice);
      const matchesMaxPrice = maxPrice === '' || (article.prixMaxiTTC <= maxPrice);

      return matchesTab && matchesSearch && matchesRubrique && matchesFamille && matchesMinPrice && matchesMaxPrice;
    });
  }, [articles, activeMainTab, searchQuery, rubriqueFilter, familleFilter, minPrice, maxPrice]);

  // Logique de pagination
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || 1;
  const limitedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredArticles.length);

  const resetFilters = () => {
    setSearchQuery('');
    setRubriqueFilter('');
    setFamilleFilter('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-[calc(100vh-64px)] flex flex-col font-sans">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />

      {/* BLOC 1 : Titre et Filtres Principaux */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-1">
             <div className="flex items-center space-x-2 mr-4">
                 <Box size={20} className="text-gray-700" />
                 <span className="font-bold text-lg text-gray-900">Articles</span>
                 <span className="text-gray-400 text-sm font-medium">({counts[activeMainTab]})</span>
             </div>
             
             <div className="flex bg-gray-200 rounded-full p-1 space-x-1">
                {(['Tous', 'Electromenager', 'Sanitaire'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveMainTab(tab)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            activeMainTab === tab 
                            ? 'bg-gray-800 text-white shadow-sm' 
                            : 'text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                        {tab === 'Electromenager' ? 'Électroménager' : tab} <span className="opacity-70 ml-1">({counts[tab]})</span>
                    </button>
                ))}
             </div>
        </div>

        {importSuccess && <div className="flex items-center gap-1.5 text-green-600 text-[11px] font-bold animate-in fade-in slide-in-from-right-2"><CheckCircle2 size={14} /> Importation réussie !</div>}
      </div>

      {/* BLOC 2 : Barre de Recherche et Filtres Opérationnels */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center" ref={dropdownRef}>
        <div className="md:col-span-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
              type="text" 
              placeholder="Rechercher un article, famille..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-gray-400 text-gray-800 shadow-sm transition-all"
          />
        </div>
        
        {/* Dropdown Rubrique */}
        <div className="md:col-span-2 relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'rubrique' ? null : 'rubrique')}
            className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-md text-sm transition-all shadow-sm ${rubriqueFilter ? 'border-gray-900 text-gray-900 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="truncate">{rubriqueFilter || 'Rubrique'}</span>
            <ChevronDown size={14} className={`transition-transform ${openDropdown === 'rubrique' ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown === 'rubrique' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-30 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <button onClick={() => {setRubriqueFilter(''); setOpenDropdown(null);}} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-400 italic">Toutes les rubriques</button>
              {uniqueRubriques.map(rub => (
                <button key={rub} onClick={() => {setRubriqueFilter(rub); setOpenDropdown(null);}} className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 ${rubriqueFilter === rub ? 'bg-gray-50 font-bold text-gray-900' : 'text-gray-600'}`}>{rub}</button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown Famille */}
        <div className="md:col-span-2 relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'famille' ? null : 'famille')}
            className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-md text-sm transition-all shadow-sm ${familleFilter ? 'border-gray-900 text-gray-900 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="truncate">{familleFilter || 'Famille'}</span>
            <ChevronDown size={14} className={`transition-transform ${openDropdown === 'famille' ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown === 'famille' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-30 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <button onClick={() => {setFamilleFilter(''); setOpenDropdown(null);}} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-400 italic">Toutes les familles</button>
              {uniqueFamilles.map(fam => (
                <button key={fam} onClick={() => {setFamilleFilter(fam); setOpenDropdown(null);}} className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 ${familleFilter === fam ? 'bg-gray-50 font-bold text-gray-900' : 'text-gray-600'}`}>{fam}</button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown Prix */}
        <div className="md:col-span-2 relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
            className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-md text-sm transition-all shadow-sm ${(minPrice !== '' || maxPrice !== '') ? 'border-gray-900 text-gray-900 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="truncate">Prix</span>
            <Euro size={14} />
          </button>
          {openDropdown === 'price' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-30 p-4 animate-in fade-in zoom-in-95 duration-150 min-w-[200px]">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min €" 
                      value={minPrice} 
                      onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:border-gray-400 outline-none"
                    />
                    <span className="text-gray-300">-</span>
                    <input 
                      type="number" 
                      placeholder="Max €" 
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:border-gray-400 outline-none"
                    />
                  </div>
                  <div className="flex justify-between gap-2">
                    <button onClick={() => {setMinPrice(''); setMaxPrice('');}} className="text-[10px] font-bold text-red-500 hover:underline">Réinitialiser</button>
                    <button onClick={() => setOpenDropdown(null)} className="text-[10px] font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">Appliquer</button>
                  </div>
                </div>
            </div>
          )}
        </div>

        <div className="md:col-span-3 flex justify-end gap-2">
            {(searchQuery || rubriqueFilter || familleFilter || minPrice !== '' || maxPrice !== '') && (
              <button onClick={resetFilters} className="p-2.5 bg-white border border-gray-200 rounded-md text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                <X size={16} />
              </button>
            )}
            <button onClick={handleImportClick} disabled={isImporting} className="flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                {isImporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <UploadIcon size={16} className="mr-2" />}
                Import
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200">
                <Plus size={18} className="mr-2" />
                Ajouter
            </button>
        </div>
      </div>

      {/* BLOC 3 : Le Tableau */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden relative shadow-sm min-h-[500px] flex flex-col">
          {(isLoading || isImporting) ? (
            <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <Box size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Aucun article trouvé pour ces filtres.</p>
              <button onClick={resetFilters} className="mt-2 text-indigo-600 font-bold text-xs hover:underline">Réinitialiser les filtres</button>
            </div>
          ) : null}

          <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                          <th className="px-6 py-4">Nom</th>
                          <th className="px-6 py-4">Famille</th>
                          <th className="px-6 py-4">Rubrique</th>
                          <th className="px-6 py-4 text-center">Prix Mini</th>
                          <th className="px-6 py-4 text-center">Prix Maxi</th>
                          <th className="px-6 py-4 text-right">Action rapide</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {limitedArticles.map((article) => (
                          <tr key={article.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                              <td className="px-6 py-4 text-sm font-bold text-gray-900 max-w-[250px] truncate">{article.descriptif}</td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[11px] font-extrabold uppercase tracking-tight">
                                  {article.famille}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-gray-900">{article.rubrique}</td>
                              <td className="px-6 py-4 text-center text-sm font-black text-gray-900">{article.prixMiniTTC?.toLocaleString()} €</td>
                              <td className="px-6 py-4 text-center text-sm font-black text-gray-900">{article.prixMaxiTTC?.toLocaleString()} €</td>
                              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-end space-x-2 relative">
                                      <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400 shadow-sm transition-all"><Eye size={16} /></button>
                                      <button 
                                        onClick={() => setActiveMenuId(activeMenuId === article.id ? null : article.id)}
                                        className={`p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400 shadow-sm transition-all ${activeMenuId === article.id ? 'bg-gray-100 text-gray-900' : ''}`}
                                      ><MoreHorizontal size={16} /></button>
                                      {activeMenuId === article.id && (
                                          <>
                                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                                            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 w-40 py-2 animate-in fade-in zoom-in-95 duration-150">
                                                <button className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 hover:bg-gray-50 flex items-center"><PenSquare size={14} className="mr-2" /> Modifier</button>
                                                <button onClick={() => handleDeleteArticle(article.id)} className="w-full text-left px-4 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50 flex items-center"><Trash2 size={14} className="mr-2" /> Supprimer</button>
                                            </div>
                                          </>
                                      )}
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {/* Pied de page style Annuaire */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400 bg-white">
                <div>
                  Actuellement <span className="font-bold text-gray-900">{startIndex} à {endIndex} sur {filteredArticles.length}</span> résultats
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-30"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-30"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    <button className="w-7 h-7 bg-gray-900 text-white rounded-md text-xs font-bold shadow-md">
                      {currentPage}
                    </button>
                    
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-30"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button 
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-1 border border-gray-200 rounded-md hover:bg-gray-50 rotate-180 disabled:opacity-30"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                </div>
           </div>
      </div>

      <AddArticleModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} userProfile={userProfile} />
    </div>
  );
};

export default Articles;
