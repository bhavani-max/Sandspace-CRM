package com.crm.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    public List<User> getUsersByTeam(UUID teamId) {
        return userRepository.findByTeamId(teamId);
    }

    @Transactional
    public User createUser(String name, String email, String password, User.Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use: " + email);
        }
        User user = User.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .isActive(true)
                .build();
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserRole(UUID userId, User.Role newRole) {
        User user = getUserById(userId);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    @Transactional
    public User assignUserToTeam(UUID userId, UUID teamId) {
        User user = getUserById(userId);
        teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found: " + teamId));
        user.setTeamId(teamId);
        return userRepository.save(user);
    }

    // Teams
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Team getTeamById(UUID id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found: " + id));
    }

    @Transactional
    public Team createTeam(String name, UUID leaderId) {
        Team team = Team.builder()
                .name(name)
                .leaderId(leaderId)
                .build();
        Team saved = teamRepository.save(team);
        // Update leader's team
        userRepository.findById(leaderId).ifPresent(leader -> {
            leader.setTeamId(saved.getId());
            userRepository.save(leader);
        });
        return saved;
    }

    public List<User> getTeamMembers(UUID teamId) {
        return userRepository.findByTeamId(teamId);
    }
}
