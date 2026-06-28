import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pb-20 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <span className="text-2xl">🛵</span>
              <span>Inov'ci</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Livraison rapide & fiable en côte d'ivoire. Repas, colis et courses en toute sécurité.
            </p>
            <p className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 bg-green-700 text-green-100 rounded-full text-xs font-medium">
              🟢 Service disponible
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Modules</h4>
            <div className="space-y-2 text-sm">
              <Link to="/restauration" className="block hover:text-orange-400 transition-colors">🍴 Restauration</Link>
              <Link to="/commerces" className="block hover:text-orange-400 transition-colors">🛍️ Commerces</Link>
              <Link to="/courses" className="block hover:text-orange-400 transition-colors">🚚 Courses</Link>
              <Link to="/livreurs" className="block hover:text-orange-400 transition-colors">🛵 Livreurs</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Espace</h4>
            <div className="space-y-2 text-sm">
              <Link to="/inscription" className="block hover:text-orange-400 transition-colors">S'inscrire</Link>
              <Link to="/suivi" className="block hover:text-orange-400 transition-colors">Suivi de mission</Link>
              <a href="#" className="block hover:text-orange-400 transition-colors">Aide & FAQ</a>
              <a href="#" className="block hover:text-orange-400 transition-colors">Conditions</a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <p>📍 Côte d'Ivoire</p>
              <p>📞 +225 01 01 32 27 83</p>
              <p>📧 contact@bysgroupconsulting.ci</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs text-slate-500">
          © 2026 BYS Group Consulting Digital — Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}