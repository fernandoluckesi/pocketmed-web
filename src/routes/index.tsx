import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

/*
 * Public pages are imported eagerly; the authenticated app is lazy.
 *
 * Why the split matters for SEO: every public page used to download the
 * whole 2 MB bundle — including jsPDF, html2canvas, QRCode and TipTap,
 * which only the authenticated screens use. That is Largest Contentful
 * Paint spent parsing JavaScript a visitor to the landing page can never
 * reach, and Core Web Vitals is a direct ranking factor.
 *
 * The public pages stay eager on purpose: they are the LCP-critical ones,
 * and a lazy chunk would add a round trip before the first paint.
 */
import LandingPage from "../pages/LandingPage";
import InstitutionalHome from "../pages/Institutional";
import InstitutionalMobile from "../pages/Institutional/Mobile";
import InstitutionalPlatform from "../pages/Institutional/Platform";
import LegalPage from "../pages/Institutional/LegalPage";
import SecurityPage from "../pages/Institutional/SecurityPage";
import SupportPage from "../pages/Institutional/SupportPage";
import DataDeletionPage from "../pages/Institutional/DataDeletionPage";

// Auth screens: not public-facing content, but reached before login, so a
// small lazy chunk is the right trade.
const Login = lazy(() => import("../pages/Auth/Login"));
const Signup = lazy(() => import("../pages/Auth/Signup"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ActivateAccount = lazy(() => import("../pages/Auth/ActivateAccount"));
const AccessConsent = lazy(() => import("../pages/AccessConsent"));

// Authenticated application.
const Verification = lazy(() => import("../pages/Verification"));
const SignatureSimulator = lazy(() => import("../pages/SignatureSimulator"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Consultations = lazy(() => import("../pages/Consultations"));
const Atestados = lazy(() => import("../pages/Atestados"));
const AtestadoDetail = lazy(() => import("../pages/Atestados/AtestadoDetail"));
const Patients = lazy(() => import("../pages/Patients"));
const PatientDetail = lazy(() => import("../pages/Patients/PatientDetail"));
const Doctors = lazy(() => import("../pages/Doctors"));
const DoctorProfile = lazy(() => import("../pages/Doctors/DoctorProfile"));
const Schedule = lazy(() => import("../pages/Schedule"));
const ClinicalManagement = lazy(() => import("../pages/ClinicalManagement"));
const Account = lazy(() => import("../pages/Account/index"));
const PlansCompare = lazy(() => import("../pages/Plans/Compare"));
const FinancialDashboard = lazy(() => import("../pages/Financial/Dashboard"));
const Revenue = lazy(() => import("../pages/Financial/Revenue"));
const Expenses = lazy(() => import("../pages/Financial/Expenses"));
const CashFlow = lazy(() => import("../pages/Financial/CashFlow"));
const Insurance = lazy(() => import("../pages/Financial/Insurance"));
const Transfers = lazy(() => import("../pages/Financial/Transfers"));
const Costs = lazy(() => import("../pages/Financial/Costs"));
const DRE = lazy(() => import("../pages/Financial/DRE"));
const Reports = lazy(() => import("../pages/Financial/Reports"));

export default function AppRoutes() {
  return (
    // Suspense boundary for the lazy chunks above. The fallback is
    // deliberately blank rather than a spinner: the public pages are eager,
    // so this only ever shows for a fraction of a second on an
    // authenticated route, and a flashing spinner there reads as a glitch.
    <Suspense fallback={null}>
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
      {/* Public consent page opened from the single-use link emailed for a
          cross-clinic record-sharing authorization request (patient Shadow
          flow) — path matches the one built in
          CrossClinicAccessService.requestCrossClinicAccess on the backend. */}
      <Route
        path="/acesso-prontuario/:requestId"
        element={<AccessConsent />}
      />

      {/* Protected routes */}
      <Route
        path="/verification"
        element={
          <ProtectedRoute>
            <Verification />
          </ProtectedRoute>
        }
      />
      {/* Stand-in for a real e-signature provider's hosted signing page —
          opened in a new tab by `SendDocumentModal`. Deliberately outside
          `MainLayout` (full-bleed, no sidebar) since it simulates a
          third-party platform. */}
      <Route
        path="/assinatura-simulada/:token"
        element={
          <ProtectedRoute>
            <SignatureSimulator />
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
    </Suspense>
  );
}
