package com.crm.chat;

import com.crm.workspace.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * Client sends to: /app/chat.send
     * Payload: { workspaceId, senderId, content }
     * Broadcast to: /topic/workspace/{workspaceId}
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, String> payload) {
        UUID workspaceId = UUID.fromString(payload.get("workspaceId"));
        UUID senderId = UUID.fromString(payload.get("senderId"));
        String content = payload.get("content");
        chatService.sendMessage(workspaceId, senderId, content);
    }
}
