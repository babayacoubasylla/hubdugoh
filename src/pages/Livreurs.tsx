import { useState } from "react";
import { livreurs } from "@/data/mockData";
import type { Livreur } from "@/data/mockData";
import { Link } from "react-router-dom";
import { HiArrowLeft, HiStar, HiCheckBadge } from "react-icons/hi2";
import { motion } from "framer-motion";

export default function Livreurs() {
  const [selected, setSelected] = useState<Livreur | null>(null);

  if (selected) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-2xl px-4">
          <button onClick={() => setSelected(null)} className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 mb-4 text-sm touch-target">
            <HiArrowLeft /> Retour aux livreurs
          </button>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-6 sm:p-8 text-white text-center">
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center text-5xl mb-3">🛵</div>
              <h1 className="text-2xl font-bold">{selected.nom}</h1>
              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                <span className="flex items-center gap-0.5 text-sm"><HiStar className="text-yellow-300" /> {selected.note}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selected.disponible ? "bg-green-400/30" : "bg-white/20"}`}>
                  {selected.disponible ? "🟢 Disponible" : "⚫ Indisponible"}
                </span>
                {selected.verifie && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-400/30 flex items-center gap-0.5"><HiCheckBadge /> Vérifié</span>}
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[{ l: "📞", v: selected.telephone }, { l: "🏍️ Moto", v: selected.moto }, { l: "📍 Zone", v: selected.zone }, { l: "📦 Missions", v: `${selected.missions} réalisées` }].map((i) => (
                <div key={i.l} className="p-3 bg-slate-50 rounded-xl"><span className="text-xs text-slate-500">{i.l}</span><p className="font-semibold text-sm mt-0.5">{i.v}</p></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-2xl sm:text-3xl font-bold">🛵 Livreurs</h1>
          <p className="text-white/80 text-sm mt-1">Notre réseau de livreurs à Gagnoa</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Livreurs", value: livreurs.length, icon: "🛵" },
            { label: "Disponibles", value: livreurs.filter((l) => l.disponible).length, icon: "🟢" },
            { label: "Vérifiés", value: livreurs.filter((l) => l.verifie).length, icon: "✅" },
            { label: "Note moy.", value: (livreurs.reduce((s, l) => s + l.note, 0) / livreurs.length).toFixed(1) + " ⭐", icon: "⭐" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-lg font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {livreurs.map((l) => (
            <motion.button key={l.id} onClick={() => setSelected(l)} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-left p-4 sm:p-5 active:scale-[0.98]">
              <div className="flex items-start gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 ${l.disponible ? "bg-green-100" : "bg-slate-100"}`}>🛵</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5"><h3 className="font-bold text-slate-800 text-sm truncate">{l.nom}</h3>{l.verifie && <HiCheckBadge className="text-blue-500 shrink-0" />}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs"><span className="flex items-center gap-0.5 text-yellow-600"><HiStar className="text-sm" /> {l.note}</span><span className="text-slate-400">{l.missions} missions</span></div>
                  <div className="flex items-center gap-1.5 mt-1.5"><span className={`w-2 h-2 rounded-full ${l.disponible ? "bg-green-500" : "bg-slate-400"}`} /><span className="text-xs text-slate-500">{l.disponible ? "Disponible" : "Indisponible"}</span></div>
                  <p className="text-xs text-slate-400 mt-1 truncate">📍 {l.zone}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/inscription?role=livreur" className="inline-flex px-8 py-3.5 bg-green-500 text-white rounded-full font-bold text-sm hover:bg-green-600 transition-colors shadow-lg active:scale-[0.98]">
            🛵 Devenir livreur
          </Link>
        </div>
      </div>
    </div>
  );
}
