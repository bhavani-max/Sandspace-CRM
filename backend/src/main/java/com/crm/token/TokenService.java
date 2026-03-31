package com.crm.token;

import com.crm.user.Team;
import com.crm.user.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final SupportTokenRepository tokenRepo;
    private final TokenCommentRepository commentRepo;
    private final TeamRepository teamRepo;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public SupportToken raiseToken(UUID raisedBy, UUID teamId, String title,
                                    String description, SupportToken.Priority priority) {
        SupportToken token = SupportToken.builder()
                .raisedBy(raisedBy)
                .teamId(teamId)
                .title(title)
                .description(description)
                .priority(priority)
                .status(SupportToken.Status.OPEN)
                .build();
        SupportToken saved = tokenRepo.save(token);

        // Push real-time notification to team leader
        teamRepo.findById(teamId).ifPresent(team -> {
            if (team.getLeaderId() != null) {
                messagingTemplate.convertAndSend(
                        "/topic/leader/" + team.getLeaderId() + "/tokens",
                        Map.of("tokenId", saved.getId(), "title", title,
                               "priority", priority.name(), "raisedBy", raisedBy)
                );
            }
        });

        return saved;
    }

    public List<SupportToken> getTeamTokens(UUID teamId) {
        return tokenRepo.findByTeamId(teamId);
    }

    public List<SupportToken> getMyTokens(UUID userId) {
        return tokenRepo.findByRaisedBy(userId);
    }

    @Transactional
    public SupportToken updateStatus(UUID tokenId, SupportToken.Status newStatus) {
        SupportToken token = tokenRepo.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found: " + tokenId));
        token.setStatus(newStatus);
        if (newStatus == SupportToken.Status.RESOLVED) {
            token.setResolvedAt(LocalDateTime.now());
        }
        return tokenRepo.save(token);
    }

    @Transactional
    public TokenComment addComment(UUID tokenId, UUID authorId, String content) {
        return commentRepo.save(TokenComment.builder()
                .tokenId(tokenId)
                .authorId(authorId)
                .content(content)
                .build());
    }

    public List<TokenComment> getComments(UUID tokenId) {
        return commentRepo.findByTokenIdOrderByCreatedAtAsc(tokenId);
    }
}
