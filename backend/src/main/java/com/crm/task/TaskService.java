package com.crm.task;

import com.crm.config.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final AssignmentRepository assignmentRepo;
    private final TaskAssignmentRepository taskAssignmentRepo;
    private final FileStorageService fileStorage;

    // ── Assignments ──────────────────────────────────────────
    @Transactional
    public Assignment createAssignment(String title, String description,
                                       LocalDate dueDate, UUID teamId,
                                       UUID createdBy, MultipartFile file) throws IOException {
        String filePath = null;
        if (file != null && !file.isEmpty()) {
            filePath = fileStorage.store(file, "assignments");
        }
        Assignment a = Assignment.builder()
                .title(title)
                .description(description)
                .dueDate(dueDate)
                .teamId(teamId)
                .createdBy(createdBy)
                .filePath(filePath)
                .build();
        return assignmentRepo.save(a);
    }

    public List<Assignment> getAssignmentsByTeam(UUID teamId) {
        return assignmentRepo.findByTeamId(teamId);
    }

    public Assignment getAssignmentById(UUID id) {
        return assignmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + id));
    }

    // ── Task Delegation ──────────────────────────────────────
    @Transactional
    public List<TaskAssignment> delegateTask(UUID assignmentId, List<UUID> memberIds, UUID leaderId) {
        return memberIds.stream().map(memberId -> {
            TaskAssignment ta = TaskAssignment.builder()
                    .assignmentId(assignmentId)
                    .memberId(memberId)
                    .assignedBy(leaderId)
                    .status(TaskAssignment.Status.PENDING)
                    .build();
            return taskAssignmentRepo.save(ta);
        }).toList();
    }

    public List<TaskAssignment> getMyTasks(UUID memberId) {
        return taskAssignmentRepo.findByMemberId(memberId);
    }

    @Transactional
    public TaskAssignment updateTaskStatus(UUID taskId, TaskAssignment.Status newStatus) {
        TaskAssignment ta = taskAssignmentRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        ta.setStatus(newStatus);
        if (newStatus == TaskAssignment.Status.DONE) {
            ta.setCompletedAt(LocalDateTime.now());
        }
        return taskAssignmentRepo.save(ta);
    }

    // ── Progress ─────────────────────────────────────────────
    public List<TaskAssignment> getTeamProgress(UUID teamId) {
        return taskAssignmentRepo.findByTeamId(teamId);
    }
}
