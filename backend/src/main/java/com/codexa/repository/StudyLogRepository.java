package com.codexa.repository;

import java.util.List;
import java.util.Optional;

import com.codexa.entity.StudyLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    List<StudyLog> findByUserEmailOrderByCreatedAtDesc(String email);

    Optional<StudyLog> findByIdAndUserEmail(Long id, String email);
}
