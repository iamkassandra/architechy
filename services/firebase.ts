import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, query, where, getDocs, addDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, limit, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const getEnv = (key: string) => {
  if (typeof window !== 'undefined') {
    return import.meta.env?.[key];
  }
  return process.env[key];
};

const config = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || firebaseConfig.apiKey,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || firebaseConfig.authDomain,
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || firebaseConfig.projectId,
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || firebaseConfig.storageBucket,
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || firebaseConfig.messagingSenderId,
  appId: getEnv('VITE_FIREBASE_APP_ID') || firebaseConfig.appId,
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID') || firebaseConfig.measurementId,
};

const app = initializeApp(config);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app, getEnv('VITE_FIREBASE_FIRESTORE_DATABASE_ID') || firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Authentication node failure:", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

// Error Handling Infrastructure
export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
} as const;

export type OperationType = typeof OperationType[keyof typeof OperationType];

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection: SYNCED");
  } catch (error) {
    const err = error as Error;
    if(err.message.includes('permission-denied') || 
       err.message.includes('insufficient permissions') ||
       err.message.includes('Missing or insufficient permissions')) {
        console.warn("Firebase Security Rules: ACTIVE (Expected)");
    } else if (err.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration (Offline).");
    } else {
        console.error("Firebase connection synchronization failed:", err);
    }
  }
}

testConnection();

export { 
  onAuthStateChanged,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  doc,
  onSnapshot
};

export type { User };
