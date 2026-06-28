import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { HiMagnifyingGlass, HiCheckCircle, HiXCircle } from "react-icons/hi2";
import toast from "react-hot-toast";

interface User {
  id: string;
  nom: string;
  telephone: string;
  email: string | null;
  role: 'admin' | 'livreur' | 'commercant' | 'client';
  verifie: boolean;
  actif: boolean;
  date_inscription: string;
}

export default function GestionUtilisateurs() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtreRole, setFiltreRole] = useState<string>("tous");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profils')
        .select('*')
        .order('date_inscription', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profils')
        .update({ verifie: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, verifie: !currentStatus } : u
      ));

      toast.success(`Utilisateur ${!currentStatus ? 'vérifié' : 'non vérifié'} avec succès`);
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.telephone.includes(search);
    const matchRole = filtreRole === "tous" || u.role === filtreRole;
    return matchSearch && matchRole;
  });

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'admin': '👑 Admin',
      'livreur': '🛵 Livreur',
      'commercant': '🪄 Commerçant',
      'client': '👤 Client'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'admin': 'bg-red-100 text-red-700',
      'livreur': 'bg-blue-100 text-blue-700',
      'commercant': 'bg-purple-100 text-purple-700',
      'client': 'bg-green-100 text-green-700'
    };
    return colors[role] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">👥 Gestion des utilisateurs</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-red-400"
          />
        </div>
        <select
          value={filtreRole}
          onChange={(e) => setFiltreRole(e.target.value)}
          className="px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-red-400"
        >
          <option value="tous">Tous les rôles</option>
          <option value="admin">👑 Admin</option>
          <option value="livreur">🛵 Livreur</option>
          <option value="commercant">🪄 Commerçant</option>
          <option value="client">👤 Client</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-2 p-3 bg-slate-50 text-xs font-medium text-slate-500">
          <div className="col-span-3">Nom</div>
          <div className="col-span-2">Téléphone</div>
          <div className="col-span-2">Rôle</div>
          <div className="col-span-2">Vérifié</div>
          <div className="col-span-3">Action</div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          filtered.map((u) => (
            <div key={u.id} className="sm:grid grid-cols-12 gap-2 p-3 sm:p-4 border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50 transition-colors">
              <div className="col-span-3 font-medium text-slate-800">{u.nom}</div>
              <div className="col-span-2 text-slate-500 text-xs sm:text-sm">{u.telephone}</div>
              <div className="col-span-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                  {getRoleLabel(u.role)}
                </span>
              </div>
              <div className="col-span-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${u.verifie ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {u.verifie ? "✅ Vérifié" : "⏳ En attente"}
                </span>
              </div>
              <div className="col-span-3 flex items-center gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => toggleVerification(u.id, u.verifie)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${u.verifie
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                >
                  {u.verifie ? <HiXCircle /> : <HiCheckCircle />}
                  {u.verifie ? 'Retirer' : 'Vérifier'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}