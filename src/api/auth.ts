import { supabase, getErrorMessage } from '@/lib/supabase'
import type { Profil, LoginForm, InscriptionForm, Livreur, Commercant } from '@/types'

export const apiAuth = {
    // Connexion
    async login(data: LoginForm) {
        console.log("🔍 Tentative de connexion pour:", data.telephone);
        console.log("📌 Type du téléphone:", typeof data.telephone);
        console.log("📌 Longueur du téléphone:", data.telephone.length);

        // 1. Vérifier si l'utilisateur existe - Avec .select() pour déboguer
        const { data: profils, error } = await supabase
            .from('profils')
            .select('*')
            .ilike('telephone', `%${data.telephone.trim()}%`)

        console.log("📦 Résultat brut de la requête:", profils);
        console.log("❌ Erreur de la requête:", error);

        if (error) {
            console.error("❌ Erreur requête:", error);
            throw new Error('Numéro de téléphone ou mot de passe incorrect');
        }

        if (!profils || profils.length === 0) {
            console.error("❌ Aucun utilisateur trouvé pour:", data.telephone);

            // Debug: Voir tous les téléphones en base
            const { data: allUsers } = await supabase
                .from('profils')
                .select('telephone, nom, role');
            console.log("📋 Tous les téléphones en base:", allUsers?.map(u => ({ tel: u.telephone, nom: u.nom, role: u.role })));

            throw new Error('Numéro de téléphone ou mot de passe incorrect');
        }

        const profil = profils[0];
        console.log("✅ Profil trouvé:", { id: profil.id, nom: profil.nom, role: profil.role });

        // 2. Vérifier le mot de passe - Version avec mot de passe UNIQUE pour admin
        const isAdmin = profil.role === 'admin';
        let isPasswordValid = false;

        if (isAdmin) {
            // ✅ MOT DE PASSE ADMIN: Admin@2026!
            isPasswordValid = data.password === 'Admin@2026!';

            // ⚠️ En développement, accepter aussi admin123
            if (process.env.NODE_ENV === 'development' && data.password === 'admin123') {
                isPasswordValid = true;
            }

            console.log("🔐 Vérification admin - Mot de passe valide:", isPasswordValid);
        } else {
            // Pour les autres utilisateurs (client, livreur, commercant)
            const defaultPasswords = [
                'password123',
                'livreur123',
                'client123',
                'commerce123',
                '123456',
                'test123',
                '000000',
                profil.telephone, // Le téléphone comme mot de passe
                profil.nom.toLowerCase().replace(/\s/g, ''), // Le nom comme mot de passe
            ];
            isPasswordValid = defaultPasswords.includes(data.password);
            console.log("🔐 Vérification utilisateur - Mot de passe valide:", isPasswordValid);
        }

        if (!isPasswordValid) {
            console.error("❌ Mot de passe incorrect pour:", data.telephone);
            console.log("ℹ️ Mot de passe essayé:", data.password);
            throw new Error('Numéro de téléphone ou mot de passe incorrect');
        }

        console.log("✅ Mot de passe valide");

        // 3. Récupérer les infos supplémentaires selon le rôle
        let livreurData: Livreur | null = null;
        let commercantData: Commercant | null = null;

        if (profil.role === 'livreur') {
            console.log("🔄 Chargement des données livreur...");
            const { data: livreur, error: livreurError } = await supabase
                .from('livreurs')
                .select('*')
                .eq('profil_id', profil.id)
                .maybeSingle();

            if (livreurError) {
                console.error("❌ Erreur chargement livreur:", livreurError.message);
            } else if (livreur) {
                livreurData = livreur as Livreur;
                console.log("✅ Livreur chargé:", { id: livreurData.id, moto: livreurData.moto });
            } else {
                console.log("⚠️ Aucune donnée livreur trouvée pour ce profil");
            }
        }

        if (profil.role === 'commercant') {
            console.log("🔄 Chargement des données commerçant...");
            const { data: commercant, error: commercantError } = await supabase
                .from('commercants')
                .select('*')
                .eq('profil_id', profil.id)
                .maybeSingle();

            if (commercantError) {
                console.error("❌ Erreur chargement commerçant:", commercantError.message);
            } else if (commercant) {
                commercantData = commercant as Commercant;
                console.log("✅ Commerçant chargé:", { id: commercantData.id, nom: commercantData.nom_commerce });
            } else {
                // Créer un commerçant automatiquement s'il n'existe pas
                console.log("🔄 Création automatique du commerçant...");
                const { data: newCommercant, error: createError } = await supabase
                    .from('commercants')
                    .insert({
                        profil_id: profil.id,
                        nom_commerce: `Boutique de ${profil.nom}`,
                        type_commerce: 'boutique',
                        adresse: 'À définir',
                        quartier: 'Gagnoa Centre',
                        ouvert: true,
                        frais_livraison: 500,
                        delai_livraison: '30-45 min',
                        note_moyenne: 0,
                        abonnement_actif: true
                    })
                    .select()
                    .maybeSingle();

                if (createError) {
                    console.error("❌ Erreur création commerçant:", createError);
                } else {
                    commercantData = newCommercant as Commercant;
                    console.log("✅ Commerçant créé automatiquement:", commercantData);
                }
            }
        }

        const result = {
            profil,
            livreur: livreurData,
            commercant: commercantData
        };

        console.log("📦 Résultat final:", {
            profil: result.profil ? { id: result.profil.id, role: result.profil.role } : null,
            livreur: result.livreur ? { id: result.livreur.id } : null,
            commercant: result.commercant ? { id: result.commercant.id } : null
        });

        return result;
    },

    // Inscription
    async register(data: InscriptionForm) {
        console.log("📝 Inscription pour:", data.telephone);

        // Vérifier si le téléphone existe déjà
        const { data: existing } = await supabase
            .from('profils')
            .select('id')
            .eq('telephone', data.telephone)
            .maybeSingle();

        if (existing) {
            throw new Error('Ce numéro de téléphone est déjà utilisé');
        }

        // Créer le profil
        const { data: profil, error: profilError } = await supabase
            .from('profils')
            .insert({
                telephone: data.telephone,
                nom: data.nom,
                email: data.email || null,
                role: data.role || 'client',
                verifie: data.role === 'admin' ? true : false,
                actif: true,
                date_inscription: new Date().toISOString()
            })
            .select()
            .single();

        if (profilError) {
            console.error('❌ Erreur insertion profil:', profilError);
            throw new Error('Erreur lors de la création du profil: ' + profilError.message);
        }

        console.log("✅ Profil créé:", { id: profil.id, role: profil.role });

        // Créer les données spécifiques au rôle
        if (data.role === 'livreur') {
            const { error: livreurError } = await supabase
                .from('livreurs')
                .insert({
                    profil_id: profil.id,
                    moto: data.moto || 'Non spécifié',
                    zone_couverture: data.zone ? [data.zone] : ['Gagnoa Centre'],
                    disponible: true,
                    missions_realisees: 0,
                    note_moyenne: 0
                });

            if (livreurError) {
                console.error('❌ Erreur insertion livreur:', livreurError);
                await supabase.from('profils').delete().eq('id', profil.id);
                throw new Error('Erreur lors de la création du livreur: ' + livreurError.message);
            }
            console.log("✅ Livreur créé");
        }

        if (data.role === 'commercant') {
            const { error: commercantError } = await supabase
                .from('commercants')
                .insert({
                    profil_id: profil.id,
                    nom_commerce: data.nom_commerce || `Boutique de ${data.nom}`,
                    type_commerce: data.type_commerce || 'boutique',
                    adresse: data.adresse || 'À définir',
                    quartier: data.quartier || 'Gagnoa Centre',
                    ouvert: true,
                    frais_livraison: 500,
                    delai_livraison: '30-45 min',
                    note_moyenne: 0,
                    abonnement_actif: true
                });

            if (commercantError) {
                console.error('❌ Erreur insertion commercant:', commercantError);
                await supabase.from('profils').delete().eq('id', profil.id);
                throw new Error('Erreur lors de la création du commerçant: ' + commercantError.message);
            }
            console.log("✅ Commerçant créé");
        }

        console.log("✅ Inscription terminée pour:", data.telephone);
        return profil;
    },

    // Déconnexion
    async logout() {
        console.log("🔓 Déconnexion");
        return { success: true };
    },

    // Vérifier si l'utilisateur est authentifié
    async checkAuth() {
        const stored = localStorage.getItem('gagnoa_digital_user');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                return data.profil || null;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
};