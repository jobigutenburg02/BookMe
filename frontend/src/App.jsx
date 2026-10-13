import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminDashboardPage from "./admin/AdminDashboard";
import AdminLoginPage from "./admin/AdminLoginPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from './pages/DashboardPage'
import ProfilePage from "./pages/ProfilePage";
import BookingPage from "./pages/BookingsPage";
import BookingCancelledPage from "./pages/BookingCancelledPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import ServicesPage from "./pages/ServicesPage";
import PaymentsPage from "./pages/PaymentsPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const hasToken = Boolean(localStorage.getItem('token'))

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

const AdminProtectedRoute = ({ children }) => {
  const hasAdminToken = Boolean(localStorage.getItem('adminToken'))

  if (!hasAdminToken) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

const PublicOnlyRoute = ({ children }) => {
  const hasToken = Boolean(localStorage.getItem('token'))
  if (hasToken) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
      <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
      <Route path="/book/:slug" element={<PublicBookingPage />} />
      <Route path="/public/:slug" element={<PublicBookingPage />} />
      <Route path="/availability" element={<ProtectedRoute><AvailabilityPage /></ProtectedRoute>} />
      <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
      <Route path="/booking/success" element={<BookingSuccessPage />} />
      <Route path="/booking/cancelled" element={<BookingCancelledPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}