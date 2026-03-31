import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navByRole = {
  ADMIN: [
    { to: "/admin", label: "Dashboard", icon: "🏠" },
    { to: "/admin/teams", label: "Teams", icon: "👥" },
    { to: "/admin/users", label: "Users", icon: "🧑‍💼" },
    { to: "/admin/assignments", label: "Assignments", icon: "📋" },
    { to: "/admin/progress", label: "Progress", icon: "📊" },
  ],
  LEADER: [
    { to: "/leader", label: "Dashboard", icon: "🏠" },
    { to: "/leader/assignments", label: "Assignments", icon: "📋" },
    { to: "/leader/progress", label: "Team Progress", icon: "📊" },
    { to: "/leader/tokens", label: "Support Tokens", icon: "🎫" },
    { to: "/leader/reports", label: "EOD Reports", icon: "📝" },
  ],
  MEMBER: [
    { to: "/member", label: "Dashboard", icon: "🏠" },
    { to: "/member/tasks", label: "My Tasks", icon: "✅" },
    { to: "/member/eod", label: "EOD Report", icon: "📝" },
    { to: "/member/tokens", label: "Support Tokens", icon: "🎫" },
    { to: "/member/workspaces", label: "Workspaces", icon: "🤝" },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navByRole[user?.role] ?? [];

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white tracking-tight">CRM System</h1>
        <p className="text-xs text-gray-400 mt-1 capitalize">{user?.role?.toLowerCase()} portal</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split("/").length === 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="w-full text-left text-xs text-gray-400 hover:text-white transition-colors px-1"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}

export function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
