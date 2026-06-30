package com.example.redmine.auth;

import com.example.redmine.auth.dto.LoginRequest;
import com.example.redmine.auth.dto.LoginResponse;
import com.example.redmine.auth.dto.RegisterRequest;
import com.example.redmine.common.BadRequestException;
import com.example.redmine.user.Role;
import com.example.redmine.user.User;
import com.example.redmine.user.UserDto;
import com.example.redmine.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid username or password");
        }
        String token = jwtUtil.generateToken(user.getUsername());
        return new LoginResponse(token, UserDto.from(user));
    }

    @PostMapping("/register")
    public LoginResponse register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("이미 사용 중인 아이디입니다.");
        }
        String displayName = (request.displayName() == null || request.displayName().isBlank())
                ? request.username()
                : request.displayName();
        User user = userRepository.save(new User(
                request.username(),
                passwordEncoder.encode(request.password()),
                displayName,
                Role.USER));
        String token = jwtUtil.generateToken(user.getUsername());
        return new LoginResponse(token, UserDto.from(user));
    }

    @GetMapping("/me")
    public UserDto me(@CurrentUser User user) {
        return UserDto.from(user);
    }
}
