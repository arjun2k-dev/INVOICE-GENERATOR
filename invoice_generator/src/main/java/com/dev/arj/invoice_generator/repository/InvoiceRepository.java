package com.dev.arj.invoice_generator.repository;

import com.dev.arj.invoice_generator.Entity.Invoice;
import com.dev.arj.invoice_generator.Entity.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByUserId(Long userId);

    List<Invoice> findByStatus(InvoiceStatus status);

    Boolean existsByInvoiceNumber(String invoiceNumber);
}
