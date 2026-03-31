import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tokenService } from "../../services/tokenService";
import { Modal, StatusBadge, PriorityBadge, PageLoader, EmptyState } from "../../components/common";
import { format } from "date-fns";
import toast from "react-hot-toast";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export default function MemberTokens() {
  const qc = useQueryClient();
  const [showRaise, setShowRaise] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM" });
  const [comment, setComment] = useState("");

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["myTokens"],
    queryFn: tokenService.myTokens,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["tokenComments", selected?.id],
    queryFn: () => tokenService.getComments(selected.id),
    enabled: !!selected,
  });

  const raise = useMutation({
    mutationFn: () => tokenService.raise(form),
    onSuccess: () => {
      qc.invalidateQueries(["myTokens"]);
      setShowRaise(false);
      setForm({ title: "", description: "", priority: "MEDIUM" });
      toast.success("Token raised! Your leader has been notified.");
    },
    onError: () => toast.error("Failed to raise token"),
  });

  const addComment = useMutation({
    mutationFn: () => tokenService.addComment(selected.id, comment),
    onSuccess: () => {
      qc.invalidateQueries(["tokenComments"]);
      setComment("");
    },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1>Support Tokens</h1>
        <button className="btn-primary" onClick={() => setShowRaise(true)}>
          + Raise Token
        </button>
      </div>

      {tokens.length === 0 ? (
        <EmptyState
          icon="🎫"
          title="No support tokens"
          message="Raise a token whenever you need help from your team leader."
        />
      ) : (
        <div className="space-y-3">
          {tokens.map((t) => (
            <div
              key={t.id}
              className="card flex items-start justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelected(t)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm">{t.title}</span>
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-xs text-gray-500 truncate">{t.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(t.createdAt), "dd MMM yyyy · HH:mm")}
                </p>
              </div>
              {t.resolvedAt && (
                <p className="text-xs text-green-500 shrink-0">
                  Resolved {format(new Date(t.resolvedAt), "dd MMM")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Raise Token Modal */}
      <Modal open={showRaise} onClose={() => setShowRaise(false)} title="Raise Support Token">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              className="input"
              placeholder="Brief issue title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Describe the issue in detail…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, priority: p })}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.priority === p
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setShowRaise(false)}>Cancel</button>
            <button
              className="btn-primary"
              disabled={!form.title.trim() || !form.description.trim() || raise.isPending}
              onClick={() => raise.mutate()}
            >
              {raise.isPending ? "Raising…" : "Raise Token"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Token detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? ""}>
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <PriorityBadge priority={selected.priority} />
              <StatusBadge status={selected.status} />
            </div>
            <p className="text-sm text-gray-600">{selected.description}</p>
            {selected.resolvedAt && (
              <p className="text-xs text-green-600">
                ✓ Resolved on {format(new Date(selected.resolvedAt), "dd MMM yyyy")}
              </p>
            )}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-2">Comments</p>
              <div className="space-y-2 max-h-44 overflow-y-auto mb-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-400">No comments yet.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      <p className="text-gray-700">{c.content}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(c.createdAt), "dd MMM · HH:mm")}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  className="input flex-1 text-sm"
                  placeholder="Add a comment…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && comment.trim() && addComment.mutate()}
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
