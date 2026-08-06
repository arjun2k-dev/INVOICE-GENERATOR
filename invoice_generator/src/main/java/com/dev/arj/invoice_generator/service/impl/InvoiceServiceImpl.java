package com.dev.arj.invoice_generator.service.impl;

import com.dev.arj.invoice_generator.DTO.InvoiceNotificationDTO;
import com.dev.arj.invoice_generator.DTO.InvoiceRequestDTO;
import com.dev.arj.invoice_generator.DTO.InvoiceResponseDTO;
import com.dev.arj.invoice_generator.DTO.StatusUpdateDTO;
import com.dev.arj.invoice_generator.Entity.Invoice;
import com.dev.arj.invoice_generator.Entity.InvoiceStatus;
import com.dev.arj.invoice_generator.Entity.RoleEnum;
import com.dev.arj.invoice_generator.Entity.User;
import com.dev.arj.invoice_generator.Exception.ResourceNotFoundException;
import com.dev.arj.invoice_generator.repository.InvoiceRepository;
import com.dev.arj.invoice_generator.repository.UserRepository;
import com.dev.arj.invoice_generator.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate; // Handles WebSocket Pushes

    @Override
    @Transactional
    public InvoiceResponseDTO createInvoice(InvoiceRequestDTO requestDTO, String username) {
        if (invoiceRepository.existsByInvoiceNumber(requestDTO.getInvoiceNumber())) {
            throw new IllegalArgumentException("Invoice number already exists: " + requestDTO.getInvoiceNumber());
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        Invoice invoice = Invoice.builder()
                .invoiceNumber(requestDTO.getInvoiceNumber())
                .amount(requestDTO.getAmount())
                .vendorName(requestDTO.getVendorName())
                .status(InvoiceStatus.PENDING)
                .user(user)
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);
        InvoiceResponseDTO responseDTO = mapToResponseDTO(savedInvoice);
        // 🟢 REAL-TIME PUSH: Notify Admin Global Feed (/topic/admin/invoices) when new invoice is created
        try {
            InvoiceNotificationDTO adminNotification = InvoiceNotificationDTO.builder()
                    .type("INVOICE_CREATED")
                    .invoiceId(savedInvoice.getId())
                    .invoiceNumber(savedInvoice.getInvoiceNumber())
                    .amount(savedInvoice.getAmount())
                    .vendorName(savedInvoice.getVendorName())
                    .status(savedInvoice.getStatus())
                    .username(user.getUsername())
                    .timestamp(LocalDateTime.now())
                    .build();

            messagingTemplate.convertAndSend("/topic/admin/invoices", adminNotification);
        } catch (Exception e) {
            // Silently catch WebSocket errors so DB transaction isn't broken if client disconnects
        }

        return responseDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> getUserInvoices(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        return invoiceRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> getAllInvoicesForAdmin() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InvoiceResponseDTO updateInvoiceStatus(Long id, StatusUpdateDTO statusUpdateDTO) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        invoice.setStatus(statusUpdateDTO.getStatus());
        Invoice updatedInvoice = invoiceRepository.save(invoice);
// 1. Declare responseDTO explicitly
        InvoiceResponseDTO responseDTO = mapToResponseDTO(updatedInvoice);

        // 2. Real-Time Push: Notify submitter privately (/user/{username}/queue/notifications) on status change
        try {
            InvoiceNotificationDTO userNotification = InvoiceNotificationDTO.builder()
                    .type("STATUS_UPDATED")
                    .invoiceId(updatedInvoice.getId())
                    .invoiceNumber(updatedInvoice.getInvoiceNumber())
                    .amount(updatedInvoice.getAmount())
                    .vendorName(updatedInvoice.getVendorName())
                    .status(updatedInvoice.getStatus())
                    .username(updatedInvoice.getUser().getUsername())
                    .timestamp(LocalDateTime.now())
                    .build();

            // Broadcast to a dedicated unique channel path for this specific username
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + updatedInvoice.getUser().getUsername(),
                    userNotification
            );

        } catch (Exception e) {
            // Silently catch WebSocket errors
        }

        return responseDTO;
        }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponseDTO getInvoiceById(Long id, String username) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(RoleEnum.ROLE_ADMIN));

        // Enforce user-level isolation: standard users can only view their own invoices
        if (!isAdmin && !invoice.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to view this invoice.");
        }

        return mapToResponseDTO(invoice);
    }

    private InvoiceResponseDTO mapToResponseDTO(Invoice invoice) {
        return InvoiceResponseDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .amount(invoice.getAmount())
                .vendorName(invoice.getVendorName())
                .status(invoice.getStatus())
                .createdDate(invoice.getCreatedDate())
                .username(invoice.getUser().getUsername())
                .build();
    }
}
