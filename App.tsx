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
import LoginPage from './components/LoginPage';
import { Page, Client } from './types';
import { Construction } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserProfile({ uid: user.uid, ...userDoc.data() });
        } else {
          const defaultProfile = {
            name: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
            email: user.email,
            companyId: 'default_company',
            avatar: `https://i.pravatar.cc/150?u=${user.uid}`,
            role: 'Agenceur',
            phone: '01 23 45 67 89',
            lastName: (user.displayName || user.email?.split('@')[0] || '').toUpperCase(),
            firstName: user.displayName || user.email?.split('@')[0] || '',
            contractType: 'CDI',
            jobTitle: 'Agenceur',
            hasPhone: true,
            hasCar: true,
            hasLaptop: true,
            agendaColor: '#A8A8A8',
            isSubscriptionActive: true
          };
          await setDoc(userDocRef, defaultProfile);
          setUserProfile({ uid: user.uid, ...defaultProfile });
        }
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const getHeaderTitle = (page: Page) => {
    switch (page) {
      case 'dashboard': return 'Tableau de bord';
      case 'directory': return 'Clients & prospects';
      case 'agenda': return 'Agenda';
      case 'articles': return 'Articles';
      case 'tasks': return 'Tâches & mémo';
      case 'suppliers': return 'Fournisseurs';
      case 'artisans': return 'Artisans';
      case 'institutional': return 'Institutionnel';
      case 'prescriber': return 'Prescripteur';
      case 'subcontractor': return 'Sous traitant';
      case 'projects': return 'Suivi projets';
      case 'kpi': return 'Indicateurs KPI';
      case 'company': return 'Notre entreprise';
      case 'profile': return 'Mon profil';
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
        <div className="w-12 h-12 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => {}} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard userProfile={userProfile} />;
      case 'directory':
        return selectedClient ? (
          <ClientDetails client={selectedClient} onBack={() => setSelectedClient(null)} />
        ) : (
          <Directory 
            userProfile={userProfile}
            onAddClick={() => setIsModalOpen(true)} 
            onClientClick={(client) => setSelectedClient(client)} 
          />
        );
      case 'agenda': return <Agenda />;
      case 'articles': return <Articles />;
      case 'tasks': return <TasksMemo />;
      case 'projects': 
        return selectedProject ? (
          <ProjectDetails onBack={() => setSelectedProject(null)} />
        ) : (
          <ProjectTracking 
            userProfile={userProfile}
            onProjectClick={(project) => setSelectedProject(project)} 
          />
        );
      case 'profile':
        return <UserProfile userProfile={userProfile} setUserProfile={setUserProfile} onBack={() => setCurrentPage('dashboard')} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-gray-50 text-gray-400 p-8 text-center">
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Construction size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Espace en développement</h3>
              <p className="text-sm leading-relaxed">
                Cette section de l'application XORA est actuellement en cours de finalisation. 
                Veuillez revenir ultérieurement.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={handlePageChange} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {(!selectedClient && !selectedProject && currentPage !== 'profile') && (
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