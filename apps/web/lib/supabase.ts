"use client";

import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase para uso em Client Components.
//
// Usa @supabase/ssr (createBrowserClient) em vez do createClient() puro do
// @supabase/supabase-js: a diferença é que a sessão fica guardada em cookies
// (em vez de localStorage), o que permite que o middleware e os Server
// Components enxerguem o mesmo usuário logado que o navegador. É a peça que
// faz o login "conversar" com o resto do Next.js (App Router).
//
// Mantemos o nome de export "supabase" para não quebrar os ~30 arquivos que
// já importam `{ supabase } from "@/lib/supabase"` em todo o projeto.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
