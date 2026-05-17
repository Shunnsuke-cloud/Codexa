package com.codexa.repository;

import com.codexa.entity.ExternalCommit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExternalCommitRepository extends JpaRepository<ExternalCommit, Long> {
    Optional<ExternalCommit> findByExternalId(String externalId);
}
