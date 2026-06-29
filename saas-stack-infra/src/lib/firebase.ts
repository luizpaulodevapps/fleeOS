import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, updateDoc, doc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasConfig = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'sua_api_key_aqui' &&
  firebaseConfig.projectId;

let app: any;
let auth: any = null;
let db: any = null;
let isMock = true;

if (hasConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isMock = false;
  } catch (error) {
    console.error("Erro ao inicializar Firebase. Alternando para modo Mock.", error);
  }
} else {
  console.warn("Chaves do Firebase não encontradas. SaaS Stack Infra rodando em Modo Mock.");
}

export { app, auth, db, isMock };

// Generic database CRUD helpers to automatically handle Mock vs Supabase vs Live Firebase
import { isSupabaseConfigured, supabase } from "./supabaseClient";

export async function getDbCollection(collName: string): Promise<any[]> {
  if (isSupabaseConfigured) {
    try {
      return await supabase.db.select(collName);
    } catch (e) {
      console.error(`Erro ao carregar coleção do Supabase ${collName}:`, e);
      return [];
    }
  }
  if (isMock) {
    const raw = localStorage.getItem(`fleetos_${collName}`);
    return raw ? JSON.parse(raw) : [];
  } else {
    try {
      const snap = await getDocs(collection(db, collName));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error(`Erro ao carregar coleção ${collName}:`, e);
      return [];
    }
  }
}

export async function addDbDocument(collName: string, data: any): Promise<any> {
  const enriched = {
    ...data,
    createdAt: new Date().toISOString()
  };
  if (isSupabaseConfigured) {
    try {
      return await supabase.db.insert(collName, enriched);
    } catch (e) {
      console.error(`Erro ao inserir no Supabase ${collName}:`, e);
      throw e;
    }
  }
  if (isMock) {
    const raw = localStorage.getItem(`fleetos_${collName}`);
    const list = raw ? JSON.parse(raw) : [];
    const newDoc = { id: `doc-${Math.random().toString(36).substr(2, 9)}`, ...enriched };
    list.push(newDoc);
    localStorage.setItem(`fleetos_${collName}`, JSON.stringify(list));
    return newDoc;
  } else {
    const ref = await addDoc(collection(db, collName), enriched);
    return { id: ref.id, ...enriched };
  }
}

export async function updateDbDocument(collName: string, docId: string, data: any): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase.db.update(collName, docId, data);
      return;
    } catch (e) {
      console.error(`Erro ao atualizar no Supabase ${collName}:`, e);
      throw e;
    }
  }
  if (isMock) {
    const raw = localStorage.getItem(`fleetos_${collName}`);
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((x: any) => x.id === docId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      localStorage.setItem(`fleetos_${collName}`, JSON.stringify(list));
    }
  } else {
    const ref = doc(db, collName, docId);
    await updateDoc(ref, data);
  }
}
