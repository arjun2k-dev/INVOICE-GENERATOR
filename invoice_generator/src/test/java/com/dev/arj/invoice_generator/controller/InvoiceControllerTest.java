package com.dev.arj.invoice_generator.controller;

import com.dev.arj.invoice_generator.Config.CustomUserDetailsService;
import com.dev.arj.invoice_generator.Config.JwtUtils;
import com.dev.arj.invoice_generator.DTO.InvoiceRequestDTO;
import com.dev.arj.invoice_generator.DTO.InvoiceResponseDTO;
import com.dev.arj.invoice_generator.DTO.StatusUpdateDTO;
import com.dev.arj.invoice_generator.Entity.InvoiceStatus;
import com.dev.arj.invoice_generator.service.InvoiceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InvoiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // Explicit Jackson ObjectMapper with JavaTimeModule to handle LocalDateTime safely
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @MockitoBean
    private InvoiceService invoiceService;

    @MockitoBean
    private JwtUtils jwtUtils;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    // ==========================================
    // 1. UNAUTHENTICATED TESTS (401 Unauthorized)
    // ==========================================

    @Test
    @DisplayName("GET /api/v1/invoices/my-invoices - Unauthenticated request should return 401 Unauthorized")
    void shouldReturn401WhenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/invoices/my-invoices"))
                .andExpect(status().isUnauthorized());
    }

    // ==========================================
    // 2. ROLE_USER AUTHORIZATION TESTS
    // ==========================================

    @Test
    @DisplayName("POST /api/v1/invoices - ROLE_USER can create invoice (201 Created)")
    void shouldAllowUserToCreateInvoice() throws Exception {
        InvoiceRequestDTO requestDTO = InvoiceRequestDTO.builder()
                .invoiceNumber("INV-2026-001")
                .amount(new BigDecimal("1500.00"))
                .vendorName("Acme Corp")
                .build();

        InvoiceResponseDTO responseDTO = InvoiceResponseDTO.builder()
                .id(1L)
                .invoiceNumber("INV-2026-001")
                .amount(new BigDecimal("1500.00"))
                .vendorName("Acme Corp")
                .status(InvoiceStatus.PENDING)
                .createdDate(LocalDateTime.now())
                .username("standard_user")
                .build();

        when(invoiceService.createInvoice(any(InvoiceRequestDTO.class), eq("standard_user")))
                .thenReturn(responseDTO);

        mockMvc.perform(post("/api/v1/invoices")
                        .with(user("standard_user").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.invoiceNumber").value("INV-2026-001"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("GET /api/v1/invoices/my-invoices - ROLE_USER can retrieve own invoices (200 OK)")
    void shouldAllowUserToFetchOwnInvoices() throws Exception {
        InvoiceResponseDTO responseDTO = InvoiceResponseDTO.builder()
                .id(1L)
                .invoiceNumber("INV-2026-001")
                .amount(new BigDecimal("1500.00"))
                .vendorName("Acme Corp")
                .status(InvoiceStatus.PENDING)
                .createdDate(LocalDateTime.now())
                .username("standard_user")
                .build();

        when(invoiceService.getUserInvoices("standard_user")).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/v1/invoices/my-invoices")
                        .with(user("standard_user").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].invoiceNumber").value("INV-2026-001"));
    }

    @Test
    @DisplayName("GET /api/v1/invoices/admin/ledger - ROLE_USER calling admin endpoint should return 403 Forbidden")
    void shouldReturn403WhenUserAccessesAdminLedger() throws Exception {
        mockMvc.perform(get("/api/v1/invoices/admin/ledger")
                        .with(user("standard_user").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PATCH /api/v1/invoices/admin/1/status - ROLE_USER updating status should return 403 Forbidden")
    void shouldReturn403WhenUserUpdatesInvoiceStatus() throws Exception {
        StatusUpdateDTO updateDTO = StatusUpdateDTO.builder()
                .status(InvoiceStatus.APPROVED)
                .build();

        mockMvc.perform(patch("/api/v1/invoices/admin/1/status")
                        .with(user("standard_user").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 3. ROLE_ADMIN AUTHORIZATION TESTS
    // ==========================================

    @Test
    @DisplayName("GET /api/v1/invoices/admin/ledger - ROLE_ADMIN can view global ledgers (200 OK)")
    void shouldAllowAdminToViewGlobalLedger() throws Exception {
        InvoiceResponseDTO invoice1 = InvoiceResponseDTO.builder()
                .id(1L)
                .invoiceNumber("INV-001")
                .amount(new BigDecimal("500.00"))
                .vendorName("Vendor A")
                .status(InvoiceStatus.PENDING)
                .createdDate(LocalDateTime.now())
                .username("user1")
                .build();

        when(invoiceService.getAllInvoicesForAdmin()).thenReturn(List.of(invoice1));

        mockMvc.perform(get("/api/v1/invoices/admin/ledger")
                        .with(user("admin_user").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].invoiceNumber").value("INV-001"));
    }

    @Test
    @DisplayName("PATCH /api/v1/invoices/admin/1/status - ROLE_ADMIN can approve invoice status (200 OK)")
    void shouldAllowAdminToApproveInvoice() throws Exception {
        StatusUpdateDTO updateDTO = StatusUpdateDTO.builder()
                .status(InvoiceStatus.APPROVED)
                .build();

        InvoiceResponseDTO approvedResponse = InvoiceResponseDTO.builder()
                .id(1L)
                .invoiceNumber("INV-001")
                .amount(new BigDecimal("500.00"))
                .vendorName("Vendor A")
                .status(InvoiceStatus.APPROVED)
                .createdDate(LocalDateTime.now())
                .username("user1")
                .build();

        when(invoiceService.updateInvoiceStatus(eq(1L), any(StatusUpdateDTO.class)))
                .thenReturn(approvedResponse);

        mockMvc.perform(patch("/api/v1/invoices/admin/1/status")
                        .with(user("admin_user").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }
}