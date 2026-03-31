package com.crm.token;

import com.crm.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tokens")
@RequiredArgsConstructor
public class TokenController {

    private final TokenService tokenService;

    @PostMapping
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<SupportToken> raise(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(tokenService.raiseToken(
                user.getId(),
                user.getTeamId(),
                body.get("title"),
                body.get("description"),
                SupportToken.Priority.valueOf(body.getOrDefault("priority", "MEDIUM"))
        ));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LEADER', 'ADMIN')")
    public ResponseEntity<List<SupportToken>> getTokens(
            @RequestParam(required = false) UUID teamId) {
        return ResponseEntity.ok(teamId != null
                ? tokenService.getTeamTokens(teamId)
                : List.of());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<List<SupportToken>> myTokens(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(tokenService.getMyTokens(user.getId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('LEADER')")
    public ResponseEntity<SupportToken> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(tokenService.updateStatus(
                id, SupportToken.Status.valueOf(body.get("status"))));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('LEADER', 'MEMBER')")
    public ResponseEntity<TokenComment> addComment(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(tokenService.addComment(id, user.getId(), body.get("content")));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TokenComment>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(tokenService.getComments(id));
    }
}
