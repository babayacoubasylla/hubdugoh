import { missions } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

export default function MesCommandes() {
  const { user } = useAuth();
  const myMissions = missions.filter((m) => m.clientTel === user?.telephone || m.client === user?.nom);

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">🛒 Mes commandes ({myMissions.length})</h2>
      {myMissions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-slate-400">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-medium">Aucune commande</p>
          <p className="text-sm mt-1">Passez votre première commande !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myMissions.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{m.id.toUpperCase()}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  m.statut === "livree" ? "bg-green-100 text-green-700" :
                  m.statut === "en_cours" ? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {m.statut === "en_attente" ? "⏳ En attente" : m.statut === "en_cours" ? "🛵 En cours" : "✅ Livrée"}
                </span>
              </div>
              <p className="text-sm text-slate-600">{m.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">🛵 {m.livreurNom || "—"}</span>
                <span className="font-bold text-sm text-orange-600">{m.prix.toLocaleString()} FCFA</span>
              </div>
              {/* Timeline mini */}
              <div className="flex items-center gap-1 mt-3">
                {m.etapes.map((e, i) => (
                  <div key={i} className="flex-1 flex items-center">
                    <div className={`w-2 h-2 rounded-full ${e.complete ? "bg-green-500" : "bg-slate-300"}`} />
                    {i < m.etapes.length - 1 && <div className={`flex-1 h-0.5 ${e.complete ? "bg-green-500" : "bg-slate-200"}`} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
