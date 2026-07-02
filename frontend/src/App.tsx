import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { DialogProvider } from './components/ui/DialogProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminRoute from './auth/AdminRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectOverviewPage from './pages/ProjectOverviewPage';
import IssuesPage from './pages/IssuesPage';
import IssueDetailPage from './pages/IssueDetailPage';
import GanttPage from './pages/GanttPage';
import WikiListPage from './pages/WikiListPage';
import WikiViewPage from './pages/WikiViewPage';
import WikiEditPage from './pages/WikiEditPage';
import WikiHomePage from './pages/WikiHomePage';
import AllIssuesPage from './pages/AllIssuesPage';

// Vite base('/redmine/' 또는 '/')에서 라우터 basename 도출 (끝 슬래시 제거)
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <AuthProvider>
      <DialogProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/issues" element={<AllIssuesPage />} />
            <Route path="/wiki" element={<WikiHomePage />} />
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <UsersPage />
                </AdminRoute>
              }
            />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />}>
              <Route index element={<ProjectOverviewPage />} />
              <Route path="issues" element={<IssuesPage />} />
              <Route path="issues/:issueId" element={<IssueDetailPage />} />
              <Route path="gantt" element={<GanttPage />} />
              <Route path="wiki" element={<WikiListPage />} />
              <Route path="wiki/:slug" element={<WikiViewPage />} />
              <Route path="wiki/:slug/edit" element={<WikiEditPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </DialogProvider>
    </AuthProvider>
  );
}
