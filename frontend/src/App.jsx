import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

// Auth
import LoginPage from "./pages/LoginPage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAssignments from "./pages/admin/AdminAssignments";
import AdminProgress from "./pages/admin/AdminProgress";

// Leader
import LeaderDashboard from "./pages/leader/LeaderDashboard";
import LeaderAssignments from "./pages/leader/LeaderAssignments";
import { LeaderProgress } from "./pages/leader/LeaderProgress";
import LeaderTokens from "./pages/leader/LeaderTokens";
import LeaderEODReports from "./pages/leader/LeaderEODReports";

// Member
import MemberDashboard from "./pages/member/MemberDashboard";
import MemberTasks from "./pages/member/MemberTasks";
import MemberEODReport from "./pages/member/MemberEODReport";
import MemberTokens from "./pages/member/MemberTokens";
import MemberWorkspaces from "./pages/member/MemberWorkspaces";
import WorkspaceDetail from "./pages/member/WorkspaceDetail";

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const home = { ADMIN: "/admin", LEADER: "/leader", MEMBER: "/member" };
  return <Navigate to={home[user?.role] ?? "/login"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center text-center">
          <div>
            <p className="text-5xl mb-4">🚫</p>
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-gray-500">You don't have permission to view this page.</p>
          </div>
        </div>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/teams" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AppLayout><AdminTeams /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AppLayout><AdminUsers /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/assignments" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AppLayout><AdminAssignments /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/progress" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AppLayout><AdminProgress /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Leader routes */}
      <Route path="/leader" element={
        <ProtectedRoute allowedRoles={["LEADER"]}>
          <AppLayout><LeaderDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/leader/assignments" element={
        <ProtectedRoute allowedRoles={["LEADER"]}>
          <AppLayout><LeaderAssignments /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/leader/progress" element={
        <ProtectedRoute allowedRoles={["LEADER"]}>
          <AppLayout><LeaderProgress /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/leader/tokens" element={
        <ProtectedRoute allowedRoles={["LEADER"]}>
          <AppLayout><LeaderTokens /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/leader/reports" element={
        <ProtectedRoute allowedRoles={["LEADER"]}>
          <AppLayout><LeaderEODReports /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Member routes */}
      <Route path="/member" element={
        <ProtectedRoute allowedRoles={["MEMBER"]}>
          <AppLayout><MemberDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/member/tasks" element={
        <ProtectedRoute allowedRoles={["MEMBER"]}>
          <AppLayout><MemberTasks /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/member/eod" element={
        <ProtectedRoute allowedRoles={["MEMBER"]}>
          <AppLayout><MemberEODReport /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/member/tokens" element={
        <ProtectedRoute allowedRoles={["MEMBER"]}>
          <AppLayout><MemberTokens /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/member/workspaces" element={
        <ProtectedRoute allowedRoles={["MEMBER"]}>
          <AppLayout><MemberWorkspaces /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/member/workspaces/:id" element={
        <ProtectedRoute allowedRoles={["MEMBER"]}>
          <AppLayout><WorkspaceDetail /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
