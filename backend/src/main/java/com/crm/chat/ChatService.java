package com.crm.chat;

import com.crm.workspace.Message;
import com.crm.workspace.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepo;
    private final SimpMessagingTemplate messaging;

    @Transactional
    public Message sendMessage(UUID workspaceId, UUID senderId, String content) {
        Message msg = messageRepo.save(Message.builder()
                .workspaceId(workspaceId)
                .senderId(senderId)
                .content(content)
                .build());

        messaging.convertAndSend("/topic/workspace/" + workspaceId, msg);
        return msg;
    }

    public List<Message> getHistory(UUID workspaceId) {
        return messageRepo.findByWorkspaceIdOrderBySentAtAsc(workspaceId);
    }
}
