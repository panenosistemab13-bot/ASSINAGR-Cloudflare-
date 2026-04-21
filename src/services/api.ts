import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Contract } from '../types';
import firebaseConfig from '../../firebase-applet-config.json'; // adjust path depending on location

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
