// src/test/supabase-test.ts
import { supabase } from '@/lib/supabase'

export async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('configuration')
            .select('*')
            .limit(1)

        if (error) {
            console.error('❌ Erreur de connexion:', error)
            return false
        }

        console.log('✅ Connexion Supabase réussie !', data)
        return true
    } catch (error) {
        console.error('❌ Erreur:', error)
        return false
    }
}