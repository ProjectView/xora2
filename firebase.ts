import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, writeBatch, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAN59kl6vkvbxdMsBG3mvcg3N8ynnYxK9c",
  authDomain: "xora-41903.firebaseapp.com",
  projectId: "xora-41903",
  storageBucket: "xora-41903.firebasestorage.app",
  messagingSenderId: "250582798310",
  appId: "1:250582798310:web:2d19531984e8d9fb6e1027",
  measurementId: "G-3DD87LVRGG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Fonction d'initialisation massive (Seed)
 * Équivalent d'un gros script SQL pour créer la structure et les données
 */
export const seedDatabase = async (companyId: string = 'default_company') => {
  const batch = writeBatch(db);

  // 1. KPIs Financiers
  const kpis = [
    { id: 'ca', label: 'CA Généré', value: '53.456€', target: '110.000€', percentage: 65, iconName: 'euro', companyId },
    { id: 'marge', label: 'Marge générée', value: '12.326€', target: '15.000€', percentage: 73, iconName: 'search', companyId },
    { id: 'taux_marge', label: 'Taux de marge', value: '23,4%', target: '35%', percentage: 68, iconName: 'file', companyId },
    { id: 'taux_transfo', label: 'Taux de transformation', value: '32,2%', target: '33%', percentage: 96, iconName: 'user', companyId },
  ];

  kpis.forEach(kpi => {
    const ref = doc(db, 'kpis', `${companyId}_${kpi.id}`);
    batch.set(ref, kpi);
  });

  // 2. Status Overview (Les cartes de gauche du dashboard)
  const statusCards = [
    { id: 'leads', label: 'Leads', count: 8, color: 'purple', order: 1, companyId },
    { id: 'etudes', label: 'Etudes en cours', count: 12, color: 'fuchsia', order: 2, companyId },
    { id: 'commandes', label: 'Commandes clients', count: 5, color: 'blue', order: 3, companyId },
    { id: 'dossiers', label: 'Dossiers tech & install', count: 14, color: 'cyan', order: 4, companyId },
    { id: 'sav', label: 'SAV', count: 3, color: 'orange', order: 5, companyId },
  ];

  statusCards.forEach(card => {
    const ref = doc(db, 'status_overview', `${companyId}_${card.id}`);
    batch.set(ref, card);
  });

  // 3. Quelques clients de test
  const clients = [
    { name: 'CHLOÉ DUBOIS', origin: 'Web', location: 'Valras-Plage', status: 'Prospect', dateAdded: '10/02/2025', companyId, projectCount: 1 },
    { name: 'CHARLES DUBOIS', origin: 'Relation', location: 'Béziers', status: 'Client', dateAdded: '15/01/2025', companyId, projectCount: 2 },
    { name: 'MARIE MARTIN', origin: 'Apporteur', location: 'Agde', status: 'Leads', dateAdded: '20/02/2025', companyId, projectCount: 0 },
  ];

  clients.forEach(client => {
    const ref = doc(collection(db, 'clients'));
    batch.set(ref, {
        ...client,
        addedBy: { name: 'Admin Xora', avatar: 'https://i.pravatar.cc/150?u=admin' }
    });
  });

  // 4. Quelques tâches de test
  const tasks = [
    { title: 'Relancer Devis Dubois', tag: 'Prioritaire', tagColor: 'purple', status: 'pending', statusType: 'toggle', date: '22/02/2025', companyId, type: 'Tâche manuelle' },
    { title: 'Dossier technique Cuisine Martin', tag: 'Dossier technique', tagColor: 'blue', status: 'in-progress', statusType: 'progress', progress: 45, date: '2 jours de retard', isLate: true, companyId, type: 'Tâche auto' },
  ];

  tasks.forEach(task => {
    const ref = doc(collection(db, 'tasks'));
    batch.set(ref, {
        ...task,
        collaborator: { name: 'Admin Xora', avatar: 'https://i.pravatar.cc/150?u=admin' }
    });
  });

  await batch.commit();
  console.log("Database seeded successfully!");
};