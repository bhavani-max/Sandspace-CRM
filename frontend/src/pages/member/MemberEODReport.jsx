import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportService } from "../../services/reportService";
import { PageLoader, EmptyState } from "../../components/common";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function MemberEODReport() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ summary: "", blockers: "" });
  const [file, setFile] = useState(null);
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["myReports"],
    queryFn: reportService.myReports,
  });

  const submittedToday = reports.some((r) => r.reportDate === today);

  const submit = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("summary", form.summary);
      if (form.blockers) fd.append("blockers", form.blockers);
      if (file) fd.append("file", file);
      return reportService.submit(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries(["myReports"]);
      setForm({ summary: "", blockers: "" });
      setFile(null);
      toast.success("EOD report submitted!");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Submission failed"),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 max-w-2xl">
      <h1>EOD Report</h1>

      {/* Today's submission form */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base">Today's Report — {format(new Date(), "dd MMMM yyyy")}</h2>
          {submittedToday && (
            <span className="badge-green">✓ Submitted</span>
          )}
        </div>

        {submittedToday ? (
          <p className="text-sm text-gray-500">You've already submitted your EOD report for today. See it below.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Work Summary <span className="text-red-400">*</span>
              </label>
              <textarea
                className="input h-32 resize-none"
                placeholder="What did you work on today? Tasks completed, progress made…"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Blockers <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                className="input h-20 resize-none"
                placeholder="Any blockers, issues or things slowing you down?"
                value={form.blockers}
                onChange={(e) => setForm({ ...form, blockers: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Attachment <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="file"
                className="input py-1.5 text-sm"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <button
              className="btn-primary"
              disabled={!form.summary.trim() || submit.isPending}
              onClick={() => submit.mutate()}
            >
              {submit.isPending ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="mb-4">Report History</h2>
        {reports.length === 0 ? (
          <EmptyState icon="📭" title="No reports yet" message="Your submitted reports will appear here." />
        ) : (
          <div className="space-y-3">
            {reports
              .slice()
              .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))
              .map((r) => (
                <div key={r.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">
                      {format(new Date(r.reportDate), "EEEE, dd MMM yyyy")}
                    </p>
                    <span className="text-xs text-gray-400">
                      {format(new Date(r.submittedAt), "HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{r.summary}</p>
                  {r.blockers && (
                    <p className="text-xs text-red-500 mt-1">⚠ {r.blockers}</p>
                  )}
                  {r.filePath && (
                    <p className="text-xs text-gray-400 mt-1">📎 Attachment</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
