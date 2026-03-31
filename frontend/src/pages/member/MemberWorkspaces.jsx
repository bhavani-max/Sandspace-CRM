import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "../../services/workspaceService";
import { PageLoader, EmptyState } from "../../components/common";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function MemberWorkspaces() {
  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ["myWorkspaces"],
    queryFn: workspaceService.myWorkspaces,
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="mb-6">My Workspaces</h1>
      {workspaces.length === 0 ? (
        <EmptyState
          icon="🤝"
          title="No workspaces yet"
          message="Your team leader will add you to collaborative workspaces when needed."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              to={`/member/workspaces/${ws.id}`}
              className="card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">🤝</div>
                <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                  Open →
                </span>
              </div>
              <h2 className="text-base mb-1">{ws.name}</h2>
              <p className="text-xs text-gray-400">
                Created {format(new Date(ws.createdAt), "dd MMM yyyy")}
              </p>
              {ws.notes && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{ws.notes}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
