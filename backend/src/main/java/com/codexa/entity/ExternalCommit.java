package com.codexa.entity;

import lombok.*;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "external_commits", uniqueConstraints = @UniqueConstraint(columnNames = {"external_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExternalCommit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "repo_name")
    private String repoName;

    @Column(name = "external_id", nullable = false, unique = true)
    private String externalId;

    private String author;

    @Column(columnDefinition = "text")
    private String message;

    @Column(name = "committed_at")
    private OffsetDateTime committedAt;
}
