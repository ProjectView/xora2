
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Download, 
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
  CheckCircle2
} from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { collection, query, where, onSnapshot, doc, deleteDoc, writeBatch, serverTimestamp } from '@firebase/firestore';
import { Article } from '../types';
import AddArticleModal from './AddArticleModal';

interface ArticlesProps {
  userProfile?: any;
}

const Articles: React.FC<ArticlesProps> = ({ userProfile }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userProfile?.companyId) return;

    const articlesRef = collection(db, 'articles');
    // On enlève le orderBy côté serveur pour éviter de requérir un index composite complexe
    const q = query(
      articlesRef, 
      where('companyId', '==', userProfile.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articlesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
      
      // Tri manuel côté client par date de création décroissante
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

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article du catalogue ?")) return;
    try {
      await deleteDoc(doc(db, 'articles', id));
      setActiveMenuId(null);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la suppression.");
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

        const metier = cols[0]?.trim();
        const rubrique = cols[1]?.trim();
        const famille = cols[2]?.trim();
        const collectionName = cols[3]?.trim();
        const descriptif = cols[4]?.trim();
        
        const parsePrice = (val: string) => {
            if (!val) return 0;
            const cleaned = val.replace(/[^\d.,]/g, '').replace(',', '.');
            return parseFloat(cleaned) || 0;
        };

        const prixMini = parsePrice(cols[5]);
        const prixMaxi = parsePrice(cols[6]);

        if (!famille && !descriptif) continue;

        const articleRef = doc(collection(db, 'articles'));
        batch.set(articleRef, {
          metier: metier || 'Cuisine',
          rubrique: rubrique || 'Général',
          famille: famille || 'Non classé',
          collection: collectionName || '',
          descriptif: descriptif || '',
          prixMiniTTC: prixMini,
          prixMaxiTTC: prixMaxi,
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
        console.error("Erreur lors de l'import:", err);
        alert("Une erreur est survenue lors de l'importation des données.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  const filteredArticles = articles.filter(article => 
    article.famille?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.rubrique?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.descriptif?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-[calc(100vh-64px)] flex flex-col">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        className="hidden" 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-gray-900">
            <div className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                <Box size={24} className="text-gray-800" />
            </div>
            <div className="space-y-0.5">
                <h2 className="text-xl font-bold">Catalogue Articles Société <span className="text-gray-400 text-lg font-normal">({articles.length})</span></h2>
                {importSuccess && (
                  <div className="flex items-center gap-1.5 text-green-600 text-[11px] font-bold animate-in fade-in slide-in-from-left-2">
                    <CheckCircle2 size={14} /> Importation réussie !
                  </div>
                )}
            </div>
        </div>
        
        <div className="flex items-center space-x-3">
             <button className="flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                <Download size={16} className="mr-2" />
                Exporter
            </button>
            <button 
              onClick={handleImportClick}
              disabled={isImporting}
              className={`flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isImporting ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <UploadIcon size={16} className="mr-2" />
                )}
                {isImporting ? 'Importation...' : 'Importer CSV'}
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
                <Plus size={18} className="mr-2" />
                Ajouter un article
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
                type="text" 
                placeholder="Rechercher par famille, rubrique ou descriptif..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-400 text-gray-800 shadow-sm transition-all"
            />
          </div>
          
          {['Métier', 'Rubrique', 'Famille'].map((filter) => (
             <div key={filter} className="md:col-span-2 relative flex-1">
                 <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all shadow-sm">
                    <span className="truncate">{filter}</span>
                    <ChevronDown size={14} />
                 </button>
             </div>
          ))}
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm flex flex-col flex-1 relative">
          {(isLoading || isImporting) && (
            <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-gray-300 animate-spin" />
            </div>
          )}

          <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-400 uppercase font-black tracking-widest">
                          <th className="px-6 py-4">Métier</th>
                          <th className="px-6 py-4">Rubrique</th>
                          <th className="px-6 py-4">Famille</th>
                          <th className="px-6 py-4">Collection</th>
                          <th className="px-6 py-4">Résumé descriptif</th>
                          <th className="px-6 py-4">Prix Mini TTC</th>
                          <th className="px-6 py-4">Prix Maxi TTC</th>
                          <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {filteredArticles.length === 0 && !isLoading ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-20 text-center text-gray-400 italic">
                            Votre catalogue est vide. Cliquez sur "Ajouter un article" ou importez un CSV.
                          </td>
                        </tr>
                      ) : filteredArticles.map((article) => (
                          <tr key={article.id} className="hover:bg-gray-50 transition-colors group">
                              <td className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">{article.metier}</td>
                              <td className="px-6 py-4 text-sm font-bold text-gray-900 uppercase">{article.rubrique}</td>
                              <td className="px-6 py-4 text-sm font-black text-indigo-600 uppercase">{article.famille}</td>
                              <td className="px-6 py-4 text-sm font-bold text-gray-400 italic">{article.collection || '-'}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-600 max-w-[250px] truncate">{article.descriptif}</td>
                              <td className="px-6 py-4 text-sm font-black text-gray-900">{article.prixMiniTTC?.toLocaleString()} €</td>
                              <td className="px-6 py-4 text-sm font-black text-gray-900">{article.prixMaxiTTC?.toLocaleString()} €</td>
                              <td className="px-6 py-4">
                                  <div className="flex justify-end space-x-2 relative">
                                      <button className="p-2 border border-gray-100 rounded-lg hover:bg-white hover:shadow-md text-gray-400 transition-all">
                                          <Eye size={16} />
                                      </button>
                                      <button 
                                        onClick={() => setActiveMenuId(activeMenuId === article.id ? null : article.id)}
                                        className={`p-2 border border-gray-100 rounded-lg hover:bg-white hover:shadow-md transition-all ${activeMenuId === article.id ? 'bg-gray-50 text-gray-900' : 'text-gray-400'}`}
                                      >
                                          <MoreHorizontal size={16} />
                                      </button>
                                      
                                      {activeMenuId === article.id && (
                                          <>
                                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                                            <div className="absolute right-0 top-12 bg-white border border-gray-100 rounded-xl shadow-2xl z-20 w-48 py-2 animate-in fade-in zoom-in-95 duration-150">
                                                <button className="w-full text-left px-4 py-3 text-[13px] font-bold text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                                                    <PenSquare size={16} className="mr-3 text-gray-400" />
                                                    Modifier
                                                </button>
                                                <div className="h-px bg-gray-50 my-1 mx-2" />
                                                <button 
                                                  onClick={() => handleDeleteArticle(article.id)}
                                                  className="w-full text-left px-4 py-3 text-[13px] font-bold text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                                >
                                                    <Trash2 size={16} className="mr-3 text-red-400" />
                                                    Supprimer
                                                </button>
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

          <div className="p-6 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-400 bg-white mt-auto">
                <div>Affichage de <span className="font-black text-gray-900">1 à {filteredArticles.length}</span> sur <span className="font-black text-gray-900">{filteredArticles.length}</span> résultats</div>
                <div className="flex items-center space-x-2">
                    <button className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all"><ChevronsLeft size={16} /></button>
                    <button className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all"><ChevronLeft size={16} /></button>
                    <button className="w-9 h-9 bg-gray-900 text-white rounded-lg text-[12px] font-black shadow-md">1</button>
                    <button className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all"><ChevronRight size={16} /></button>
                    <button className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all rotate-180"><ChevronsLeft size={16} /></button>
                </div>
           </div>
      </div>

      <AddArticleModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        userProfile={userProfile}
      />
    </div>
  );
};

export default Articles;
