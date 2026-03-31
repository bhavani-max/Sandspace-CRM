import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { tokenService } from "../../services/tokenService";
import { userService } from "../../services/userService";
import { useWebSocket } from "../../hooks/useWebSocket";
import { StatusBadge, PriorityBadge, Modal, PageLoader, EmptyState } from "../../components/common";
import toast from "react-hot-toast";
import { format } from "date-fns";

const STATUSES = ["OPEN", "IN_REVIEW", "RESOLVED"];

export default function LeaderTokens() {
  const { user } = useAuth();
  const teamId = user?.teamId;
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");

  // Real-time token alerts
  useWebSocket({
    leaderId: user?.userId,
    onTokenAlert: (alert) => {
      toast(`🎫 New token: ${alert.title}`, { icon: "🔔" });
      qc.invalidateQueries(["tokens", teamId]);
    },
  });

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["tokens", teamId],
    queryFn: () => tokenService.getTeamTokens(teamId),
    enabled: !!teamId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["teamMembers", teamId],
    queryFn: () => userService.getTeamMembers(teamId),
    enabled: !!teamId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["tokenComments", selected?.id],
    queryFn: () => tokenService.getComments(selected.id),
    enabled: !!selected,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => tokenService.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries(["tokens"]); toast.success("Status updated"); },
  });

  const addComment = useMutation({
    mutationFn: () => tokenService.addComment(selected.id, comment),
    onSuccess: () => { qc.invalidateQueries(["tokenComments"]); setComment(""); },
  });

  const getMember = (id) => members.find((m) => m.id === id);

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="mb-6">Support Tokens</h1>
      {tokens.length === 0 ? (
        <EmptyState icon="🎫" title="No tokens" message="No support tokens raised by your team." />
      ) : (
        <div className="space-y-3">
          {tokens.map((t) => (
            <div
              key={t.id}
              className="card flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelected(t)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{t.title}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
                <p className="text-xs text-gray-500 truncate">{t.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  By {getMember(t.raisedBy)?.name ?? "—"} ·{" "}
                  {format(new Date(t.createdAt), "dd MMM yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={t.status} />
                <select
                  className="text-xs border rounded px-2 py-1"
                  value={t.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateStatus.mutate({ id: t.id, status: e.target.value })}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Token detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? ""}>
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <PriorityBadge priority={selected.priority} />
              <StatusBadge status={selected.status} />
            </div>
            <p className="text-sm text-gray-600">{selected.description}</p>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Comments</p>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                {comments.map((c) => (
                  <div key={c.id} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <p className="text-gray-700">{c.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(c.createdAt), "dd MMM HH:mm")}
                    </p>
                  </div>
                ))}
                {comments.length === 0 && <p className="text-xs text-gray-400">No comments yet.</p>}
              </div>
              <div className="flex gap-2">
                <input
                  className="input flex-1 text-sm"
                  placeholder="Add a comment…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  className="btn-primary text-sm"
                  disabled={!comment.trim() || addComment.isPending}
                  onClick={() => addComment.mutate()}
                >Send</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
