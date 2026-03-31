package com.crm.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EodReportRepository extends JpaRepository<EodReport, UUID> {
    List<EodReport> findByMemberId(UUID memberId);
    Optional<EodReport> findByMemberIdAndReportDate(UUID memberId, LocalDate date);
    List<EodReport> findByReportDate(LocalDate date);
}
