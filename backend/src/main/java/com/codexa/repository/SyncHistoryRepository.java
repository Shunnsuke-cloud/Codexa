package com.codexa.repository;

import com.codexa.entity.SyncHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SyncHistoryRepository extends JpaRepository<SyncHistory, Long> {
    List<SyncHistory> findTop20ByOrderByStartedAtDesc();
}
