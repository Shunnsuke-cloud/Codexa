package com.codexa.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sync_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyncHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "status")
    private String status;

    @Column(columnDefinition = "text")
    private String message;

    @Column(name = "synced_count")
    private Integer syncedCount;
}
