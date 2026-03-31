package com.crm.auth;

import com.crm.user.User;
import com.crm.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("Account is disabled");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(),
                user.getRole().name(), user.getTeamId());
    }

    @Transactional
    public User register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new RuntimeException("Email already in use");
        }
        return userRepository.save(User.builder()
                .name(req.name())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(User.Role.valueOf(req.role()))
                .isActive(true)
                .build());
    }
}
