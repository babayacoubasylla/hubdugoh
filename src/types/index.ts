// ==========================================
// TYPES PRINCIPAUX
// ==========================================

export type Role = 'admin' | 'livreur' | 'commercant' | 'client'
export type TypeCommerce = 'restaurant' | 'boutique'
export type TypeCommande = 'restauration' | 'commerce' | 'course'
export type StatutCommande = 'en_attente' | 'acceptee' | 'preparation' | 'recuperation' | 'en_cours' | 'livree' | 'annulee'
export type StatutMission = 'disponible' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee'
export type TypeNotification = 'commande' | 'mission' | 'alerte' | 'promotion' | 'systeme'

// ==========================================
// INTERFACES UTILISATEURS
// ==========================================

export interface Profil {
    id: string
    email: string | null
    telephone: string
    nom: string
    role: Role
    photo_url: string | null
    verifie: boolean
    actif: boolean
    date_inscription: string
    updated_at: string
}

export interface Livreur {
    id: string
    profil_id: string
    profil?: Profil
    moto: string
    plaque: string | null
    zone_couverture: string[]
    disponible: boolean
    note_moyenne: number
    missions_realisees: number
    piece_identite_url: string | null
    photo_moto_url: string | null
    permis_url: string | null
    coordonnees: Coordonnees | null
    created_at: string
    updated_at: string
}

export interface Commercant {
    id: string
    profil_id: string
    profil?: Profil
    nom_commerce: string
    type_commerce: TypeCommerce
    description: string | null
    telephone: string | null
    adresse: string
    quartier: string
    zone: string
    image_url: string | null
    banniere_url: string | null
    photo_profil_url: string | null
    note_moyenne: number
    ouvert: boolean
    horaires: Horaires | null
    livraison_gratuite: boolean
    frais_livraison: number
    delai_livraison: string
    coordonnees: Coordonnees | null
    abonnement_actif: boolean
    date_abonnement: string
    created_at: string
    updated_at: string
}

// ==========================================
// INTERFACES PRODUITS & COMMANDES
// ==========================================

export interface Produit {
    id: string
    commercant_id: string
    nom: string
    description: string | null
    prix: number
    categorie: string | null
    image_url: string | null
    disponible: boolean
    est_recommande: boolean
    created_at: string
    updated_at: string
}

export interface ProduitCommande {
    id: string
    nom: string
    prix: number
    quantite: number
    total: number
}

export interface Commande {
    id: string
    reference: string
    client_id: string
    commercant_id: string
    type: TypeCommande
    statut: StatutCommande

    client_nom: string
    client_telephone: string
    client_adresse: string
    client_quartier: string

    commerce_nom: string
    commerce_adresse: string

    livreur_id: string | null
    livreur_nom: string | null

    produits: ProduitCommande[]
    sous_total: number
    frais_livraison: number
    commission_plateforme: number
    total: number

    mode_paiement: string
    paiement_effectue: boolean

    etapes: EtapeMission[]
    temps_preparation: number | null
    temps_livraison: number | null

    coordonnees_client: Coordonnees | null
    coordonnees_livreur: Coordonnees | null

    date_commande: string
    date_livraison: string | null
    created_at: string
    updated_at: string
}

// ==========================================
// INTERFACES MISSIONS & AVIS
// ==========================================

export interface Mission {
    id: string
    commande_id: string
    livreur_id: string | null
    statut: StatutMission
    date_acceptation: string | null
    date_debut: string | null
    date_fin: string | null
    gain_livreur: number | null
    commission_plateforme: number | null
    created_at: string
    updated_at: string
}

export interface Avis {
    id: string
    commande_id: string
    client_id: string
    livreur_id: string | null
    commercant_id: string | null
    note: number
    commentaire: string | null
    date_avis: string
    created_at: string
}

// ==========================================
// INTERFACES SUPPORT
// ==========================================

export interface Coordonnees {
    lat: number
    lng: number
}

export interface Horaires {
    ouvert: string
    fermeture: string
}

export interface EtapeMission {
    nom: string
    complete: boolean
    horodatage?: string
}

