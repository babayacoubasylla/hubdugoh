export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "livreur" | "commercant" | "client";
          nom: string;
          telephone: string;
          adresse: string;
          quartier: string;
          photo_url: string | null;
          verifie: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      livreurs: {
        Row: {
          id: string;
          profile_id: string;
          moto: string;
          zone_couverture: string;
          disponible: boolean;
          note_moyenne: number;
          missions_realisees: number;
          piece_identite_url: string | null;
          photo_moto_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      restaurants: {
        Row: {
          id: string;
          nom: string;
          description: string;
          telephone: string;
          adresse: string;
          quartier: string;
          image_url: string | null;
          note_moyenne: number;
          ouvert: boolean;
          horaires: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      menus: {
        Row: {
          id: string;
          restaurant_id: string;
          nom: string;
          description: string;
          prix: number;
          image_url: string | null;
          disponible: boolean;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      boutiques: {
        Row: {
          id: string;
          profile_id: string;
          nom_boutique: string;
          description: string;
          telephone: string;
          adresse: string;
          quartier: string;
          image_url: string | null;
          note_moyenne: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      produits: {
        Row: {
          id: string;
          boutique_id: string;
          nom: string;
          description: string;
          prix: number;
          categorie: string;
          image_url: string | null;
          en_stock: boolean;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      missions: {
        Row: {
          id: string;
          type: "restauration" | "commerce" | "course";
          description: string;
          client_id: string;
          client_nom: string;
          client_tel: string;
          adresse_pickup: string;
          adresse_livraison: string;
          statut:
            | "en_attente"
            | "acceptee"
            | "recuperation"
            | "en_cours"
            | "livree"
            | "annulee";
          livreur_id: string | null;
          prix: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      etapes_mission: {
        Row: {
          id: string;
          mission_id: string;
          nom: string;
          complete: boolean;
          horodatage: string | null;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      avis: {
        Row: {
          id: string;
          mission_id: string;
          client_id: string;
          livreur_id: string;
          note: number;
          commentaire: string | null;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
