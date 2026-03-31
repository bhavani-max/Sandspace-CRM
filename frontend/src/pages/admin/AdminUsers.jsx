import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";
import { Modal, Badge, PageLoader } from "../../components/common";
import toast from "react-hot-toast";

const ROLES = ["ADMIN", "LEADER", "MEMBER"];

export default function AdminUsers() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "MEMBER" });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getAllUsers,
  });

  const createUser = useMutation({
    mutationFn: () => authService.register(form),
    onSuccess: () => {
      qc.invalidateQueries(["users"]);
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", role: "MEMBER" });
      toast.success("User created!");
    },
    onError: () => toast.error("Failed to create user"),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }) => userService.updateRole(id, role),
    onSuccess: () => { qc.invalidateQueries(["users"]); toast.success("Role updated"); },
    onError: () => toast.error("Failed to update role"),
  });

  const roleColor = { ADMIN: "red", LEADER: "blue", MEMBER: "green" };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1>Users</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New User</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Role</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium">{u.name}</td>
                <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                <td className="py-3 pr-4">
                  <Badge label={u.role} variant={roleColor[u.role] ?? "gray"} />
                </td>
                <td className="py-3">
                  <Badge label={u.isActive ? "Active" : "Inactive"} variant={u.isActive ? "green" : "gray"} />
                </td>
                <td className="py-3">
                  <select
                    className="text-xs border rounded px-2 py-1"
                    value={u.role}
                    onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value })}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create User">
        <div className="space-y-4">
          {[["name", "Full Name", "text"], ["email", "Email", "email"], ["password", "Password", "password"]].map(
            ([key, label, type]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  type={type}
                  className="input"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            )
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button
              className="btn-primary"
              disabled={!form.name || !form.email || !form.password || createUser.isPending}
              onClick={() => createUser.mutate()}
            >
              {createUser.isPending ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
