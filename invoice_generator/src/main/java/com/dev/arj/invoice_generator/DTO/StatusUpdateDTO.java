package com.dev.arj.invoice_generator.DTO;

import com.dev.arj.invoice_generator.Entity.InvoiceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusUpdateDTO {

    @NotNull(message = "Status cannot be null")
    private InvoiceStatus status;
}
