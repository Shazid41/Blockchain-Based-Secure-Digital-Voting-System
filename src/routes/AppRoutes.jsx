import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import RoleRoute from '../components/auth/RoleRoute.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import VoterLayout from '../layouts/VoterLayout.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ActivityLogsPage from '../pages/admin/ActivityLogsPage.jsx';
import BlockchainAuditPage from '../pages/admin/BlockchainAuditPage.jsx';
import FraudAlertsPage from '../pages/admin/FraudAlertsPage.jsx';
import ManageCandidatesPage from '../pages/admin/ManageCandidatesPage.jsx';
import ManageElectionsPage from '../pages/admin/ManageElectionsPage.jsx';
import ManageRegionsPage from '../pages/admin/ManageRegionsPage.jsx';
import ManageVotersPage from '../pages/admin/ManageVotersPage.jsx';
import ResultsPage from '../pages/admin/ResultsPage.jsx';
import SettingsPage from '../pages/admin/SettingsPage.jsx';
import AboutPage from '../pages/public/AboutPage.jsx';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage.jsx';
import HomePage from '../pages/public/HomePage.jsx';
import HowItWorksPage from '../pages/public/HowItWorksPage.jsx';
import LoginPage from '../pages/public/LoginPage.jsx';
import NotFoundPage from '../pages/public/NotFoundPage.jsx';
import RegisterPage from '../pages/public/RegisterPage.jsx';
import ResetPasswordPage from '../pages/public/ResetPasswordPage.jsx';
import SecurityPage from '../pages/public/SecurityPage.jsx';
import UnauthorizedPage from '../pages/public/UnauthorizedPage.jsx';
import VerifyEmailPage from '../pages/public/VerifyEmailPage.jsx';
import AvailableElectionsPage from '../pages/voter/AvailableElectionsPage.jsx';
import CastVotePage from '../pages/voter/CastVotePage.jsx';
import ElectionDetailsPage from '../pages/voter/ElectionDetailsPage.jsx';
import VoteVerificationPage from '../pages/voter/VoteVerificationPage.jsx';
import VoteSuccessPage from '../pages/voter/VoteSuccessPage.jsx';
import VoterDashboard from '../pages/voter/VoterDashboard.jsx';
import VoterProfilePage from '../pages/voter/VoterProfilePage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LoginPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="about"
          element={
            <ProtectedRoute>
              <AboutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="how-it-works"
          element={
            <ProtectedRoute>
              <HowItWorksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="security"
          element={
            <ProtectedRoute>
              <SecurityPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route
        path="voter"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['voter', 'admin']}>
              <VoterLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<VoterDashboard />} />
        <Route path="profile" element={<VoterProfilePage />} />
        <Route path="elections" element={<AvailableElectionsPage />} />
        <Route path="elections/:electionId" element={<ElectionDetailsPage />} />
        <Route path="elections/:electionId/vote" element={<CastVotePage />} />
        <Route path="verify" element={<VoteVerificationPage />} />
        <Route path="vote-success" element={<VoteSuccessPage />} />
      </Route>
      <Route
        path="admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="voters" element={<ManageVotersPage />} />
        <Route path="elections" element={<ManageElectionsPage />} />
        <Route path="candidates" element={<ManageCandidatesPage />} />
        <Route path="regions" element={<ManageRegionsPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="fraud-alerts" element={<FraudAlertsPage />} />
        <Route path="blockchain-audit" element={<BlockchainAuditPage />} />
        <Route path="activity-logs" element={<ActivityLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
