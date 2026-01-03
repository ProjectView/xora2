
import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  File, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from '@firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface ClientDocumentsProps {
  clientId: string;
  userProfile: any;
}

interface DocumentMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: any;
  uploadedBy: string;
  url: string;
  storagePath: string;
}

const ClientDocuments: React.FC<ClientDocumentsProps> = ({ clientId, userProfile }) => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!clientId) return;

    const q = query(
      collection(db, 'client_documents'),
      where('clientId', '==', clientId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DocumentMetadata[];
      
      // Tri par date décroissante
      docs.sort((a, b) => {
        const timeB = b.uploadedAt?.seconds || 0;
        const timeA = a.uploadedAt?.seconds || 0;
        return timeB - timeA;
      });

      setDocuments(docs);
      setIsLoading(false);
    }, (error) => {
      console.error("Erreur Firestore Documents:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [clientId]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !clientId) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uniqueId = Date.now() + Math.random().toString(36).substring(7);
        const fileName = `${uniqueId}_${file.name}`;
        
        // Chemin de stockage structuré
        const storagePath = `clients/${clientId}/documents/${fileName}`;
        const fileRef = ref(storage, storagePath);

        // 1. Upload physique
        const uploadResult = await uploadBytes(fileRef, file);
        
        // 2. Récupération URL
        const downloadUrl = await getDownloadURL(uploadResult.ref);

        // 3. Création métadonnées Firestore
        await addDoc(collection(db, 'client_documents'), {
          clientId,
          companyId: userProfile.companyId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: downloadUrl,
          storagePath: storagePath, 
          uploadedAt: serverTimestamp(),
          uploadedBy: userProfile.name
        });
      }
    } catch (e: any) {
      console.error("Échec du transfert:", e);
      alert(`Erreur lors du transfert : ${e.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, docData: DocumentMetadata) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le document "${docData.name}" ?\nCette action supprimera le fichier du serveur.`)) {
      return;
    }
    
    setDeletingIds(prev => {
      const next = new Set(prev);
      next.add(docData.id);
      return next;
    });

    try {
      // 1. TENTATIVE de suppression physique dans Firebase Storage
      if (docData.storagePath) {
        const fileRef = ref(storage, docData.storagePath);
        try {
          await deleteObject(fileRef);
          console.log("Fichier supprimé du Storage avec succès.");
        } catch (storageErr: any) {
          // On log l'erreur mais on ne bloque pas la suite si le fichier est introuvable 
          // ou si les règles Storage sont manquantes (pour permettre au moins le nettoyage DB)
          console.warn("Problème Storage (peut être ignoré si Firestore est nettoyé):", storageErr.code);
          
          if (storageErr.code === 'storage/unauthorized') {
             console.error("Attention : Vos règles Firebase STORAGE ne permettent pas la suppression. Vérifiez l'onglet Storage > Rules dans votre console Firebase.");
          }
        }
      }

      // 2. Suppression de l'entrée Firestore (Indispensable pour mettre à jour l'UI)
      await deleteDoc(doc(db, 'client_documents', docData.id));
      console.log("Document supprimé de Firestore.");
      
    } catch (e: any) {
      console.error("Erreur critique lors de la suppression Firestore:", e);
      alert(`Erreur de suppression : ${e.message}`);
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(docData.id);
        return next;
      });
    }
  };

  const handleDownload = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (!url) return;
    window.open(url, '_blank');
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="text-blue-500" size={24} />;
    if (type.includes('pdf')) return <FileText className="text-red-500" size={24} />;
    return <File className="text-gray-400" size={24} />;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 pt-6">
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="space-y-1">
          <h2 className="text-[16px] font-bold text-gray-800">
            Documents joints <span className="text-gray-300 font-normal ml-1">({documents.length})</span>
          </h2>
          <p className="text-[11px] text-gray-400 font-medium italic">Fichiers et pièces jointes sécurisés</p>
        </div>
      </div>

      <div className="bg-[#f8f9fa] border border-gray-100 rounded-[28px] p-6 min-h-[450px] space-y-6">
        
        {/* Drop Zone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center transition-all cursor-pointer group ${
            dragActive 
              ? 'border-indigo-500 bg-indigo-50/50' 
              : 'border-gray-200 bg-white hover:border-indigo-400 hover:bg-gray-50/50 shadow-sm'
          }`}
        >
          <input 
            type="file" 
            multiple 
            ref={fileInputRef}
            className="hidden" 
            onChange={(e) => handleFileUpload(e.target.files)} 
          />
          
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
            isUploading ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-gray-50 text-gray-400 group-hover:scale-110 group-hover:text-indigo-500'
          }`}>
            {isUploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
          </div>
          
          <div className="text-center">
            <p className="text-[14px] font-bold text-gray-800">
              {isUploading ? "Transfert en cours..." : "Ajouter des documents"}
            </p>
            <p className="text-[11px] text-gray-400 font-medium mt-1">Glissez vos fichiers ici ou cliquez pour parcourir</p>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-gray-200" size={32} />
            </div>
          ) : documents.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white border border-gray-100 rounded-[24px]">
               <File size={40} className="mx-auto text-gray-100" />
               <p className="text-[13px] font-bold text-gray-300 italic">Aucun document pour ce contact.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((docItem) => {
                const isDeleting = deletingIds.has(docItem.id);
                return (
                  <div key={docItem.id} className={`bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between group transition-all ${isDeleting ? 'opacity-50 grayscale pointer-events-none' : 'hover:shadow-lg hover:border-indigo-100'}`}>
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                        {getFileIcon(docItem.type)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-[13px] font-bold text-gray-900 truncate" title={docItem.name}>
                          {docItem.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                          <span>{formatSize(docItem.size)}</span>
                          <span>•</span>
                          <span>{docItem.uploadedAt ? docItem.uploadedAt.toDate().toLocaleDateString('fr-FR') : 'Synchro...'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {isDeleting ? (
                        <div className="p-2"><Loader2 size={16} className="animate-spin text-indigo-500" /></div>
                      ) : (
                        <>
                          <button 
                            onClick={(e) => handleDownload(e, docItem.url)}
                            className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Ouvrir le fichier"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, docItem)}
                            className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Supprimer du serveur"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDocuments;
