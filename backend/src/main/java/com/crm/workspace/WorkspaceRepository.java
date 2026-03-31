package com.crm.workspace;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {
    List<Workspace> findByCreatedBy(UUID userId);

    @Query("SELECT w FROM Workspace w WHERE w.id IN " +
           "(SELECT wm.workspaceId FROM WorkspaceMember wm WHERE wm.userId = :userId)")
    List<Workspace> findByMemberId(UUID userId);
}
