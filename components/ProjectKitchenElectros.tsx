
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Package, ShoppingCart, Loader2, Calculator } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot, arrayRemove } from '@firebase/firestore';
import AddProjectArticleModal from './AddProjectArticleModal';

interface ProjectKitchenElectrosProps {
  project: any;
  userProfile: any;
}

const ProjectKitchenElectros: React.FC<ProjectKitchenElectrosProps> = ({ project, userProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'Electromenager' | 'Sanitaire'>('Electromenager');
  
  const electros = project.details?.kitchen?.electros || [];
  const sanitaires = project.details?.kitchen?.sanitaires || [];

  const handleRemoveItem = async (item: any, type: 'electros' | 'sanitaires') => {
    try {
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        [`details.kitchen.${type}`]: arrayRemove(item)
      });
    } catch (e) {
      console.error("Erreur suppression item:", e);
    }
  };

  const openAddModal = (mode: 'Electromenager' | 'Sanitaire') => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const ListBlock = ({ title, items, type, onAdd }: { title: string, items: any[], type: 'electros' | 'sanitaires', onAdd: () => void }) => {
    // Calcul du total
    const totalPrice = items.reduce((sum, item) => sum + (Number(item.prixMaxiTTC) || 0), 0);

    return (
      <div className="bg-[#f8f9fa] border border-gray-100 rounded-[32px] p-8 space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[15px] font-extrabold text-gray-800 uppercase tracking-tight flex items-center gap-3">
            <Package size={18} className="text-gray-400" />
            {title}
            <span className="text-gray-300 font-bold ml-1">({items.length})</span>
          </h3>
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-800 shadow-sm hover:border-gray-900 transition-all active:scale-95"
          >
            <Plus size={16} />
            Ajouter un {type === 'electros' ? 'électro' : 'sanitaire'}
          </button>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-white/50 border border-dashed border-gray-200 rounded-[24px]">
              <ShoppingCart size={32} className="text-gray-200 mb-3" />
              <p className="text-[13px] font-bold text-gray-400">Aucun élément dans cette liste</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3">
                {items.map((item, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-[20px] p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-800 font-black text-[10px] border border-gray-100 uppercase">
                        {item.famille?.substring(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.famille}</span>
                          {item.collection && <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">• {item.collection}</span>}
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900">{item.descriptif}</h4>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[13px] font-black text-gray-900">{item.prixMaxiTTC?.toLocaleString()} €</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Conseillé TTC</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item, type)}
                        className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pied de page avec Total */}
              <div className="mt-6 pt-6 border-t border-gray-200/60 flex justify-end">
                <div className="bg-white px-8 py-4 rounded-[20px] border border-gray-100 shadow-sm flex items-center gap-8">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Calculator size={18} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Prix total conseillé</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[20px] font-black text-gray-900">{totalPrice.toLocaleString()} €</span>
                    <span className="text-[10px] font-bold text-gray-300 uppercase block tracking-tighter">Montant total TTC</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      <ListBlock 
        title="Liste des électroménagers" 
        items={electros} 
        type="electros"
        onAdd={() => openAddModal('Electromenager')} 
      />
      
      <ListBlock 
        title="Liste des sanitaires" 
        items={sanitaires} 
        type="sanitaires"
        onAdd={() => openAddModal('Sanitaire')} 
      />

      <AddProjectArticleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        project={project}
        userProfile={userProfile}
      />
    </div>
  );
};

export default ProjectKitchenElectros;
