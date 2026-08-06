package com.dev.arj.invoice_generator.DTO;

import com.dev.arj.invoice_generator.Entity.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceNotificationDTO {

    private String type; // "INVOICE_CREATED" or "STATUS_UPDATED"
    private Long invoiceId;
    private String invoiceNumber;
    private BigDecimal amount;
    private String vendorName;
    private InvoiceStatus status;
    private String username;
    private LocalDateTime timestamp;
}
