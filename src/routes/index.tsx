import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ActivateAccount from "../pages/Auth/ActivateAccount";
import LandingPage from "../pages/LandingPage";
import InstitutionalHome from "../pages/Institutional";
import InstitutionalMobile from "../pages/Institutional/Mobile";
import InstitutionalPlatform from "../pages/Institutional/Platform";
import LegalPage from "../pages/Institutional/LegalPage";
import SecurityPage from "../pages/Institutional/SecurityPage";
import SupportPage from "../pages/Institutional/SupportPage";
import DataDeletionPage from "../pages/Institutional/DataDeletionPage";
import Verification from "../pages/Verification";
import Dashboard from "../pages/Dashboard";
import Consultations from "../pages/Consultations";
import Atestados from "../pages/Atestados";
import AtestadoDetail from "../pages/Atestados/AtestadoDetail";
import Patients from "../pages/Patients";
import PatientDetail from "../pages/Patients/PatientDetail";
import Doctors from "../pages/Doctors";
import DoctorProfile from "../pages/Doctors/DoctorProfile";
import Schedule from "../pages/Schedule";
import ClinicalManagement from "../pages/ClinicalManagement";
import Account from "../pages/Account/index";
import PlansCompare from "../pages/Plans/Compare";
import FinancialDashboard from "../pages/Financial/Dashboard";
import Revenue from "../pages/Financial/Revenue";
import Expenses from "../pages/Financial/Expenses";
import CashFlow from "../pages/Financial/CashFlow";
import Insurance from "../pages/Financial/Insurance";
import Transfers from "../pages/Financial/Transfers";
import Costs from "../pages/Financial/Costs";
import DRE from "../pages/Financial/DRE";
import Reports from "../pages/Financial/Reports";
import { ProtectedRoute } from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/activate-account" element={<ActivateAccount />} />
      <Route path="/institutional" element={<InstitutionalHome />} />
      <Route path="/institutional/mobile" element={<InstitutionalMobile />} />
      <Route
        path="/institutional/platform"
        element={<InstitutionalPlatform />}
      />
      {/* Single combined Terms of Use + Privacy Policy page. /termos and
          /privacidade are kept as aliases so existing links keep working. */}
      <Route path="/legal" element={<LegalPage />} />
      <Route path="/termos" element={<LegalPage />} />
      <Route path="/privacidade" element={<LegalPage />} />
      <Route path="/seguranca" element={<SecurityPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/suporte" element={<SupportPage />} />
      <Route path="/support" element={<SupportPage />} />
      {/* Public deletion request — these are the URLs submitted in Google
          Play's Data Safety section. `?tipo=dados` preselects the data-only
          option, so both required URLs point at one page. Aliases in PT and
          EN so an existing link never 404s. */}
      <Route path="/exclusao-de-dados" element={<DataDeletionPage />} />
      <Route path="/exclusao-de-conta" element={<DataDeletionPage />} />
      <Route path="/delete-account" element={<DataDeletionPage />} />
      <Route path="/data-deletion" element={<DataDeletionPage />} />

      {/* Protected routes */}
      <Route
        path="/verification"
        element={
          <ProtectedRoute>
            <Verification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultations"
        element={
          <ProtectedRoute>
            <Consultations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atestados"
        element={
          <ProtectedRoute>
            <Atestados />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atestados/:id"
        element={
          <ProtectedRoute>
            <AtestadoDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute>
            <PatientDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctors"
        element={
          <ProtectedRoute>
            <Doctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctors/:id/profile"
        element={
          <ProtectedRoute>
            <DoctorProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinical-management"
        element={
          <ProtectedRoute>
            <ClinicalManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      {/* The old plan-picker screen was removed — plan selection happens in
          Minha Conta (Assinatura tab) and `/plans` now redirects to the
          comparison table so any bookmarked link keeps working. */}
      <Route path="/plans" element={<Navigate to="/plans/compare" replace />} />
      <Route
        path="/plans/compare"
        element={
          <ProtectedRoute>
            <PlansCompare />
          </ProtectedRoute>
        }
      />

      {/* Financial routes */}
      <Route
        path="/financial"
        element={
          <ProtectedRoute>
            <FinancialDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/revenue"
        element={
          <ProtectedRoute>
            <Revenue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/expenses"
        element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/cashflow"
        element={
          <ProtectedRoute>
            <CashFlow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/insurance"
        element={
          <ProtectedRoute>
            <Insurance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/transfers"
        element={
          <ProtectedRoute>
            <Transfers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/costs"
        element={
          <ProtectedRoute>
            <Costs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/dre"
        element={
          <ProtectedRoute>
            <DRE />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
