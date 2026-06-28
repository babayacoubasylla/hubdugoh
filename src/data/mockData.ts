/* eslint-disable @typescript-eslint/no-unused-vars */

export interface MenuItem {
  id: string;
  nom: string;
  description: string;
  prix: number;
  image: string;
  disponible: boolean;
}

export interface Restaurant {
  id: string;
  nom: string;
  description: string;
  telephone: string;
  adresse: string;
  quartier: string;
  image: string;
  note: number;
  menus: MenuItem[];
  ouvert: boolean;
  horaires: string;
  livraison: number;
  delai: string;
}

export interface ProduitBoutique {
  id: string;
  nom: string;
  description: string;
  prix: number;
  image: string;
  categorie: string;
  vendeurId: string;
  boutiqueNom: string;
  stock: boolean;
}

export interface Boutique {
  id: string;
  boutiqueNom: string;
  vendeurNom: string;
  telephone: string;
  adresse: string;
  quartier: string;
  image: string;
  note: number;
  description: string;
  produits: ProduitBoutique[];
}

export interface Livreur {
  id: string;
  nom: string;
  telephone: string;
  moto: string;
  zone: string;
  note: number;
  disponible: boolean;
  missions: number;
  photo: string;
  verifie: boolean;
}

export interface Mission {
  id: string;
  type: "restauration" | "commerce" | "course";
  description: string;
  client: string;
  clientTel: string;
  adressePickup: string;
  adresseLivraison: string;
  statut: "en_attente" | "acceptee" | "recuperation" | "en_cours" | "livree" | "annulee";
  livreurId?: string;
  livreurNom?: string;
  date: string;
  prix: number;
  etapes: EtapeMission[];
}

export interface EtapeMission {
  nom: string;
  complete: boolean;
  horodatage?: string;
}

