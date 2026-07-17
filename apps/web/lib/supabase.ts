import { createClient } from "@supabase/supabase-js";

// Fallback defensivo: evita que o build quebre inteiro caso as variáveis de
// ambiente não estejam disponíveis no momento exato do build na Vercel.
// Em uso normal (com as variáveis configuradas), os valores reais são usados.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
