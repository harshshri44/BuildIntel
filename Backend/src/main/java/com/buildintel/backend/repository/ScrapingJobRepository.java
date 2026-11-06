package com.buildintel.backend.repository;

import com.buildintel.backend.entity.ScrapingJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScrapingJobRepository extends JpaRepository<ScrapingJob, String> {

    boolean existsByStatusIn(Collection<String> statuses);

    List<ScrapingJob> findByStatusIn(Collection<String> statuses);

    long countByStatus(String status);

    Optional<ScrapingJob> findTop1ByOrderByStartTimeDesc();

    Page<ScrapingJob> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
