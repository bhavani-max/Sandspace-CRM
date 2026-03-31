import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../../services/taskService";
import { StatusBadge, PageLoader, EmptyState } from "../../components/common";
import toast from "react-hot-toast";

const STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

export default function MemberTasks() {
  const qc = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["myTasks"],
    queryFn: taskService.getMyTasks,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => taskService.updateTaskStatus(id, status),
    onSuccess: () => { qc.invalidateQueries(["myTasks"]); toast.success("Status updated!"); },
    onError: () => toast.error("Failed to update status"),
  });

  if (isLoading) return <PageLoader />;

  const grouped = {
    PENDING: tasks.filter((t) => t.status === "PENDING"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: tasks.filter((t) => t.status === "DONE"),
    OVERDUE: tasks.filter((t) => t.status === "OVERDUE"),
  };

  const colStyle = {
    PENDING: "border-t-gray-300",
    IN_PROGRESS: "border-t-blue-400",
    DONE: "border-t-green-400",
    OVERDUE: "border-t-red-400",
  };

  return (
    <div>
      <h1 className="mb-6">My Tasks</h1>
      {tasks.length === 0 ? (
        <EmptyState icon="✅" title="No tasks assigned" message="Your team leader hasn't assigned you any tasks yet." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(grouped).map(([status, items]) => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={status} />
                <span className="text-xs text-gray-400">({items.length})</span>
              </div>
              <div className={`space-y-3`}>
                {items.map((task) => (
                  <div
                    key={task.id}
                    className={`card border-t-4 ${colStyle[status]} py-3`}
                  >
                    <p className="text-xs text-gray-400 font-mono mb-2 truncate">
                      Task #{task.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Assigned {task.assignedAt
                        ? new Date(task.assignedAt).toLocaleDateString()
                        : "—"}
                    </p>
                    {status !== "DONE" && status !== "OVERDUE" && (
                      <div className="space-y-1">
                        {STATUSES.filter((s) => s.value !== status).map((s) => (
                          <button
                            key={s.value}
                            className="w-full text-xs btn-secondary py-1"
                            disabled={updateStatus.isPending}
                            onClick={() => updateStatus.mutate({ id: task.id, status: s.value })}
                          >
                            → Mark as {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {status === "DONE" && (
                      <p className="text-xs text-green-600">
                        ✓ Completed {task.completedAt
                          ? new Date(task.completedAt).toLocaleDateString()
                          : ""}
                      </p>
                    )}
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-gray-300 text-center py-4">None</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
