package com.crm.task;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "eod_reports",
       uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "report_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EodReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String blockers;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt = LocalDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
