// FleetOS Lightweight Supabase Client Wrapper (Vite / saas-stack-infra version)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl !== "sua-url-supabase-aqui" &&
  !!supabaseKey &&
  supabaseKey !== "seu-anon-key-aqui";

// Relational tables used by saas-stack-infra
const RELATIONAL_TABLES = ["saas_plans", "saas_fleets"];

async function supabaseRequest(path: string, options: RequestInit = {}) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase não configurado no SaaS Stack Infra.");
  }

  const url = `${supabaseUrl}${path}`;
  const headers = {
    "apikey": supabaseKey,
    "Authorization": `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errText = await response.text();
    console.error(`Erro no Supabase (Infra) em ${path}:`, errText);
    throw new Error(`Erro do Supabase: ${response.statusText} (${response.status}) - ${errText}`);
  }
  
  if (response.status === 204) return null;
  return response.json();
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function convertKeysToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(convertKeysToSnakeCase);
  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key) => {
      const snakeKey = toSnakeCase(key);
      acc[snakeKey] = convertKeysToSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

function toCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/g, group =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );
}

function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(convertKeysToCamelCase);
  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key) => {
      const camelKey = toCamelCase(key);
      acc[camelKey] = convertKeysToCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

export const supabase = {
  db: {
    async select(table: string): Promise<any[]> {
      const isRelational = RELATIONAL_TABLES.includes(table);
      if (isRelational) {
        const data = await supabaseRequest(`/rest/v1/${table}?select=*`);
        return convertKeysToCamelCase(data);
      } else {
        // Fallback for non-infra tables if queried
        const rows = await supabaseRequest(`/rest/v1/fleetos_collections?collection_name=eq.${table}&select=*`);
        return rows.map((r: any) => ({
          id: r.doc_id,
          tenantId: r.tenant_id,
          ...r.data
        }));
      }
    },

    async insert(table: string, data: any): Promise<any> {
      const isRelational = RELATIONAL_TABLES.includes(table);
      const enriched = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString()
      };

      if (isRelational) {
        const snakeData = convertKeysToSnakeCase(enriched);
        const res = await supabaseRequest(`/rest/v1/${table}`, {
          method: "POST",
          headers: { "Prefer": "return=representation" },
          body: JSON.stringify(snakeData)
        });
        return convertKeysToCamelCase(res[0]);
      } else {
        const docId = data.id || `doc-${Math.random().toString(36).substr(2, 9)}`;
        const tenantId = data.tenantId || "tenant-1";
        const cleanData = { ...enriched };
        delete cleanData.id;
        delete cleanData.tenantId;

        await supabaseRequest("/rest/v1/fleetos_collections", {
          method: "POST",
          body: JSON.stringify({
            collection_name: table,
            doc_id: docId,
            tenant_id: tenantId,
            data: cleanData
          })
        });
        return { id: docId, tenantId, ...cleanData };
      }
    },

    async update(table: string, id: string, data: any): Promise<void> {
      const isRelational = RELATIONAL_TABLES.includes(table);
      if (isRelational) {
        const snakeData = convertKeysToSnakeCase(data);
        await supabaseRequest(`/rest/v1/${table}?id=eq.${id}`, {
          method: "PATCH",
          body: JSON.stringify(snakeData)
        });
      } else {
        const data = await supabaseRequest(`/rest/v1/fleetos_collections?collection_name=eq.${table}&doc_id=eq.${id}&select=*`);
        const existing = data && data.length > 0 ? data[0].data : {};
        const mergedData = { ...existing, ...data };
        await supabaseRequest(`/rest/v1/fleetos_collections?collection_name=eq.${table}&doc_id=eq.${id}`, {
          method: "PATCH",
          body: JSON.stringify({ data: mergedData })
        });
      }
    }
  }
};