// ── RESTAURANTS ──
export const restaurants: Restaurant[] = [
  {
    id: "r1", nom: "Maquis Le Bokadios",
    description: "Spécialités ivoiriennes authentiques. Attiéké poisson, poulet braisé au feu de bois, alloco, garba. Cuisine maison comme au village.",
    telephone: "+225 07 00 00 01", adresse: "Route de Lakota", quartier: "Sokoura",
    image: "/images/resto-bokadios.jpg", note: 4.5, ouvert: true, horaires: "08:00 - 22:00", livraison: 500, delai: "25-35 min",
    menus: [
      { id: "m1", nom: "Attiéké Poisson Braisé", description: "Attiéké frais avec poisson tilapia entier braisé, sauce tomate épicée, oignons frais", prix: 1500, image: "/images/attieke-poisson.jpg", disponible: true },
      { id: "m2", nom: "Poulet Braisé Complet", description: "Poulet braisé entier croustillant, alloco banane, piment frais. Pour 2 personnes.", prix: 3000, image: "/images/poulet-braise.jpg", disponible: true },
      { id: "m3", nom: "Garba", description: "Attiéké avec thon frit, tomates fraîches et oignons. Le classique ivoirien.", prix: 1000, image: "/images/garba.jpg", disponible: true },
      { id: "m4", nom: "Riz Sauce Arachide", description: "Riz blanc parfumé, sauce arachide onctueuse, viande de bœuf tendre.", prix: 2000, image: "", disponible: true },
      { id: "m5", nom: "Alloco Poulet", description: "Bananes plantain frites avec poulet grillé, sauce pimentée.", prix: 1800, image: "", disponible: true },
      { id: "m6", nom: "Poisson Braisé Sauce Claire", description: "Poisson capitaine braisé, sauce claire aux légumes, riz ou attiéké.", prix: 2500, image: "", disponible: true },
    ],
  },
  {
    id: "r2", nom: "Restaurant Le Baobab",
    description: "Cuisine africaine raffinée et internationale. Cadre climatisé, service soigné, plats copieux.",
    telephone: "+225 07 00 00 02", adresse: "Avenue Houphouët-Boigny", quartier: "Commerce",
    image: "/images/resto-baobab.jpg", note: 4.2, ouvert: true, horaires: "07:00 - 23:00", livraison: 700, delai: "30-40 min",
    menus: [
      { id: "m7", nom: "Foutou Banane Sauce Graine", description: "Foutou banane onctueux, sauce graine riche, poisson fumé. Un délice.", prix: 2000, image: "", disponible: true },
      { id: "m8", nom: "Boukadios", description: "Riz avec sauce tomate mijotée, viande de bœuf tendre et légumes frais.", prix: 1800, image: "", disponible: true },
      { id: "m9", nom: "Brochettes Bœuf (x5)", description: "Brochettes de bœuf mariné grillées, frites maison croustillantes.", prix: 2500, image: "", disponible: true },
      { id: "m10", nom: "Kedjenou Poulet", description: "Poulet mijoté à l'étouffée dans sa sauce, bananes, légumes du marché.", prix: 2800, image: "", disponible: true },
    ],
  },
  {
    id: "r3", nom: "Fast-Food Le Gagnolais",
    description: "Burgers maison, poulet frit croustillant, frites épicées. Le fast-food 100% gagnolais.",
    telephone: "+225 07 00 00 03", adresse: "Boulevard de la Paix", quartier: "Résidentiel",
    image: "/images/resto-gagnolais.jpg", note: 4.0, ouvert: true, horaires: "10:00 - 00:00", livraison: 500, delai: "20-30 min",
    menus: [
      { id: "m11", nom: "Burger Gagnolais", description: "Double steak, fromage, salade, tomate, oignons, sauce secrète maison.", prix: 2500, image: "", disponible: true },
      { id: "m12", nom: "Poulet Frit 4 Pièces", description: "Poulet mariné 12h, panure épicée, frites. Irrésistible.", prix: 3000, image: "", disponible: true },
      { id: "m13", nom: "Sandwich Poulet", description: "Pain baguette croustillant, poulet grillé, crudités, sauce mayo.", prix: 1200, image: "", disponible: true },
      { id: "m14", nom: "Menu Enfant", description: "Burger mini, frites, jus de fruit. Pour les petits appétits.", prix: 1500, image: "", disponible: true },
    ],
  },
  {
    id: "r4", nom: "Chez Tantine Akissi",
    description: "La référence du poisson braisé à Gagnoa. Terrasse ombragée, cuisine au feu de bois, service familial.",
    telephone: "+225 07 00 00 04", adresse: "Quartier Garçons", quartier: "Garçons",
    image: "", note: 4.7, ouvert: true, horaires: "09:00 - 21:00", livraison: 600, delai: "30-45 min",
    menus: [
      { id: "m15", nom: "Capitaine Braisé Entier", description: "Poisson capitaine braisé entier, attiéké, alloco, sauce pimentée.", prix: 3500, image: "", disponible: true },
      { id: "m16", nom: "Sole Braisée", description: "Sole fraîche braisée, riz créole, légumes sautés.", prix: 2500, image: "", disponible: true },
      { id: "m17", nom: "Plat Végétarien", description: "Riz, sauce arachide sans viande, légumes du jour.", prix: 1500, image: "", disponible: true },
    ],
  },
];

