package com.example.redmine.config;

import com.example.redmine.user.Role;
import com.example.redmine.user.User;
import com.example.redmine.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner seedData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> userRepository.findByUsername("admin").ifPresentOrElse(admin -> {
            // 기존 DB 마이그레이션: role 컬럼 추가 직후 null 인 admin 보정
            if (admin.getRole() == null) {
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }
        }, () -> userRepository.save(new User(
                "admin",
                passwordEncoder.encode("admin"),
                "Administrator",
                Role.ADMIN)));
    }
}
