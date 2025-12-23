
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, writeBatch, collection } from "firebase/firestore";

// Fonction sécurisée pour récupérer les variables d'environnement
const getEnv = (key: string, fallback: string): string => {
  try {
    // @ts-ignore
    return process.env[key] || fallback;
  } catch (e) {
    return fallback;
  }
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyAN59kl6vkvbxdMsBG3mvcg3N8ynnYxK9c"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "xora-41903.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "xora-41903"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "xora-41903.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "250582798310"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:250582798310:web:2d19531984e8d9fb6e1027"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-3DD87LVRGG")
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const seedDatabase = async (companyId: string = 'default_company') => {
  const batch = writeBatch(db);

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

  await batch.commit();
  console.log("Base de données initialisée !");
};
