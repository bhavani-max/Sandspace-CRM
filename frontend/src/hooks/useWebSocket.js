import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export function useWebSocket({ onTokenAlert, onChatMessage, workspaceId, leaderId }) {
  const clientRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("crm_token");
    const client = new Client({
      webSocketFactory: () => new SockJS("/ws"),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to workspace chat
        if (workspaceId) {
          client.subscribe(`/topic/workspace/${workspaceId}`, (msg) => {
            const body = JSON.parse(msg.body);
            onChatMessage?.(body);
          });
        }
        // Subscribe to leader token alerts
        if (leaderId) {
          client.subscribe(`/topic/leader/${leaderId}/tokens`, (msg) => {
            const body = JSON.parse(msg.body);
            onTokenAlert?.(body);
          });
        }
      },
    });

    client.activate();
    clientRef.current = client;

    return () => client.deactivate();
  }, [workspaceId, leaderId]);

  const sendMessage = useCallback((workspaceId, senderId, content) => {
    clientRef.current?.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ workspaceId, senderId, content }),
    });
  }, []);

  return { sendMessage };
}
