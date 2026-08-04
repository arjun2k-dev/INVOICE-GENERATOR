package com.dev.arj.invoice_generator.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {

    private String token;
    @Builder.Default
    private String type = "Bearer";
    private String username;
    private String email;
    private List<String> roles;
}
