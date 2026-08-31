import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ActivateAccount from "../pages/Auth/ActivateAccount";
import LandingPage from "../pages/LandingPage";
import InstitutionalHome from "../pages/Institutional";
import InstitutionalMobile from "../pages/Institutional/Mobile";
import InstitutionalPlatform from "../pages/Institutional/Platform";
import Verification from "../pages/Verification";
import Dashboard from "../pages/Dashboard";
import Consultations from "../pages/Consultations";
import Patients from "../pages/Patients";
import PatientDetail from "../pages/Patients/PatientDetail";
import Doctors from "../pages/Doctors";
import DoctorProfile from "../pages/Doctors/DoctorProfile";
import Schedule from "../pages/Schedule";
import ClinicalManagement from "../pages/ClinicalManagement";
import Account from "../pages/Account/index";
import Plans from "../pages/Plans/index";
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
      <Route
        path="/plans"
        element={
          <ProtectedRoute>
            <Plans />
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
