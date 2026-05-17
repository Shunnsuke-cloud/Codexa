package com.codexa.repository;

import java.util.List;
import java.util.Optional;

import com.codexa.entity.StudyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    List<StudyLog> findByUserEmailOrderByCreatedAtDesc(String email);

    Optional<StudyLog> findByIdAndUserEmail(Long id, String email);

    @Query("select coalesce(sum(s.studyTime),0) from StudyLog s where lower(s.user.email) = lower(:email)")
    Integer sumStudyTimeByUserEmail(@Param("email") String email);

    @Query(value = "select count(distinct date(s.created_at)) from study_logs s join users u on s.user_id = u.id where lower(u.email) = lower(:email)", nativeQuery = true)
    Integer countDistinctStudyDaysByUserEmail(@Param("email") String email);

    @Query(value = "select s.technology, coalesce(sum(s.study_time),0) as total_time, count(*) as cnt from study_logs s join users u on s.user_id = u.id where lower(u.email) = lower(:email) group by s.technology order by total_time desc limit 5", nativeQuery = true)
    java.util.List<Object[]> findTopTechnologiesByUserEmail(@Param("email") String email);

    @Query(value = "select date(s.created_at) as d, coalesce(sum(s.study_time),0) as total from study_logs s join users u on s.user_id = u.id where lower(u.email) = lower(:email) and date(s.created_at) >= current_date - interval '6 days' group by d order by d", nativeQuery = true)
    java.util.List<Object[]> findWeeklyStudyByUserEmail(@Param("email") String email);
}
