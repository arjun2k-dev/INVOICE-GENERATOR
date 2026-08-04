package com.dev.arj.invoice_generator.service;

import com.dev.arj.invoice_generator.DTO.InvoiceRequestDTO;
import com.dev.arj.invoice_generator.DTO.InvoiceResponseDTO;
import com.dev.arj.invoice_generator.DTO.StatusUpdateDTO;

import java.util.List;

public interface InvoiceService {

    InvoiceResponseDTO createInvoice(InvoiceRequestDTO requestDTO, String username);

    List<InvoiceResponseDTO> getUserInvoices(String username);

    List<InvoiceResponseDTO> getAllInvoicesForAdmin();

    InvoiceResponseDTO updateInvoiceStatus(Long id, StatusUpdateDTO statusUpdateDTO);

    InvoiceResponseDTO getInvoiceById(Long id, String username);
}