export interface Notification {
    id: string
    user_id: string
    titre: string
    message: string
    type: TypeNotification
    lu: boolean
    lien: string | null
    date_envoi: string
    created_at: string
}

export interface Configuration {
    id: string
    cle: string
    valeur: string
    description: string | null
    updated_at: string
}

// ==========================================
// INTERFACES POUR FORMULAIRES
// ==========================================

export interface LoginForm {
    telephone: string
    password: string
}

export interface InscriptionForm {
    nom: string
    telephone: string
    email?: string
    password: string
    role: Role
    // Livreur
    moto?: string
    zone?: string
    // Commercant
    nom_commerce?: string
    type_commerce?: TypeCommerce
    adresse?: string
    quartier?: string
}

export interface CommandeForm {
    type: TypeCommande
    produits: ProduitCommande[]
    client_nom: string
    client_telephone: string
    client_adresse: string
    client_quartier: string
    commerce_id: string
    mode_paiement?: string
}

// ==========================================
// INTERFACES STATISTIQUES
// ==========================================

export interface StatsAdmin {
    total_utilisateurs: number
    total_commandes: number
    total_livreurs: number
    total_commercants: number
    total_chiffre_affaires: number
    commissions_plateforme: number
    commandes_aujourdhui: number
    livreurs_actifs: number
    commandes_par_statut: Record<StatutCommande, number>
    evolution_mensuelle: {
        mois: string
        commandes: number
        revenus: number
    }[]
}

export interface StatsLivreur {
    missions_total: number
    missions_mois: number
    gains_total: number
    gains_mois: number
    note_moyenne: number
    temps_moyen_livraison: number
    missions_par_statut: Record<StatutMission, number>
}

export interface StatsCommercant {
    commandes_total: number
    commandes_mois: number
    revenus_total: number
    revenus_mois: number
    note_moyenne: number
    produits_populaires: { nom: string; quantite: number }[]
    commandes_par_statut: Record<StatutCommande, number>
}

// ==========================================
// INTERFACES COURSES
// ==========================================

export interface Course {
    id: string
    titre: string
    description: string | null
    prix: number
    icon: string
    actif: boolean
    created_at: string
    updated_at: string
}

export interface SupplementCourse {
    id: string
    nom: string
    description: string | null
    prix: number
    type: 'poids' | 'valeur' | 'distance' | 'urgence' | 'autre'
    actif: boolean
    created_at: string
}

// ==========================================
// INTERFACES NOUVELLES FONCTIONNALITÉS
// ==========================================

export interface PharmacieGarde {
    id: string
    nom: string
    adresse: string
    telephone: string
    date_debut: string
    date_fin: string
    actif: boolean
    created_at: string
    updated_at: string
}

export interface Promo {
    id: string
    titre: string
    description: string | null
    image_url: string | null
    commercant_id: string | null
    lien_externe: string | null
    date_debut: string
    date_fin: string | null
    actif: boolean
    created_at: string
    updated_at: string
    commercant?: {
        nom_commerce: string
        banniere_url: string | null
    } | null
}

export interface ActuVille {
    id: string
    titre: string
    contenu: string
    image_url: string | null
    date_publication: string
    actif: boolean
    created_at: string
    updated_at: string
}

// ==========================================
// INTERFACES CHAT
// ==========================================

export interface ChatMessage {
    id: string
    commande_id: string
    sender_id: string
    sender_nom: string
    sender_role: string
    message: string
    created_at: string
}

// ==========================================
// INTERFACES FIDÉLITÉ
// ==========================================

export interface PointsFidelite {
    id: string
    user_id: string
    total: number
    utilises: number
    historique: {
        type: 'gagne' | 'utilise'
        points: number
        description: string
        date: string
    }[]
    created_at: string
    updated_at: string
}

// ==========================================
// INTERFACES ZONES DE LIVRAISON
// ==========================================

export interface ZoneLivraison {
    id: string
    nom: string
    description: string | null
    frais: number
    quartiers: string[]
    created_at: string
    updated_at: string
}