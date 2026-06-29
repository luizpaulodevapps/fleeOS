// FleetOS Lightweight Supabase Client Wrapper (Fetch-based for React 19 & Next.js 15 Compatibility)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl !== "sua-url-supabase-aqui" &&
  !!supabaseKey &&
  supabaseKey !== "seu-anon-key-aqui";

// Relational Postgres tables. All other tables will map to the generic JSONB table 'fleetos_collections'
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
  "saas_fleets"
];

async function supabaseRequest(path: string, options: RequestInit = {}) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase não configurado. Certifique-se de configurar as chaves no arquivo .env.");
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
    console.error(`Erro no Supabase em ${path}:`, errText);
    throw new Error(`Erro do Supabase: ${response.statusText} (${response.status}) - ${errText}`);
  }
  
  if (response.status === 204) return null; // No Content
  return response.json();
}

// Convert column name formatting if necessary (relational tables use snake_case)
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
  // Authentication via GoTrue endpoints
  auth: {
    async signIn(email: string, pass: string) {
      const res = await supabaseRequest("/auth/v1/token?grant_type=password", {
        method: "POST",
        body: JSON.stringify({ email, password: pass }),
      });
      return {
        uid: res.user.id,
        email: res.user.email,
        displayName: res.user.user_metadata?.displayName || res.user.email,
        accessToken: res.access_token,
      };
    },
    
    async signUp(email: string, pass: string, metadata: any = {}) {
      const res = await supabaseRequest("/auth/v1/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password: pass,
          data: metadata
        }),
      });
      return res.user;
    },

    async signOut() {
      // Typically client just clears storage/tokens, but we can hit the API endpoint
      try {
        await supabaseRequest("/auth/v1/logout", { method: "POST" });
      } catch (e) {
        console.warn("Logout no Supabase ignorado:", e);
      }
    }
  },

  // Database CRUD Operations with auto JSONB vs Relational routing
  db: {
    async select(table: string, tenantId?: string): Promise<any[]> {
      const isRelational = RELATIONAL_TABLES.includes(table);

      if (isRelational) {
        const query = tenantId ? `?tenant_id=eq.${tenantId}` : "";
        const data = await supabaseRequest(`/rest/v1/${table}${query}&select=*`);
        return convertKeysToCamelCase(data);
      } else {
        // Query generic collections table
        const query = tenantId 
          ? `?collection_name=eq.${table}&tenant_id=eq.${tenantId}`
          : `?collection_name=eq.${table}`;
        const rows = await supabaseRequest(`/rest/v1/fleetos_collections${query}&select=*`);
        return rows.map((r: any) => ({
          id: r.doc_id,
          tenantId: r.tenant_id,
          ...r.data
        }));
      }
    },

    async selectById(table: string, id: string): Promise<any | null> {
      const isRelational = RELATIONAL_TABLES.includes(table);

      if (isRelational) {
        // For user_profiles, primary key in schema is 'id', but some code references it as 'uid'.
        const pk = table === "user_profiles" ? "id" : "id";
        const data = await supabaseRequest(`/rest/v1/${table}?${pk}=eq.${id}&select=*`);
        if (!data || data.length === 0) return null;
        return convertKeysToCamelCase(data[0]);
      } else {
        const data = await supabaseRequest(`/rest/v1/fleetos_collections?collection_name=eq.${table}&doc_id=eq.${id}&select=*`);
        if (!data || data.length === 0) return null;
        return {
          id: data[0].doc_id,
          tenantId: data[0].tenant_id,
          ...data[0].data
        };
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
        
        // Remove duplicate keys to store only clean payload in the JSONB field
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
        const pk = table === "user_profiles" ? "id" : "id";
        await supabaseRequest(`/rest/v1/${table}?${pk}=eq.${id}`, {
          method: "PATCH",
          body: JSON.stringify(snakeData)
        });
      } else {
        // Fetch existing first to do partial merge of the data JSONB field
        const existing = await this.selectById(table, id);
        const mergedData = {
          ...(existing || {}),
          ...data
        };
        delete mergedData.id;
        delete mergedData.tenantId;

        await supabaseRequest(`/rest/v1/fleetos_collections?collection_name=eq.${table}&doc_id=eq.${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            data: mergedData
          })
        });
      }
    },

    async delete(table: string, id: string): Promise<void> {
      const isRelational = RELATIONAL_TABLES.includes(table);

      if (isRelational) {
        const pk = table === "user_profiles" ? "id" : "id";
        await supabaseRequest(`/rest/v1/${table}?${pk}=eq.${id}`, {
          method: "DELETE"
        });
      } else {
        await supabaseRequest(`/rest/v1/fleetos_collections?collection_name=eq.${table}&doc_id=eq.${id}`, {
          method: "DELETE"
        });
      }
    }
  }
};
