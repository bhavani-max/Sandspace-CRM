package com.crm.workspace;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workspace_members")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@IdClass(WorkspaceMember.WorkspaceMemberId.class)
public class WorkspaceMember {

    @Id
    @Column(name = "workspace_id")
    private UUID workspaceId;

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt = LocalDateTime.now();

    @lombok.Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkspaceMemberId implements Serializable {
        private UUID workspaceId;
        private UUID userId;
    }
}
