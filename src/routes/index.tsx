import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Verification from "../pages/Verification";
import Dashboard from "../pages/Dashboard";
import Consultations from "../pages/Consultations";
import Patients from "../pages/Patients";
import PatientDetail from "../pages/Patients/PatientDetail";
import Doctors from "../pages/Doctors";
import DoctorClinicView from "../pages/Doctors/DoctorClinicView";
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
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

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
        path="/doctors/:id"
        element={
          <ProtectedRoute>
            <DoctorClinicView />
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
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