// ── BOUTIQUES ──
export const boutiques: Boutique[] = [
  {
    id: "b1", boutiqueNom: "Mode Gagnoa", vendeurNom: "Aya Konan",
    telephone: "+225 07 00 00 10", adresse: "Marché central", quartier: "Commerce",
    image: "/images/boutique-mode.jpg", note: 4.3,
    description: "Vêtements africains haut de gamme. Wax, basins, pagnes tissés. Prêt-à-porter et sur mesure.",
    produits: [
      { id: "p1", nom: "Robe Wax Élégante", description: "Robe en wax africain haut de gamme. Sur mesure. Tissu de qualité supérieure. Disponible en plusieurs couleurs.", prix: 8000, image: "/images/robe-wax.jpg", categorie: "Vêtements", vendeurId: "b1", boutiqueNom: "Mode Gagnoa", stock: true },
      { id: "p2", nom: "Ensemble Pagne Homme", description: "Chemise et pantalon en pagne traditionnel. Finitions soignées, coupe moderne.", prix: 12000, image: "", categorie: "Vêtements", vendeurId: "b1", boutiqueNom: "Mode Gagnoa", stock: true },
      { id: "p3", nom: "T-shirt Brodé", description: "T-shirt coton bio avec broderie artisanale ivoirienne. Unique.", prix: 4000, image: "", categorie: "Vêtements", vendeurId: "b1", boutiqueNom: "Mode Gagnoa", stock: true },
      { id: "p4", nom: "Sandales en Cuir", description: "Sandales homme en cuir véritable tanné localement. Semelle robuste.", prix: 5000, image: "", categorie: "Chaussures", vendeurId: "b1", boutiqueNom: "Mode Gagnoa", stock: true },
    ],
  },
  {
    id: "b2", boutiqueNom: "Beauté Nature", vendeurNom: "Mariam Touré",
    telephone: "+225 07 00 00 12", adresse: "Avenue Houphouët", quartier: "Sokoura",
    image: "", note: 4.6,
    description: "Cosmétiques naturels africains. Savon noir, beurre de karité, huiles essentielles.",
    produits: [
      { id: "p5", nom: "Savon Noir Artisanal (lot 3)", description: "Savon noir africain pur, fabrication locale. Nettoie, purifie, illumine la peau.", prix: 1500, image: "", categorie: "Cosmétiques", vendeurId: "b2", boutiqueNom: "Beauté Nature", stock: true },
      { id: "p6", nom: "Beurre de Karité Pur 250g", description: "Beurre de karité 100% naturel non raffiné. Idéal peau et cheveux.", prix: 2000, image: "", categorie: "Cosmétiques", vendeurId: "b2", boutiqueNom: "Beauté Nature", stock: true },
      { id: "p7", nom: "Huile de Coco Bio 100ml", description: "Huile de coco vierge pressée à froid. Multi-usage.", prix: 2500, image: "", categorie: "Cosmétiques", vendeurId: "b2", boutiqueNom: "Beauté Nature", stock: true },
    ],
  },
  {
    id: "b3", boutiqueNom: "Accessoires & Co", vendeurNom: "Koffi Yao",
    telephone: "+225 07 00 00 11", adresse: "Rue du marché", quartier: "Commerce",
    image: "", note: 4.0,
    description: "Accessoires de mode, bijoux artisanaux, sacs en raphia. 100% fait main en Côte d'Ivoire.",
    produits: [
      { id: "p8", nom: "Collier en Perles", description: "Collier traditionnel en perles artisanales. Motifs ivoiriens authentiques.", prix: 3500, image: "", categorie: "Accessoires", vendeurId: "b3", boutiqueNom: "Accessoires & Co", stock: true },
      { id: "p9", nom: "Sac en Raphia", description: "Sac tressé à la main, motifs géométriques, anses en cuir. Pièce unique.", prix: 6500, image: "", categorie: "Accessoires", vendeurId: "b3", boutiqueNom: "Accessoires & Co", stock: true },
    ],
  },
];

// Tous les produits à plat
export const tousProduits: ProduitBoutique[] = boutiques.flatMap((b) => b.produits);

// ── LIVREURS ──
export const livreurs: Livreur[] = [
  { id: "l1", nom: "Moussa Traoré", telephone: "+225 07 00 00 20", moto: "Yamaha Jog 125", zone: "Gagnoa Centre", note: 4.8, disponible: true, missions: 187, photo: "", verifie: true },
  { id: "l2", nom: "Adama Ouattara", telephone: "+225 07 00 00 21", moto: "Haojue HJ125", zone: "Sokoura - Commerce", note: 4.6, disponible: true, missions: 142, photo: "", verifie: true },
  { id: "l3", nom: "Serge Koffi", telephone: "+225 07 00 00 22", moto: "TVS Apache", zone: "Résidentiel - Garçons", note: 4.5, disponible: false, missions: 95, photo: "", verifie: true },
  { id: "l4", nom: "Fatou Doumbia", telephone: "+225 07 00 00 23", moto: "Scooter Honda", zone: "Gagnoa Centre - Lakota", note: 4.9, disponible: true, missions: 213, photo: "", verifie: true },
  { id: "l5", nom: "Ibrahim Koné", telephone: "+225 07 00 00 24", moto: "Bajaj Boxer", zone: "Tout Gagnoa", note: 4.3, disponible: true, missions: 67, photo: "", verifie: false },
  { id: "l6", nom: "Aminata Bakayoko", telephone: "+225 07 00 00 25", moto: "TVS Ntorq", zone: "Commerce - Résidentiel", note: 4.7, disponible: true, missions: 156, photo: "", verifie: true },
];

