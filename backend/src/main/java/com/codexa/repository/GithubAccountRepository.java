package com.codexa.repository;

import java.util.Optional;

import com.codexa.entity.GithubAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GithubAccountRepository extends JpaRepository<GithubAccount, Long> {
    Optional<GithubAccount> findByState(String state);
    Optional<GithubAccount> findByUserId(Long userId);
}
