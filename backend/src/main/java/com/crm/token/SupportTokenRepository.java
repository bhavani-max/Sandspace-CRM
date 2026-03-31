package com.crm.token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupportTokenRepository extends JpaRepository<SupportToken, UUID> {
    List<SupportToken> findByTeamId(UUID teamId);
    List<SupportToken> findByRaisedBy(UUID userId);
    List<SupportToken> findByTeamIdAndStatus(UUID teamId, SupportToken.Status status);
}
