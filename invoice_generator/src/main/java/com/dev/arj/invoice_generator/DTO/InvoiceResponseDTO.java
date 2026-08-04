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
public class InvoiceResponseDTO {

    private Long id;
    private String invoiceNumber;
    private BigDecimal amount;
    private String vendorName;
    private InvoiceStatus status;
    private LocalDateTime createdDate;
    private String username;
}
