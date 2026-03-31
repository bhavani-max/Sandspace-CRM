package com.crm.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    List<Assignment> findByTeamId(UUID teamId);
    List<Assignment> findByCreatedBy(UUID createdBy);
}
