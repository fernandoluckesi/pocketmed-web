import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Dashboard from "../pages/Dashboard";
import Patients from "../pages/Patients";
import PatientDetail from "../pages/Patients/PatientDetail";
import Doctors from "../pages/Doctors";
import DoctorClinicView from "../pages/Doctors/DoctorClinicView";
import DoctorProfile from "../pages/Doctors/DoctorProfile";
import Schedule from "../pages/Schedule";
import ClinicalManagement from "../pages/ClinicalManagement";
import Account from "../pages/Account";
import Plans from "../pages/Plans";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/patients/:id" element={<PatientDetail />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/doctors/:id" element={<DoctorClinicView />} />
      <Route path="/doctors/:id/profile" element={<DoctorProfile />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/clinical-management" element={<ClinicalManagement />} />
      <Route path="/account" element={<Account />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
