import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { taskService } from "../../services/taskService";
import { userService } from "../../services/userService";
import { Modal, PageLoader, EmptyState } from "../../components/common";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function LeaderAssignments() {
  const { user } = useAuth();
  const teamId = user?.teamId;
  const qc = useQueryClient();
  const [delegateModal, setDelegateModal] = useState(null); // assignment
  const [selectedMembers, setSelectedMembers] = useState([]);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["assignments", teamId],
    queryFn: () => taskService.getAssignments(teamId),
    enabled: !!teamId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["teamMembers", teamId],
    queryFn: () => userService.getTeamMembers(teamId),
    enabled: !!teamId,
  });

  const delegate = useMutation({
    mutationFn: () => taskService.assignTask(delegateModal.id, selectedMembers),
    onSuccess: () => {
      qc.invalidateQueries(["progress"]);
      setDelegateModal(null);
      setSelectedMembers([]);
      toast.success("Task delegated!");
    },
    onError: () => toast.error("Failed to delegate"),
  });

  const toggleMember = (id) =>
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="mb-6">Team Assignments</h1>
      {assignments.length === 0 ? (
        <EmptyState icon="📋" title="No assignments" message="Your team has no assignments yet." />
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="card flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-base mb-1">{a.title}</h2>
                <p className="text-sm text-gray-500 mb-2">{a.description}</p>
                <p className="text-xs text-gray-400">
                  Due: {format(new Date(a.dueDate), "dd MMM yyyy")}
                  {a.filePath && " · 📎 File attached"}
                </p>
              </div>
              <button
                className="btn-primary text-sm shrink-0"
                onClick={() => { setDelegateModal(a); setSelectedMembers([]); }}
              >
                Delegate
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!delegateModal}
        onClose={() => setDelegateModal(null)}
        title={`Delegate: ${delegateModal?.title}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Select one or more team members to assign this task:</p>
          <div className="space-y-2">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(m.id)}
                  onChange={() => toggleMember(m.id)}
                />
                <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {m.name[0]}
                </div>
                <span className="text-sm font-medium">{m.name}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setDelegateModal(null)}>Cancel</button>
            <button
              className="btn-primary"
              disabled={selectedMembers.length === 0 || delegate.isPending}
              onClick={() => delegate.mutate()}
            >
              {delegate.isPending ? "Delegating…" : `Assign to ${selectedMembers.length} member(s)`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
