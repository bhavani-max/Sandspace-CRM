package com.crm.task;

import com.crm.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // ── Assignments ──────────────────────────────────────────
    @PostMapping("/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Assignment> createAssignment(
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam UUID teamId,
            @RequestParam(required = false) MultipartFile file,
            @AuthenticationPrincipal User user) throws IOException {
        return ResponseEntity.ok(taskService.createAssignment(
                title, description, dueDate, teamId, user.getId(), file));
    }

    @GetMapping("/assignments")
    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    public ResponseEntity<List<Assignment>> getAssignments(
            @RequestParam(required = false) UUID teamId) {
        return ResponseEntity.ok(teamId != null
                ? taskService.getAssignmentsByTeam(teamId)
                : List.of());
    }

    // ── Task Delegation ──────────────────────────────────────
    @PostMapping("/assignments/{id}/assign")
    @PreAuthorize("hasRole('LEADER')")
    public ResponseEntity<List<TaskAssignment>> assignTask(
            @PathVariable UUID id,
            @RequestBody Map<String, List<UUID>> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.delegateTask(id, body.get("memberIds"), user.getId()));
    }

    @GetMapping("/tasks/me")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<List<TaskAssignment>> getMyTasks(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.getMyTasks(user.getId()));
    }

    @PatchMapping("/tasks/{id}/status")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<TaskAssignment> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        TaskAssignment.Status status = TaskAssignment.Status.valueOf(body.get("status"));
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status));
    }

    @GetMapping("/progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    public ResponseEntity<List<TaskAssignment>> getProgress(
            @RequestParam(required = false) UUID teamId) {
        return ResponseEntity.ok(teamId != null
                ? taskService.getTeamProgress(teamId)
                : List.of());
    }
}
