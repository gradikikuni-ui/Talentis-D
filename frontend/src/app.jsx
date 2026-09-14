import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobsList from "./pages/JobsList";
import JobDetail from "./pages/JobDetail";
import EmployerContact from "./pages/EmployerContact";
import About from "./pages/About";
import WorkerDashboard from "./pages/WorkerDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/offres" element={<JobsList />} />
          <Route path="/offres/:jobId" element={<JobDetail />} />
          <Route path="/entreprises/contact" element={<EmployerContact />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/travailleur" element={<ProtectedRoute requireRole="worker"><WorkerDashboard /></ProtectedRoute>} />
          <Route path="/entreprise" element={<ProtectedRoute requireRole="employer"><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}