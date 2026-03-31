import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../../services/taskService";
import { userService } from "../../services/userService";
import { PageLoader, EmptyState } from "../../components/common";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function AdminAssignments() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", teamId: "" });
  const [file, setFile] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("");

  const { data: teams = [] } = useQuery({ queryKey: ["teams"], queryFn: userService.getAllTeams });
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["assignments", selectedTeam],
    queryFn: () => taskService.getAssignments(selectedTeam || undefined),
    enabled: !!selectedTeam,
  });

  const create = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("dueDate", form.dueDate);
      fd.append("teamId", form.teamId);
      if (file) fd.append("file", file);
      return taskService.createAssignment(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries(["assignments"]);
      setForm({ title: "", description: "", dueDate: "", teamId: "" });
      setFile(null);
      toast.success("Assignment uploaded!");
    },
    onError: () => toast.error("Upload failed"),
  });

  return (
    <div className="space-y-8">
      <h1>Assignments</h1>

      {/* Upload form */}
      <div className="card">
        <h2 className="mb-4">Upload New Assignment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input className="input" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Team *</label>
            <select className="input" value={form.teamId}
              onChange={(e) => setForm({ ...form, teamId: e.target.value })}>
              <option value="">Select team…</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date *</label>
            <input type="date" className="input" value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Attachment (optional)</label>
            <input type="file" className="input py-1.5" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="input h-24 resize-none" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn-primary"
            disabled={!form.title || !form.teamId || !form.dueDate || create.isPending}
            onClick={() => create.mutate()}>
            {create.isPending ? "Uploading…" : "Upload Assignment"}
          </button>
        </div>
      </div>

      {/* View by team */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2>View Assignments by Team</h2>
          <select className="input w-48" value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}>
            <option value="">Select team…</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {!selectedTeam ? (
          <p className="text-sm text-gray-400">Select a team to view assignments.</p>
        ) : isLoading ? (
          <PageLoader />
        ) : assignments.length === 0 ? (
          <EmptyState icon="📋" title="No assignments" message="None uploaded for this team yet." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Due Date</th>
                <th className="pb-2">File</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="py-2.5 pr-4 font-medium">{a.title}</td>
                  <td className="py-2.5 pr-4 text-gray-500">
                    {format(new Date(a.dueDate), "dd MMM yyyy")}
                  </td>
                  <td className="py-2.5 text-xs text-gray-400">
                    {a.filePath ? "📎 Attached" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
