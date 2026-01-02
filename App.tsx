
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Directory from './components/Directory';
import Agenda from './components/Agenda';
import Modal from './components/Modal';
import ClientDetails from './components/ClientDetails';
import Articles from './components/Articles';
import TasksMemo from './components/TasksMemo';
import ProjectTracking from './components/ProjectTracking';
import ProjectDetails from './components/ProjectDetails';
import UserProfile from './components/UserProfile';
import CompanyManagement from './components/CompanyManagement';
import KPIManagement from './components/KPIManagement';
import LoginPage from './components/LoginPage';
import { Page, Client } from './types';
import { Construction, AlertCircle } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
// Use @firebase/firestore to fix named export resolution issues
import { doc, setDoc, onSnapshot } from '@firebase/firestore';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthError(null);
        const unsubDoc = onSnapshot(
          doc(db, 'users', user.uid), 
          (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile({ uid: user.uid, ...docSnap.data() });
              setIsAuthenticated(true);
              setIsLoadingAuth(false);
            } else {
              const defaultProfile = {
                name: user.displayName || 'Utilisateur',
                email: user.email,
                companyId: 'temp_company',
                avatar: `https://i.pravatar.cc/150?u=${user.uid}`,
                role: 'Agenceur',
                lastName: '',
                firstName: '',
                isSubscriptionActive: true
              };
              setDoc(doc(db, 'users', user.uid), defaultProfile)
                .catch(err => console.error("Erreur creation profil auto:", err));
              
              setUserProfile({ uid: user.uid, ...defaultProfile });
              setIsAuthenticated(true);
              setIsLoadingAuth(false);
            }
          },
          (error) => {
            console.error("Erreur Permission Firestore:", error);
            if (error.code === 'permission-denied') {
              setAuthError("Accès refusé : Veuillez configurer les règles de sécurité Firestore dans la console Firebase.");
            }
            setIsLoadingAuth(false);
          }
        );
        return () => unsubDoc();
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
        setIsLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const getHeaderTitle = (page: Page) => {
    switch (page) {
      case 'dashboard': return 'Tableau de bord';
      case 'directory': return 'Annuaire';
      case 'agenda': return 'Agenda';
      case 'articles': return 'Articles';
      case 'tasks': return 'Tâches & mémo';
      case 'projects': return 'Suivi projets';
      case 'company': return 'Notre entreprise';
      case 'profile': return 'Mon profil';
      case 'kpi': return 'KPI';
      default: return 'XORA';
    }
  };

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setSelectedClient(null);
    setSelectedProject(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Chargement XORA...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA] p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[32px] shadow-xl border border-red-50 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Problème de configuration</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{authError}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => {}} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': 
        return (
          <Dashboard 
            userProfile={userProfile} 
            onClientClick={(client) => {
              setSelectedClient(client);
              setCurrentPage('directory');
            }}
            onAddClientClick={() => setIsModalOpen(true)}
          />
        );
      case 'directory':
        return selectedClient ? (
          <ClientDetails client={selectedClient} userProfile={userProfile} onBack={() => setSelectedClient(null)} />
        ) : (
          <Directory 
            userProfile={userProfile}
            onAddClick={() => setIsModalOpen(true)} 
            onClientClick={(client) => setSelectedClient(client)} 
          />
        );
      case 'agenda': return <Agenda userProfile={userProfile} />;
      case 'articles': return <Articles userProfile={userProfile} />;
      case 'tasks': return <TasksMemo userProfile={userProfile} />;
      case 'projects': 
        return selectedProject ? (
          <ProjectDetails 
            project={selectedProject} 
            userProfile={userProfile} 
            onBack={() => setSelectedProject(null)} 
          />
        ) : (
          <ProjectTracking 
            userProfile={userProfile}
            onProjectClick={(project) => setSelectedProject(project)} 
          />
        );
      case 'company':
        return <CompanyManagement userProfile={userProfile} />;
      case 'profile':
        return <UserProfile userProfile={userProfile} setUserProfile={setUserProfile} onBack={() => setCurrentPage('dashboard')} />;
      case 'kpi':
        return <KPIManagement userProfile={userProfile} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-gray-50 text-gray-400 p-8 text-center">
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                <Construction size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Espace en développement</h3>
              <p className="text-sm leading-relaxed">Cette section est en cours de finalisation.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={handlePageChange} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {(!selectedClient && !selectedProject && currentPage !== 'profile' && currentPage !== 'company' && currentPage !== 'kpi') && (
          <Header title={getHeaderTitle(currentPage)} user={userProfile} onProfileClick={() => setCurrentPage('profile')} />
        )}
        <main className="flex-1 overflow-auto bg-gray-50">
          {renderContent()}
        </main>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userProfile={userProfile}
      />
    </div>
  );
}

export default App;
