package com.example.redmine.user;

import com.example.redmine.auth.CurrentUser;
import com.example.redmine.common.BadRequestException;
import com.example.redmine.common.ForbiddenException;
import com.example.redmine.common.NotFoundException;
import com.example.redmine.user.dto.CreateUserRequest;
import com.example.redmine.user.dto.UpdateUserRequest;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<UserDto> list() {
        return userRepository.findAll().stream().map(UserDto::from).toList();
    }

    @PostMapping
    public UserDto create(@CurrentUser User me, @Valid @RequestBody CreateUserRequest request) {
        requireAdmin(me);
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("이미 사용 중인 아이디입니다.");
        }
        String displayName = (request.displayName() == null || request.displayName().isBlank())
                ? request.username()
                : request.displayName();
        Role role = request.role() == null ? Role.USER : request.role();
        User user = userRepository.save(new User(
                request.username(),
                passwordEncoder.encode(request.password()),
                displayName,
                role));
        return UserDto.from(user);
    }

    @PutMapping("/{id}")
    public UserDto update(@CurrentUser User me, @PathVariable Long id,
                          @RequestBody UpdateUserRequest request) {
        requireAdmin(me);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        if (request.displayName() != null && !request.displayName().isBlank()) {
            user.setDisplayName(request.displayName());
        }
        if (request.role() != null && request.role() != user.getRole()) {
            // 마지막 admin 의 권한을 내리는 것 방지
            if (user.getRole() == Role.ADMIN && request.role() != Role.ADMIN
                    && userRepository.countByRole(Role.ADMIN) <= 1) {
                throw new BadRequestException("마지막 관리자의 권한은 변경할 수 없습니다.");
            }
            user.setRole(request.role());
        }
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        return UserDto.from(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    public void delete(@CurrentUser User me, @PathVariable Long id) {
        requireAdmin(me);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        if (user.getId().equals(me.getId())) {
            throw new BadRequestException("본인 계정은 삭제할 수 없습니다.");
        }
        if (user.getRole() == Role.ADMIN && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new BadRequestException("마지막 관리자는 삭제할 수 없습니다.");
        }
        userRepository.delete(user);
    }

    private void requireAdmin(User me) {
        if (me.getRole() != Role.ADMIN) {
            throw new ForbiddenException("관리자 권한이 필요합니다.");
        }
    }
}
