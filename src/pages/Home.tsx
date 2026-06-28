import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { apiProduits } from '@/api/produits'
import { apiPharmacies, apiPromos, apiActus } from '@/api/contenu-vitrine'
import { supabase } from '@/lib/supabase'
import { HiStar, HiShoppingCart, HiMagnifyingGlass, HiPhone, HiMapPin, HiClock } from 'react-icons/hi2'
import type { PharmacieGarde, Promo, ActuVille } from '@/types'

const FRAIS_LIVRAISON = 500;

interface Commercant {
  id: string
  nom_commerce: string
  description: string
  banniere_url: string | null
  photo_profil_url: string | null
  note_moyenne: number
  quartier: string
  frais_livraison: number
  delai_livraison: string
  type_commerce: 'restaurant' | 'boutique'
  produits: any[]
}

interface Course {
  id: string
  titre: string
  description: string
  prix: number
  icon: string
  actif: boolean
}

export default function Home() {
  const { user } = useAuth()
  const { state } = useCart()
  const [restaurants, setRestaurants] = useState<Commercant[]>([])
  const [boutiques, setBoutiques] = useState<Commercant[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [pharmacies, setPharmacies] = useState<PharmacieGarde[]>([])
  const [promos, setPromos] = useState<Promo[]>([])
  const [actus, setActus] = useState<ActuVille[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [restos, bout] = await Promise.all([
        apiProduits.getRestaurants(),
        apiProduits.getBoutiques()
      ])
      setRestaurants(restos || [])
      setBoutiques(bout || [])

      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*')
        .eq('actif', true)
        .order('prix', { ascending: true })

      if (error) throw error

      if (coursesData && coursesData.length > 0) {
        setCourses(coursesData)
      } else {
        setCourses([
          { id: 'c1', titre: 'Récupérer un colis à la gare', description: 'Un livreur récupère votre colis à la gare UTB et vous le livre.', prix: 2000, icon: '📦', actif: true },
          { id: 'c2', titre: 'Achat au marché', description: 'Décrivez ce que vous voulez, un livreur l\'achète pour vous au marché central.', prix: 1500, icon: '🛒', actif: true },
          { id: 'c3', titre: 'Livraison de documents', description: 'Faites livrer des documents importants en toute sécurité.', prix: 1000, icon: '📄', actif: true },
          { id: 'c4', titre: 'Course en pharmacie', description: 'Un livreur va chercher vos médicaments et vous les apporte.', prix: 1500, icon: '💊', actif: true },
          { id: 'c5', titre: 'Remise de clés', description: 'Faites remettre des clés ou petits objets à un proche.', prix: 1000, icon: '🔑', actif: true },
          { id: 'c6', titre: 'Achat en boulangerie', description: 'Faites-vous livrer du pain frais et viennoiseries.', prix: 1000, icon: '🍞', actif: true }
        ])
      }

      try {
        const pharmasData = await apiPharmacies.getAll()
        setPharmacies(pharmasData || [])
      } catch (e) {
        console.error('Erreur chargement pharmacies de garde:', e)
      }

      try {
        const promosData = await apiPromos.getActive()
        setPromos(promosData || [])
      } catch (e) {
        console.error('Erreur chargement promos:', e)
      }

      try {
        const actusData = await apiActus.getActive()
        setActus(actusData || [])
      } catch (e) {
        console.error('Erreur chargement actus:', e)
      }
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRestos = search
    ? restaurants.filter(r =>
      r.nom_commerce.toLowerCase().includes(search.toLowerCase()) ||
      r.quartier.toLowerCase().includes(search.toLowerCase())
    )
    : restaurants

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-xs sm:text-sm mb-4">
              🚀 Service disponible à Gagnoa
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3">
              Ce que vous voulez. <br />
              <span className="text-orange-200">Livré chez vous.</span>
            </h1>
            <p className="text-sm sm:text-base text-orange-50 mb-6">
              Repas, courses, colis — commandez en quelques clics et recevez votre livraison rapidement.
            </p>
            <div className="relative max-w-md mx-auto">
              <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un restaurant, une boutique..."
                className="w-full pl-11 pr-4 py-4 rounded-2xl text-slate-800 text-sm outline-none shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATÉGORIES RAPIDES */}
      <section className="relative -mt-6 z-10 mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { to: '/restauration', icon: '🍴', label: 'Restaurants', color: 'bg-amber-100 text-amber-700' },
            { to: '/commerces', icon: '🛍️', label: 'Boutiques', color: 'bg-purple-100 text-purple-700' },
            { to: '/courses', icon: '🚚', label: 'Courses', color: 'bg-blue-100 text-blue-700' },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 text-center hover:shadow-xl transition-all active:scale-[0.97]"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto ${c.color} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-2`}>
                {c.icon}
              </div>
              <span className="font-bold text-slate-800 text-xs sm:text-sm">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* PHARMACIES DE GARDE */}
      {pharmacies.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">💊 Pharmacies de garde</h2>
          </div>
          <div className="flex flex-col gap-3">
            {pharmacies.map((pharmacie) => (
              <div key={pharmacie.id} className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-4 sm:p-5 text-white">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    💊
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base">Pharmacie de garde</span>
                      <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-medium">
                        {new Date(pharmacie.date_debut).toLocaleDateString('fr-FR')} → {new Date(pharmacie.date_fin).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="font-semibold text-sm sm:text-base mt-1">{pharmacie.nom}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-xs text-emerald-50">
                      <span className="flex items-center gap-1">
                        <HiMapPin className="text-sm" /> {pharmacie.adresse}
                      </span>
                      <a href={`tel:${pharmacie.telephone}`} className="flex items-center gap-1 font-medium hover:underline">
                        <HiPhone className="text-sm" /> {pharmacie.telephone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROMOS */}
      {promos.length > 0 && (
        <section className="py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">🎁 Promotions du moment</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
              {promos.map((promo) => {
                const content = (
                  <>
                    <div className="h-32 sm:h-36 bg-gradient-to-br from-pink-300 to-rose-400 flex items-center justify-center text-4xl">
                      {promo.image_url ? (
                        <img src={promo.image_url} alt={promo.titre} className="w-full h-full object-cover" />
                      ) : (
                        '🎁'
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base">{promo.titre}</h3>
                      {promo.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{promo.description}</p>
                      )}
                      {promo.commercant?.nom_commerce && (
                        <span className="inline-block mt-2 text-xs font-medium text-pink-600">
                          🏪 {promo.commercant.nom_commerce}
                        </span>
                      )}
                    </div>
                  </>
                );

                const cardClass = "snap-start shrink-0 w-[260px] sm:w-[300px] bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden active:scale-[0.98]";

                return promo.commercant_id ? (
                  <Link key={promo.id} to="/commerces" className={cardClass}>
                    {content}
                  </Link>
                ) : promo.lien_externe ? (
                  <a key={promo.id} href={promo.lien_externe} target="_blank" rel="noopener noreferrer" className={cardClass}>
                    {content}
                  </a>
                ) : (
                  <div key={promo.id} className={cardClass}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* RESTAURANTS */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">🍴 Restaurants populaires</h2>
            <Link to="/restauration" className="text-sm font-semibold text-orange-600 hover:underline">
              Tout voir →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
            {filteredRestos.map((r) => (
              <Link
                key={r.id}
                to={`/restauration`}
                className="snap-start shrink-0 w-[260px] sm:w-[300px] bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden active:scale-[0.98]"
              >
                <div className="h-36 sm:h-44 bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-4xl relative">
                  {r.banniere_url ? (
                    <img src={r.banniere_url} alt={r.nom_commerce} className="w-full h-full object-cover" />
                  ) : (
                    '🍽️'
                  )}
                  <span className="absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <HiStar className="text-yellow-500 text-xs" /> {r.note_moyenne || 4.0}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">{r.nom_commerce}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.description || 'Restaurant local'}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>{r.quartier}</span>
                    <span>🚀 {r.delai_livraison || '30-45 min'}</span>
                    <span className="text-green-600 font-medium">Livr. {FRAIS_LIVRAISON}F</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BOUTIQUES */}
      <section className="py-8 sm:py-12 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">🛍️ Boutiques locales</h2>
            <Link to="/commerces" className="text-sm font-semibold text-orange-600 hover:underline">
              Tout voir →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
            {boutiques.map((b) => (
              <Link
                key={b.id}
                to={`/commerces`}
                className="snap-start shrink-0 w-[260px] sm:w-[300px] bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden active:scale-[0.98]"
              >
                <div className="h-36 sm:h-44 bg-gradient-to-br from-purple-300 to-pink-400 flex items-center justify-center text-4xl">
                  {b.banniere_url ? (
                    <img src={b.banniere_url} alt={b.nom_commerce} className="w-full h-full object-cover" />
                  ) : (
                    '🛍️'
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">{b.nom_commerce}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{b.description || 'Boutique locale'}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <HiStar className="text-yellow-500 text-xs" /> {b.note_moyenne || 4.0}
                    </span>
                    <span>{b.produits?.length || 0} produits</span>
                    <span className="text-green-600 font-medium">Livr. {FRAIS_LIVRAISON}F</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES EXPRESS */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">🚚 Courses & Services</h2>
            <Link to="/courses" className="text-sm font-semibold text-orange-600 hover:underline">
              Voir toutes les courses →
            </Link>
          </div>
          <p className="text-sm text-slate-500 mb-4">Choisissez une course et personnalisez-la</p>
          <p className="text-xs text-slate-400 mb-4">🛵 Base {FRAIS_LIVRAISON} FCFA + suppléments</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((c) => {
              const prixTotal = c.prix + FRAIS_LIVRAISON;
              return (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all border border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{c.icon || '📦'}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm">{c.titre}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="font-bold text-blue-600 text-base">
                            {prixTotal.toLocaleString()} FCFA
                          </span>
                          <span className="text-[10px] text-slate-400 ml-2">
                            dont {FRAIS_LIVRAISON} FCFA base
                          </span>
                        </div>
                        <Link
                          to="/courses"
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                        >
                          + Ajouter
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ACTUS DE LA VILLE */}
      {actus.length > 0 && (
        <section className="py-8 sm:py-12 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">📰 Actualités de Gagnoa</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {actus.map((actu) => (
                <div key={actu.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                  {actu.image_url && (
                    <div className="h-32 sm:h-36">
                      <img src={actu.image_url} alt={actu.titre} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <HiClock className="text-sm" />
                      {new Date(actu.date_publication).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">{actu.titre}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-3">{actu.contenu}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* APPEL À L'ACTION */}
      <section className="py-10 sm:py-14 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">🛵 Livreur indépendant ?</h2>
              <p className="text-slate-300 text-sm mb-5">
                Rejoignez notre réseau. Travaillez à votre rythme, gagnez de l'argent en livrant dans votre zone.
              </p>
              <Link
                to="/inscription?role=livreur"
                className="inline-flex px-6 py-3 bg-green-500 text-white rounded-full font-bold text-sm hover:bg-green-600 transition-colors"
              >
                Devenir livreur
              </Link>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">🪄 Commerçant ou restaurant ?</h2>
              <p className="text-slate-300 text-sm mb-5">
                Créez votre boutique, publiez vos produits ou votre menu. Recevez des commandes et développez votre activité.
              </p>
              <Link
                to="/inscription?role=commercant"
                className="inline-flex px-6 py-3 bg-purple-500 text-white rounded-full font-bold text-sm hover:bg-purple-600 transition-colors"
              >
                Ajouter mon commerce
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PANIER FLOTTANT */}
      {state.count > 0 && (
        <div className="fixed bottom-20 md:bottom-6 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
          <Link
            to="/checkout"
            className="pointer-events-auto bg-orange-500 text-white px-6 py-3.5 rounded-full font-bold shadow-xl hover:bg-orange-600 transition-all flex items-center gap-3"
          >
            <HiShoppingCart className="text-lg" />
            <span>Voir le panier ({state.count})</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {state.total} FCFA
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}