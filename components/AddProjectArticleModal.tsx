
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Plus, Check, Loader2, Package, Layers } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion } from '@firebase/firestore';

interface AddProjectArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'Electromenager' | 'Sanitaire';
  project: any;
  userProfile: any;
}

const AddProjectArticleModal: React.FC<AddProjectArticleModalProps> = ({ isOpen, onClose, mode, project, userProfile }) => {
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userProfile?.companyId) return;

    setIsLoading(true);
    const q = query(
      collection(db, 'articles'), 
      where('companyId', '==', userProfile.companyId),
      where('rubrique', '==', mode)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setArticles(docs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, mode, userProfile?.companyId]);

  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(a => 
      a.famille?.toLowerCase().includes(q) || 
      a.descriptif?.toLowerCase().includes(q) ||
      a.collection?.toLowerCase().includes(q)
    );
  }, [search, articles]);

  const handleAddArticle = async (article: any) => {
    setIsAdding(article.id);
    try {
      const type = mode === 'Electromenager' ? 'electros' : 'sanitaires';
      const projectRef = doc(db, 'projects', project.id);
      
      await updateDoc(projectRef, {
        [`details.kitchen.${type}`]: arrayUnion(article)
      });
      
      // On laisse la modale ouverte pour en ajouter d'autres
      setTimeout(() => setIsAdding(null), 1000);
    } catch (e) {
      console.error(e);
      setIsAdding(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 h-[80vh]">
        
        {/* Header */}
        <div className="px-10 py-7 border-b border-gray-100 flex items-center justify-between bg-[#FBFBFB]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Plus size={24} />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">
                Ajouter un {mode === 'Electromenager' ? 'Électroménager' : 'Sanitaire'}
              </h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Recherche dans le catalogue XORA</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="px-10 pt-8 pb-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher par famille, modèle ou descriptif..." 
              className="w-full bg-[#F8F9FA] border border-gray-100 rounded-[20px] pl-14 pr-6 py-5 text-[15px] font-bold text-gray-900 outline-none focus:bg-white focus:border-gray-900 transition-all placeholder:text-gray-300 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto px-10 py-4 custom-scrollbar">
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={32} className="animate-spin text-gray-200" />
                <p className="text-[13px] font-bold text-gray-400">Chargement du catalogue...</p>
              </div>
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map(article => {
                const isSelected = isAdding === article.id;
                return (
                  <div
                    key={article.id}
                    className={`w-full px-6 py-5 bg-white border border-gray-100 rounded-[24px] flex items-center justify-between transition-all hover:shadow-md hover:border-gray-300 group shadow-sm`}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                        <Package size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{article.famille}</span>
                          {article.collection && <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">• {article.collection}</span>}
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900">{article.descriptif}</h4>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[15px] font-black text-gray-900">{article.prixMaxiTTC?.toLocaleString()} €</p>
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Conseillé TTC</p>
                      </div>
                      <button 
                        onClick={() => handleAddArticle(article)}
                        disabled={!!isAdding}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-green-500 text-white shadow-lg' 
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white border border-gray-100'
                        }`}
                      >
                        {isSelected ? <Check size={20} /> : (isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />)}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center space-y-4">
                <Layers size={48} className="text-gray-100 mx-auto" />
                <div>
                  <p className="text-[15px] font-bold text-gray-900">Aucun article trouvé</p>
                  <p className="text-[12px] text-gray-400">Assurez-vous que vos articles dans le catalogue ont bien la rubrique "{mode}"</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-gray-100 flex justify-between items-center bg-[#FBFBFB]">
          <p className="text-[12px] text-gray-400 font-medium">
            <span className="font-black text-gray-900">{filteredArticles.length}</span> articles disponibles dans cette catégorie
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl text-[14px] font-bold shadow-xl hover:bg-black transition-all active:scale-95"
          >
            Terminer la sélection
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectArticleModal;
