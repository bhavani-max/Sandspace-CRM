package com.crm.workspace;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkspaceDocRepository extends JpaRepository<WorkspaceDoc, UUID> {
    List<WorkspaceDoc> findByWorkspaceId(UUID workspaceId);
}
