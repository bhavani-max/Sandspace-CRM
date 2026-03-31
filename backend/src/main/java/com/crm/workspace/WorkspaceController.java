package com.crm.workspace;

import com.crm.chat.ChatService;
import com.crm.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final ChatService chatService;

    // ── Workspaces ────────────────────────────────────────────
    @PostMapping("/workspaces")
    @PreAuthorize("hasRole('LEADER')")
    public ResponseEntity<Workspace> create(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        UUID assignmentId = body.containsKey("assignmentId")
                ? UUID.fromString(body.get("assignmentId")) : null;
        return ResponseEntity.ok(workspaceService.createWorkspace(
                user.getId(), assignmentId, body.get("name")));
    }

    @PostMapping("/workspaces/{id}/members")
    @PreAuthorize("hasRole('LEADER')")
    public ResponseEntity<Void> addMembers(
            @PathVariable UUID id,
            @RequestBody Map<String, List<UUID>> body) {
        workspaceService.addMembers(id, body.get("userIds"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/workspaces/me")
    @PreAuthorize("hasAnyRole('MEMBER', 'LEADER')")
    public ResponseEntity<List<Workspace>> myWorkspaces(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workspaceService.getMyWorkspaces(user.getId()));
    }

    @GetMapping("/workspaces/{id}")
    public ResponseEntity<Workspace> getWorkspace(@PathVariable UUID id) {
        return ResponseEntity.ok(workspaceService.getById(id));
    }

    @GetMapping("/workspaces/{id}/members")
    public ResponseEntity<List<WorkspaceMember>> getMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(workspaceService.getMembers(id));
    }

    @PatchMapping("/workspaces/{id}/notes")
    @PreAuthorize("hasAnyRole('MEMBER', 'LEADER')")
    public ResponseEntity<Workspace> updateNotes(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(workspaceService.updateNotes(id, body.get("notes")));
    }

    @PostMapping("/workspaces/{id}/docs")
    @PreAuthorize("hasAnyRole('MEMBER', 'LEADER')")
    public ResponseEntity<WorkspaceDoc> uploadDoc(
            @PathVariable UUID id,
            @RequestParam MultipartFile file,
            @AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.ok(workspaceService.uploadDoc(id, user.getId(), file));
    }

    @GetMapping("/workspaces/{id}/docs")
    public ResponseEntity<List<WorkspaceDoc>> getDocs(@PathVariable UUID id) {
        return ResponseEntity.ok(workspaceService.getDocs(id));
    }

    // ── Chat (REST history) ────────────────────────────────────
    @GetMapping("/messages")
    public ResponseEntity<List<com.crm.workspace.Message>> getChatHistory(
            @RequestParam UUID workspaceId) {
        return ResponseEntity.ok(chatService.getHistory(workspaceId));
    }
}
