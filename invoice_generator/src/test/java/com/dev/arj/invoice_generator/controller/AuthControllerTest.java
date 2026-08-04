package com.dev.arj.invoice_generator.controller;

import com.dev.arj.invoice_generator.DTO.AuthResponseDTO;
import com.dev.arj.invoice_generator.DTO.LoginRequestDTO;
import com.dev.arj.invoice_generator.DTO.RegisterRequestDTO;
import com.dev.arj.invoice_generator.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/v1/auth/register - Should return 201 CREATED for valid payload")
    void shouldRegisterUserSuccessfully() throws Exception {
        RegisterRequestDTO registerRequest = RegisterRequestDTO.builder()
                .username("john_doe")
                .email("john@example.com")
                .password("Password123!")
                .build();

        AuthResponseDTO authResponse = AuthResponseDTO.builder()
                .token("mocked-jwt-token")
                .type("Bearer")
                .username("john_doe")
                .email("john@example.com")
                .roles(List.of("ROLE_USER"))
                .build();

        when(authService.registerUser(any(RegisterRequestDTO.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mocked-jwt-token"))
                .andExpect(jsonPath("$.username").value("john_doe"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Should return 400 BAD REQUEST when validation fails")
    void shouldFailRegisterWhenPayloadInvalid() throws Exception {
        RegisterRequestDTO invalidRequest = RegisterRequestDTO.builder()
                .username("") // Blank username violates @NotBlank
                .email("invalid-email") // Invalid email format violates @Email
                .password("123") // Too short violates @Size
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.username").exists())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Should return 200 OK with Bearer token on valid credentials")
    void shouldLoginSuccessfully() throws Exception {
        LoginRequestDTO loginRequest = LoginRequestDTO.builder()
                .username("john_doe")
                .password("Password123!")
                .build();

        AuthResponseDTO authResponse = AuthResponseDTO.builder()
                .token("valid-signed-jwt")
                .type("Bearer")
                .username("john_doe")
                .email("john@example.com")
                .roles(List.of("ROLE_USER"))
                .build();

        when(authService.loginUser(any(LoginRequestDTO.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("valid-signed-jwt"))
                .andExpect(jsonPath("$.type").value("Bearer"));
    }
}
