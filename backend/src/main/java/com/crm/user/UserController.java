package com.crm.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── Users ──────────────────────────────────────────────
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        User.Role role = User.Role.valueOf(body.get("role"));
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    // ── Teams ──────────────────────────────────────────────
    @GetMapping("/teams")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Team>> getAllTeams() {
        return ResponseEntity.ok(userService.getAllTeams());
    }

    @PostMapping("/teams")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Team> createTeam(@RequestBody Map<String, String> body) {
        UUID leaderId = UUID.fromString(body.get("leaderId"));
        return ResponseEntity.ok(userService.createTeam(body.get("name"), leaderId));
    }

    @GetMapping("/teams/{id}/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    public ResponseEntity<List<User>> getTeamMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getTeamMembers(id));
    }

    @PostMapping("/teams/{id}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> addMemberToTeam(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID userId = UUID.fromString(body.get("userId"));
        return ResponseEntity.ok(userService.assignUserToTeam(userId, id));
    }
}
