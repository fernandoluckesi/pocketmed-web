import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Patients from "../pages/Patients";
import Doctors from "../pages/Doctors";
import Schedule from "../pages/Schedule";
import ClinicalManagement from "../pages/ClinicalManagement";
import Account from "../pages/Account";
import Plans from "../pages/Plans";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/clinical-management" element={<ClinicalManagement />} />
      <Route path="/account" element={<Account />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
