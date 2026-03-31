import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { workspaceService } from "../../services/workspaceService";
import { useWebSocket } from "../../hooks/useWebSocket";
import { PageLoader, Spinner } from "../../components/common";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function WorkspaceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [tab, setTab] = useState("chat"); // chat | notes | docs
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const { data: ws, isLoading: loadingWs } = useQuery({
    queryKey: ["workspace", id],
    queryFn: () => workspaceService.getById(id),
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["chatHistory", id],
    queryFn: () => workspaceService.getChatHistory(id),
    onSuccess: (data) => setMessages(data),
  });

  const { data: docs = [] } = useQuery({
    queryKey: ["wsDocs", id],
    queryFn: () => workspaceService.getDocs(id),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["wsMembers", id],
    queryFn: () => workspaceService.getMembers(id),
  });

  // Sync history into messages state once loaded
  useEffect(() => {
    if (history.length) setMessages(history);
  }, [history]);

  // Sync notes from workspace
  useEffect(() => {
    if (ws?.notes) setNotes(ws.notes);
  }, [ws]);

  // Auto-scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket — real-time chat
  const { sendMessage } = useWebSocket({
    workspaceId: id,
    onChatMessage: (msg) => setMessages((prev) => [...prev, msg]),
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(id, user.userId, message.trim());
    setMessage("");
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await workspaceService.updateNotes(id, notes);
      toast.success("Notes saved");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const uploadDoc = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return workspaceService.uploadDoc(id, fd);
    },
    onSuccess: () => { qc.invalidateQueries(["wsDocs", id]); toast.success("File uploaded!"); },
    onError: () => toast.error("Upload failed"),
  });

  if (loadingWs) return <PageLoader />;

  const TABS = [
    { key: "chat", label: "💬 Chat" },
    { key: "notes", label: "📝 Notes" },
    { key: "docs", label: `📎 Docs (${docs.length})` },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4">
        <h1>{ws?.name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {members.length} member(s) · Created {ws ? format(new Date(ws.createdAt), "dd MMM yyyy") : ""}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {tab === "chat" && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
            {loadingHistory ? (
              <div className="flex justify-center pt-8"><Spinner /></div>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm pt-8">No messages yet. Say hello! 👋</p>
            ) : (
              messages.map((msg, i) => {
                const mine = msg.senderId === user?.userId;
                return (
                  <div key={msg.id ?? i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                      mine
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${mine ? "text-blue-200" : "text-gray-400"}`}>
                        {msg.sentAt ? format(new Date(msg.sentAt), "HH:mm") : "now"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chat input */}
          <div className="flex gap-2 pt-3 border-t mt-2">
            <input
              className="input flex-1"
              placeholder="Type a message…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <button className="btn-primary px-5" onClick={handleSend} disabled={!message.trim()}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {tab === "notes" && (
        <div className="flex flex-col flex-1 min-h-0 gap-3">
          <textarea
            className="input flex-1 resize-none font-mono text-sm"
            placeholder="Shared notes for this workspace… Everyone can edit."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              className="btn-primary"
              onClick={saveNotes}
              disabled={savingNotes}
            >
              {savingNotes ? "Saving…" : "Save Notes"}
            </button>
          </div>
        </div>
      )}

      {/* Docs Tab */}
      {tab === "docs" && (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="flex justify-end mb-2">
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              onChange={(e) => e.target.files[0] && uploadDoc.mutate(e.target.files[0])}
            />
            <button
              className="btn-primary text-sm"
              disabled={uploadDoc.isPending}
              onClick={() => fileRef.current.click()}
            >
              {uploadDoc.isPending ? "Uploading…" : "+ Upload File"}
            </button>
          </div>

          {docs.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">No files uploaded yet.</p>
          ) : (
            docs.map((doc) => (
              <div key={doc.id} className="card flex items-center gap-3 py-3">
                <span className="text-2xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.fileName}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(doc.uploadedAt), "dd MMM yyyy · HH:mm")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
