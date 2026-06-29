// FleetOS SaaS Stack Infra Database Access Layer (Supabase Exclusive)
import { supabase } from "./supabaseClient";

export const isMock = false;

export async function getDbCollection(collName: string): Promise<any[]> {
  try {
    return await supabase.db.select(collName);
  } catch (e) {
    console.error(`Erro ao carregar coleção do Supabase ${collName}:`, e);
    return [];
  }
}

export async function addDbDocument(collName: string, data: any): Promise<any> {
  const enriched = {
    ...data,
    createdAt: new Date().toISOString()
  };
  try {
    return await supabase.db.insert(collName, enriched);
  } catch (e) {
    console.error(`Erro ao inserir no Supabase ${collName}:`, e);
    throw e;
  }
}

export async function updateDbDocument(collName: string, docId: string, data: any): Promise<void> {
  try {
    await supabase.db.update(collName, docId, data);
  } catch (e) {
    console.error(`Erro ao atualizar no Supabase ${collName}:`, e);
    throw e;
  }
}
