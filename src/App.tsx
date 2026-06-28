import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";

// Public
import Home from "@/pages/Home";
import Restaurants from "@/pages/Restaurants";
import Commerce from "@/pages/Commerce";
import Courses from "@/pages/Courses";
import Livreurs from "@/pages/Livreurs";
import Inscription from "@/pages/Inscription";
import Suivi from "@/pages/Suivi";
import Checkout from "@/pages/Checkout";

// Auth
import Login from "@/pages/auth/Login";

// Chat
import Chat from "@/pages/chat/Chat";

// Admin
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOverview from "@/pages/admin/AdminOverview";
import ValidationLivreurs from "@/pages/admin/ValidationLivreurs";
import GestionUtilisateurs from "@/pages/admin/GestionUtilisateurs";
import ToutesMissions from "@/pages/admin/ToutesMissions";
import GestionPharmacies from "@/pages/admin/GestionPharmacies";
import GestionPromos from "@/pages/admin/GestionPromos";
import GestionActus from "@/pages/admin/GestionActus";

// Livreur
import LivreurDashboard from "@/pages/livreur/LivreurDashboard";
import LivreurOverview from "@/pages/livreur/LivreurOverview";
import MissionsDisponibles from "@/pages/livreur/MissionsDisponibles";
import MesMissions from "@/pages/livreur/MesMissions";
import ProfilLivreur from "@/pages/livreur/ProfilLivreur";

// Commercant
import CommercantDashboard from "@/pages/commercant/CommercantDashboard";
import CommercantOverview from "@/pages/commercant/CommercantOverview";
import MaBoutique from "@/pages/commercant/MaBoutique";
import CommandesCommercant from "@/pages/commercant/CommandesCommercant";
import ProfilCommercant from "@/pages/commercant/ProfilCommercant";

// Client
import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientOverview from "@/pages/client/ClientOverview";
import MesCommandes from "@/pages/client/MesCommandes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: "12px",
                  background: "#1e293b",
                  color: "#f8fafc",
                  fontSize: "14px",
                  padding: "12px 16px"
                },
                success: {
                  iconTheme: { primary: "#22c55e", secondary: "#f8fafc" }
                },
              }}
            />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Marketplace */}
                  <Route path="/" element={<Home />} />
                  <Route path="/restauration" element={<Restaurants />} />
                  <Route path="/commerces" element={<Commerce />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/livreurs" element={<Livreurs />} />
                  <Route path="/inscription" element={<Inscription />} />
                  <Route path="/suivi" element={<Suivi />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />

                  {/* Chat */}
                  <Route path="/chat/:commandeId" element={<Chat />} />

                  {/* Admin */}
                  <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>}>
                    <Route index element={<AdminOverview />} />
                    <Route path="validation" element={<ValidationLivreurs />} />
                    <Route path="utilisateurs" element={<GestionUtilisateurs />} />
                    <Route path="missions" element={<ToutesMissions />} />
                    <Route path="pharmacies" element={<GestionPharmacies />} />
                    <Route path="promos" element={<GestionPromos />} />
                    <Route path="actus" element={<GestionActus />} />
                  </Route>

                  {/* Livreur */}
                  <Route path="/livreur" element={<ProtectedRoute roles={["livreur"]}><LivreurDashboard /></ProtectedRoute>}>
                    <Route index element={<LivreurOverview />} />
                    <Route path="missions" element={<MissionsDisponibles />} />
                    <Route path="mes-missions" element={<MesMissions />} />
                    <Route path="profil" element={<ProfilLivreur />} />
                  </Route>

                  {/* Commercant */}
                  <Route path="/commercant" element={<ProtectedRoute roles={["commercant"]}><CommercantDashboard /></ProtectedRoute>}>
                    <Route index element={<CommercantOverview />} />
                    <Route path="boutique" element={<MaBoutique />} />
                    <Route path="commandes" element={<CommandesCommercant />} />
                    <Route path="profil" element={<ProfilCommercant />} />
                  </Route>

                  {/* Client */}
                  <Route path="/client" element={<ProtectedRoute roles={["client"]}><ClientDashboard /></ProtectedRoute>}>
                    <Route index element={<ClientOverview />} />
                    <Route path="commandes" element={<MesCommandes />} />
                    <Route path="suivi" element={<Suivi />} />
                  </Route>
                </Routes>
              </main>
              <Footer />
              <MobileNav />
            </div>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}