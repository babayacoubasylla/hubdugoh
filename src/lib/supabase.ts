import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ✅ LOGS DE DÉBOGAGE
console.log("🔍 [supabase.ts] VITE_SUPABASE_URL:", supabaseUrl);
console.log("🔍 [supabase.ts] VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Présent" : "❌ Manquant");
console.log("🔍 [supabase.ts] NODE_ENV:", import.meta.env.NODE_ENV);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ [supabase.ts] Variables d'environnement manquantes !");
  throw new Error('Missing Supabase environment variables')
}

console.log("✅ [supabase.ts] Initialisation du client Supabase...");

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

console.log("✅ [supabase.ts] Client Supabase initialisé");

// ✅ TEST DE CONNEXION
// Vérifier que la connexion fonctionne
supabase.from('profils').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error("❌ [supabase.ts] Erreur de connexion à la table profils:", error);
    } else {
      console.log("✅ [supabase.ts] Connexion réussie ! Nombre de profils:", count);
    }
  })
  .catch((err) => {
    console.error("❌ [supabase.ts] Erreur inattendue:", err);
  });

// Helper pour les erreurs
export const getErrorMessage = (error: any): string => {
  if (error?.message) return error.message
  if (typeof error === 'string') return error
  return 'Une erreur inattendue est survenue'
}