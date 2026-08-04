package com.dev.arj.invoice_generator.controller;

import com.dev.arj.invoice_generator.DTO.InvoiceRequestDTO;
import com.dev.arj.invoice_generator.DTO.InvoiceResponseDTO;
import com.dev.arj.invoice_generator.DTO.StatusUpdateDTO;
import com.dev.arj.invoice_generator.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    // 1. Create a new invoice (Accessible by USER and ADMIN)
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<InvoiceResponseDTO> createInvoice(
            @Valid @RequestBody InvoiceRequestDTO requestDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        InvoiceResponseDTO response = invoiceService.createInvoice(requestDTO, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 2. View user's own invoice history (Accessible by USER and ADMIN)
    @GetMapping("/my-invoices")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<InvoiceResponseDTO>> getUserInvoices(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<InvoiceResponseDTO> response = invoiceService.getUserInvoices(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    // 3. Get invoice by ID (Ownership enforced in service layer for non-admins)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<InvoiceResponseDTO> getInvoiceById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        InvoiceResponseDTO response = invoiceService.getInvoiceById(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    // 4. Global Ledger: View all enterprise invoices (Strictly ADMIN only)
    @GetMapping("/admin/ledger")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InvoiceResponseDTO>> getAllInvoicesForAdmin() {
        List<InvoiceResponseDTO> response = invoiceService.getAllInvoicesForAdmin();
        return ResponseEntity.ok(response);
    }

    // 5. Update invoice approval status: PENDING / APPROVED / REJECTED (Strictly ADMIN only)
    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InvoiceResponseDTO> updateInvoiceStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO statusUpdateDTO) {

        InvoiceResponseDTO response = invoiceService.updateInvoiceStatus(id, statusUpdateDTO);
        return ResponseEntity.ok(response);
    }
}