// ── MISSIONS ──
export const missions: Mission[] = [
  {
    id: "ms1", type: "restauration",
    description: "Attiéké Poisson (x1) + Garba (x1) chez Maquis Le Bokadios",
    client: "Alice Kouamé", clientTel: "0700000030",
    adressePickup: "Maquis Le Bokadios, Sokoura",
    adresseLivraison: "Quartier Résidentiel, Rue des Fleurs",
    statut: "en_cours", livreurId: "l1", livreurNom: "Moussa Traoré",
    date: "2026-01-15T14:30:00", prix: 3000,
    etapes: [
      { nom: "Commande confirmée", complete: true, horodatage: "14:30" },
      { nom: "En préparation", complete: true, horodatage: "14:35" },
      { nom: "Récupération par le livreur", complete: true, horodatage: "14:48" },
      { nom: "En cours de livraison", complete: false },
      { nom: "Livré", complete: false },
    ],
  },
  {
    id: "ms2", type: "commerce",
    description: "Robe Wax Élégante chez Mode Gagnoa",
    client: "Béatrice Yao", clientTel: "0700000031",
    adressePickup: "Mode Gagnoa, Marché central",
    adresseLivraison: "Quartier Garçons, Boulevard Principal",
    statut: "recuperation", livreurId: "l4", livreurNom: "Fatou Doumbia",
    date: "2026-01-15T15:00:00", prix: 8500,
    etapes: [
      { nom: "Commande confirmée", complete: true, horodatage: "15:00" },
      { nom: "Emballage", complete: true, horodatage: "15:10" },
      { nom: "Récupération par le livreur", complete: false },
      { nom: "En cours de livraison", complete: false },
      { nom: "Livré", complete: false },
    ],
  },
  {
    id: "ms3", type: "course",
    description: "Récupérer colis à la gare UTB et livrer à domicile",
    client: "David Tanoh", clientTel: "0700000032",
    adressePickup: "Gare UTB, Quartier Commerce",
    adresseLivraison: "Quartier Sokoura, Impasse des Manguiers",
    statut: "en_attente",
    date: "2026-01-15T16:00:00", prix: 2000,
    etapes: [
      { nom: "Mission acceptée", complete: false },
      { nom: "Récupération du colis", complete: false },
      { nom: "En cours de livraison", complete: false },
      { nom: "Livré", complete: false },
    ],
  },
  {
    id: "ms4", type: "restauration",
    description: "Poulet Braisé Complet + Brochettes Bœuf chez Le Baobab",
    client: "Jean-Marc Ehouman", clientTel: "0700000033",
    adressePickup: "Restaurant Le Baobab, Commerce",
    adresseLivraison: "Quartier Résidentiel, Avenue des Cadres",
    statut: "livree", livreurId: "l6", livreurNom: "Aminata Bakayoko",
    date: "2026-01-15T12:00:00", prix: 6000,
    etapes: [
      { nom: "Commande confirmée", complete: true, horodatage: "12:00" },
      { nom: "En préparation", complete: true, horodatage: "12:12" },
      { nom: "Récupération", complete: true, horodatage: "12:25" },
      { nom: "En cours de livraison", complete: true, horodatage: "12:35" },
      { nom: "Livré", complete: true, horodatage: "12:48" },
    ],
  },
];

export const suggestionsCourses = [
  { icon: "📦", titre: "Récupérer un colis à la gare", desc: "Un livreur récupère votre colis à la gare UTB et vous le livre.", prix: 2000 },
  { icon: "🛒", titre: "Achat au marché", desc: "Décrivez ce que vous voulez, un livreur l'achète pour vous au marché central.", prix: 1500 },
  { icon: "📄", titre: "Livraison de documents", desc: "Faites livrer des documents importants en toute sécurité.", prix: 1000 },
  { icon: "💊", titre: "Course en pharmacie", desc: "Un livreur va chercher vos médicaments et vous les apporte.", prix: 1500 },
  { icon: "🔑", titre: "Remise de clés", desc: "Faites remettre des clés ou petits objets à un proche.", prix: 1000 },
  { icon: "🍞", titre: "Achat en boulangerie", desc: "Faites-vous livrer du pain frais et viennoiseries.", prix: 1000 },
];

export const categoriesBoutique = ["Tous", "Vêtements", "Cosmétiques", "Accessoires", "Chaussures"];
