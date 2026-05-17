import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { TeamAuthProvider, useTeamAuth } from './context/TeamAuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/Loader';

// Pages
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import InviteResponse from './pages/InviteResponse';

// Admin
import AdminLogin from './components/admin/auth/AdminLogin';
import AdminLayout from './components/admin/layout/AdminLayout';
import Dashboard from './components/admin/dashboard/Dashboard';
import TeamManagement from './components/admin/teams/TeamManagement';
import ProblemBank from './components/admin/problems/ProblemBank';
import SubmissionsReview from './components/admin/submissions/SubmissionsReview';
import ResultsPanel from './components/admin/results/ResultsPanel';
import Announcements from './components/admin/announcements/Announcements';
import HackathonSettings from './components/admin/config/HackathonSettings';
import LandingPageConfig from './components/admin/landing/LandingPageConfig';
import AuditLogs from './components/admin/audit/AuditLogs';
import TimerManagement from './components/admin/timer/TimerManagement';
import { EmailComposer } from './components/admin/stubs';

// Team
import TeamLogin from './components/team/auth/TeamLogin';
import ChangePassword from './components/team/auth/ChangePassword';
import ChangePasswordInline from './components/team/auth/ChangePasswordInline';
import TeamLayout from './components/team/layout/TeamLayout';
import TeamDashboard from './components/team/dashboard/TeamDashboard';
import TeamProfile from './components/team/profile/TeamProfile';
import SubmissionForm from './components/team/submission/SubmissionForm';
import ResultsView from './components/team/results/ResultsView';
import AnnouncementsView from './components/team/announcements/AnnouncementsView';
import ProblemSelection from './components/team/problems/ProblemSelection';
import { CertificateDownload } from './components/team/stubs';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/console/admin/login" />;
};

const TeamRoute = ({ children }) => {
  const { isAuthenticated, loading } = useTeamAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/team/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <TeamAuthProvider>
          <ErrorBoundary>
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#f1f5f9', borderRadius: '12px' } }} />
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/invite/accept/:token" element={<InviteResponse action="accept" />} />
              <Route path="/invite/decline/:token" element={<InviteResponse action="decline" />} />

              {/* Admin Auth */}
              <Route path="/console/admin/login" element={<AdminLogin />} />

              {/* Admin Panel */}
              <Route path="/console/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<Navigate to="/console/admin/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="teams" element={<TeamManagement />} />
                <Route path="problems" element={<ProblemBank />} />
                <Route path="submissions" element={<SubmissionsReview />} />
                <Route path="results" element={<ResultsPanel />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="email" element={<EmailComposer />} />
                <Route path="landing" element={<LandingPageConfig />} />
                <Route path="config" element={<HackathonSettings />} />
                <Route path="timer" element={<TimerManagement />} />
                <Route path="audit" element={<AuditLogs />} />
              </Route>

              {/* Team Auth */}
              <Route path="/team/login" element={<TeamLogin />} />

              {/* Team Panel */}
              <Route path="/team" element={<TeamRoute><TeamLayout /></TeamRoute>}>
                <Route index element={<Navigate to="/team/dashboard" />} />
                <Route path="dashboard" element={<TeamDashboard />} />
                <Route path="profile" element={<TeamProfile />} />
                <Route path="problems" element={<ProblemSelection />} />
                <Route path="submission" element={<SubmissionForm />} />
                <Route path="results" element={<ResultsView />} />
                <Route path="announcements" element={<AnnouncementsView />} />
                <Route path="certificate" element={<CertificateDownload />} />
                <Route path="change-password" element={<ChangePasswordInline />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </TeamAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
