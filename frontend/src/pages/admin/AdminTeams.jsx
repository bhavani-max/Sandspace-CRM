import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { Modal, PageLoader, EmptyState } from "../../components/common";
import toast from "react-hot-toast";

export default function AdminTeams() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", leaderId: "" });

  const { data: teams = [], isLoading: lt } = useQuery({
    queryKey: ["teams"],
    queryFn: userService.getAllTeams,
  });
  const { data: users = [], isLoading: lu } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getAllUsers,
  });

  const createTeam = useMutation({
    mutationFn: () => userService.createTeam(form.name, form.leaderId),
    onSuccess: () => {
      qc.invalidateQueries(["teams"]);
      setShowCreate(false);
      setForm({ name: "", leaderId: "" });
      toast.success("Team created!");
    },
    onError: () => toast.error("Failed to create team"),
  });

  const leaders = users.filter((u) => u.role === "LEADER");

  if (lt || lu) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1>Teams</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + New Team
        </button>
      </div>

      {teams.length === 0 ? (
        <EmptyState icon="👥" title="No teams yet" message="Create a team to get started." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => {
            const leader = users.find((u) => u.id === t.leaderId);
            const members = users.filter((u) => u.teamId === t.id && u.role === "MEMBER");
            return (
              <div key={t.id} className="card">
                <h2 className="text-base mb-1">{t.name}</h2>
                <p className="text-sm text-gray-500 mb-3">
                  Leader: {leader?.name ?? <span className="italic">Unassigned</span>}
                </p>
                <p className="text-xs text-gray-400">{members.length} member(s)</p>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Team">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Engineering Alpha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Team Leader</label>
            <select
              className="input"
              value={form.leaderId}
              onChange={(e) => setForm({ ...form, leaderId: e.target.value })}
            >
              <option value="">Select a leader…</option>
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button
              className="btn-primary"
              disabled={!form.name || !form.leaderId || createTeam.isPending}
              onClick={() => createTeam.mutate()}
            >
              {createTeam.isPending ? "Creating…" : "Create Team"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
