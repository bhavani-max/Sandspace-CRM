import { useQuery } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { taskService } from "../../services/taskService";
import { PageLoader } from "../../components/common";

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: users = [], isLoading: lu } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getAllUsers,
  });
  const { data: teams = [], isLoading: lt } = useQuery({
    queryKey: ["teams"],
    queryFn: userService.getAllTeams,
  });

  if (lu || lt) return <PageLoader />;

  const members = users.filter((u) => u.role === "MEMBER");
  const leaders = users.filter((u) => u.role === "LEADER");

  return (
    <div>
      <h1 className="mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={users.length} icon="🧑‍💼" color="bg-blue-50" />
        <StatCard label="Teams" value={teams.length} icon="👥" color="bg-purple-50" />
        <StatCard label="Team Leaders" value={leaders.length} icon="🏅" color="bg-yellow-50" />
        <StatCard label="Team Members" value={members.length} icon="👤" color="bg-green-50" />
      </div>

      <div className="card">
        <h2 className="mb-4">Teams Overview</h2>
        {teams.length === 0 ? (
          <p className="text-gray-400 text-sm">No teams yet. Go to Teams to create one.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Team Name</th>
                <th className="pb-2">Leader</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => {
                const leader = users.find((u) => u.id === t.leaderId);
                return (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{t.name}</td>
                    <td className="py-2.5 text-gray-500">{leader?.name ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
