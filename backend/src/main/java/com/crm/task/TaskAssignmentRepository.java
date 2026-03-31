package com.crm.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, UUID> {
    List<TaskAssignment> findByMemberId(UUID memberId);
    List<TaskAssignment> findByAssignmentId(UUID assignmentId);

    @Query("SELECT t FROM TaskAssignment t WHERE t.assignmentId IN " +
           "(SELECT a.id FROM Assignment a WHERE a.teamId = :teamId)")
    List<TaskAssignment> findByTeamId(UUID teamId);

    Optional<TaskAssignment> findByAssignmentIdAndMemberId(UUID assignmentId, UUID memberId);
}
