package com.buildintel.backend.repository;

import com.buildintel.backend.entity.Builder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface BuilderRepository extends JpaRepository<Builder, Integer> {

    Optional<Builder> findByBuilderNameIgnoreCase(String builderName);

    @Query("SELECT b FROM Builder b LEFT JOIN FETCH b.projects WHERE b.id = :id")
    Optional<Builder> findByIdWithProjects(@Param("id") Integer id);
}
