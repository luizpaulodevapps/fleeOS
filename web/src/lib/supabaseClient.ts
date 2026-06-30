import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl !== "sua-url-supabase-aqui" &&
  !!supabaseKey &&
  supabaseKey !== "seu-anon-key-aqui";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Relational Postgres tables. All other tables map to the generic JSONB table 'fleetos_collections'
export const RELATIONAL_TABLES = [
  "companies",
  "user_profiles",
  "drivers",
  "vehicles",
  "contracts",
  "driver_ledger",
  "cashier_sessions",
  "cashier_movements",
  "saas_plans",
  "saas_fleets",
];

// Direct REST helper for tables not easily accessed via the SDK client
async function supabaseRestRequest(path: string, options: RequestInit = {}) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase não configurado.");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token || supabaseKey;

  const url = `${supabaseUrl}${path}`;
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers, cache: "no-store" });
  } catch (err: any) {
    console.error(`Erro de rede ao acessar ${path}:`, err);
    throw new Error("Falha de conexão com o Supabase. Verifique sua internet e tente novamente.");
  }

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Erro no Supabase em ${path}:`, errText);
    throw new Error(`Erro do Supabase: ${response.statusText} (${response.status}) - ${errText}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function convertKeysToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(convertKeysToSnakeCase);
  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key) => {
      acc[toSnakeCase(key)] = convertKeysToSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

function toCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );
}

function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(convertKeysToCamelCase);
  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key) => {
      acc[toCamelCase(key)] = convertKeysToCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

export const db = {
  async select(table: string, tenantId?: string): Promise<any[]> {
    const isRelational = RELATIONAL_TABLES.includes(table);

    if (isRelational) {
      const query = tenantId ? `?tenant_id=eq.${tenantId}` : "";
      const data = await supabaseRestRequest(`/rest/v1/${table}${query}&select=*`);
      return convertKeysToCamelCase(data);
    } else {
      const query = tenantId
        ? `?collection_name=eq.${table}&tenant_id=eq.${tenantId}`
        : `?collection_name=eq.${table}`;
      const rows = await supabaseRestRequest(`/rest/v1/fleetos_collections${query}&select=*`);
      return rows.map((r: any) => ({
        id: r.doc_id,
        tenantId: r.tenant_id,
        ...r.data,
      }));
    }
  },

  async selectById(table: string, id: string): Promise<any | null> {
    const isRelational = RELATIONAL_TABLES.includes(table);

    if (isRelational) {
      const data = await supabaseRestRequest(`/rest/v1/${table}?id=eq.${id}&select=*`);
      if (!data || data.length === 0) return null;
      return convertKeysToCamelCase(data[0]);
    } else {
      const data = await supabaseRestRequest(
        `/rest/v1/fleetos_collections?collection_name=eq.${table}&doc_id=eq.${id}&select=*`
      );
      if (!data || data.length === 0) return null;
      return { id: data[0].doc_id, tenantId: data[0].tenant_id, ...data[0].data };
    }
  },

  async insert(table: string, data: any): Promise<any> {
    const isRelational = RELATIONAL_TABLES.includes(table);
    const enriched = { ...data, createdAt: data.createdAt || new Date().toISOString() };

    if (isRelational) {
      const snakeData = convertKeysToSnakeCase(enriched);
      const res = await supabaseRestRequest(`/rest/v1/${table}`, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(snakeData),
      });
      return convertKeysToCamelCase(res[0]);
    } else {
      const docId = data.id || `doc-${Math.random().toString(36).substr(2, 9)}`;
      const tenantId = data.tenantId || "tenant-1";
      const cleanData = { ...enriched };
      delete cleanData.id;
      delete cleanData.tenantId;

      await supabaseRestRequest("/rest/v1/fleetos_collections", {
        method: "POST",
        body: JSON.stringify({
          collection_name: table,
          doc_id: docId,
          tenant_id: tenantId,
          data: cleanData,
        }),
      });
      return { id: docId, tenantId, ...cleanData };
    }
  },

  async update(table: string, id: string, data: any): Promise<void> {
    const isRelational = RELATIONAL_TABLES.includes(table);

    if (isRelational) {
      const snakeData = convertKeysToSnakeCase(data);
      await supabaseRestRequest(`/rest/v1/${table}?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify(snakeData),
      });
    } else {
      const existing = await this.selectById(table, id);
      const mergedData = { ...(existing || {}), ...data };
      delete mergedData.id;
      delete mergedData.tenantId;

      await supabaseRestRequest(
        `/rest/v1/fleetos_collections?collection_name=eq.${table}&doc_id=eq.${id}`,
        { method: "PATCH", body: JSON.stringify({ data: mergedData }) }
      );
    }
  },

  async delete(table: string, id: string): Promise<void> {
    const isRelational = RELATIONAL_TABLES.includes(table);

    if (isRelational) {
      await supabaseRestRequest(`/rest/v1/${table}?id=eq.${id}`, { method: "DELETE" });
    } else {
      await supabaseRestRequest(
        `/rest/v1/fleetos_collections?collection_name=eq.${table}&doc_id=eq.${id}`,
        { method: "DELETE" }
      );
    }
  },
};
