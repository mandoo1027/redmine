package com.example.redmine.config;

import com.example.redmine.auth.JwtAuthFilter;
import com.example.redmine.auth.JwtUtil;
import com.example.redmine.user.UserRepository;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        FilterRegistrationBean<JwtAuthFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new JwtAuthFilter(jwtUtil, userRepository));
        bean.addUrlPatterns("/api/*");
        bean.setOrder(1);
        return bean;
    }
}
