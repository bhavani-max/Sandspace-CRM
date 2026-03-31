import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { reportService } from "../../services/reportService";
import { userService } from "../../services/userService";
import { PageLoader, EmptyState } from "../../components/common";
import { format } from "date-fns";

export default function LeaderEODReports() {
  const { user } = useAuth();
  const teamId = user?.teamId;
  const [selectedMember, setSelectedMember] = useState("");

  const { data: members = [] } = useQuery({
    queryKey: ["teamMembers", teamId],
    queryFn: () => userService.getTeamMembers(teamId),
    enabled: !!teamId,
  });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports", selectedMember],
    queryFn: () => reportService.getReports(selectedMember || undefined, undefined),
    enabled: !!selectedMember,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>EOD Reports</h1>
        <select
          className="input w-52"
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
        >
          <option value="">Select member…</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {!selectedMember ? (
        <EmptyState icon="📝" title="Select a team member" message="Choose a member to view their EOD reports." />
      ) : isLoading ? (
        <PageLoader />
      ) : reports.length === 0 ? (
        <EmptyState icon="📭" title="No reports" message="This member hasn't submitted any EOD reports." />
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base">{format(new Date(r.reportDate), "EEEE, dd MMM yyyy")}</h2>
                <span className="text-xs text-gray-400">
                  Submitted {format(new Date(r.submittedAt), "HH:mm")}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Summary</p>
                  <p className="text-sm text-gray-700">{r.summary}</p>
                </div>
                {r.blockers && (
                  <div>
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Blockers</p>
                    <p className="text-sm text-gray-700">{r.blockers}</p>
                  </div>
                )}
                {r.filePath && (
                  <p className="text-xs text-gray-400">📎 Attachment uploaded</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
