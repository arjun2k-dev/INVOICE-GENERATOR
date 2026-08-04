package com.dev.arj.invoice_generator.service;

import com.dev.arj.invoice_generator.DTO.AuthResponseDTO;
import com.dev.arj.invoice_generator.DTO.LoginRequestDTO;
import com.dev.arj.invoice_generator.DTO.RegisterRequestDTO;

public interface AuthService {

    AuthResponseDTO registerUser(RegisterRequestDTO registerRequestDTO);

    AuthResponseDTO loginUser(LoginRequestDTO loginRequestDTO);
}
