package com.dev.arj.invoice_generator.repository;

import com.dev.arj.invoice_generator.Entity.Role;
import com.dev.arj.invoice_generator.Entity.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleEnum name);
}
