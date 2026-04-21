import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Contract } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const FIRESTORE_DATABASE_ID = 'ai-studio-9ac73417-ac97-48d4-ad28-862316ff223e';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, FIRESTORE_DATABASE_ID);

export const api = {
  contracts: {
    list: async (): Promise<Contract[]> => {
      const q = query(collection(db, 'termos'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Contract);
    },
    create: async (contractData: any): Promise<void> => {
      const dbRef = doc(db, 'termos', contractData.id);
      await setDoc(dbRef, contractData);
    },
    get: async (id: string): Promise<Contract> => {
      const dbRef = doc(db, 'termos', id);
      const snapshot = await getDoc(dbRef);
      if (!snapshot.exists()) {
        throw new Error('Contract not found');
      }
      return snapshot.data() as Contract;
    },
    sign: async (id: string, signature: string): Promise<void> => {
      const dbRef = doc(db, 'termos', id);
      await updateDoc(dbRef, {
        signature,
        signed_at: new Date().toISOString(),
        'data.status': 'assinado'
      });
    },
    updateOnbase: async (id: string, status: boolean): Promise<void> => {
      const dbRef = doc(db, 'termos', id);
      await updateDoc(dbRef, {
        onbase_status: status
      });
    },
    delete: async (id: string): Promise<void> => {
      const dbRef = doc(db, 'termos', id);
      await deleteDoc(dbRef);
    }
  },
  settings: {
    getTerms: async (): Promise<any> => {
      const dbRef = doc(db, 'settings', 'termos');
      const snapshot = await getDoc(dbRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
      return null;
    },
    updateTerms: async (data: any): Promise<void> => {
      const dbRef = doc(db, 'settings', 'termos');
      await setDoc(dbRef, data, { merge: true });
    }
  }
};
