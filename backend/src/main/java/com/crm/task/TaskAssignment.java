package com.crm.task;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_assignments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaskAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "assignment_id", nullable = false)
    private UUID assignmentId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "assigned_by", nullable = false)
    private UUID assignedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Status {
        PENDING, IN_PROGRESS, DONE, OVERDUE
    }
}
