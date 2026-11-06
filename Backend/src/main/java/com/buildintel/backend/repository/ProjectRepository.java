package com.buildintel.backend.repository;

import com.buildintel.backend.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {

    @Override
    @EntityGraph(attributePaths = {"builder"})
    Page<Project> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"builder"})
    Optional<Project> findById(Integer id);

    @EntityGraph(attributePaths = {"builder"})
    Optional<Project> findByRegistrationNumber(String registrationNumber);

    @EntityGraph(attributePaths = {"builder"})
    Page<Project> findByProjectNameContainingIgnoreCaseOrRegistrationNumberContainingIgnoreCase(
            String projectName,
            String registrationNumber,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"builder"})
    Page<Project> findByDistrictIgnoreCase(String district, Pageable pageable);

    @EntityGraph(attributePaths = {"builder"})
    Page<Project> findByPincode(String pincode, Pageable pageable);

    @EntityGraph(attributePaths = {"builder"})
    Page<Project> findByDistrictIgnoreCaseAndPincode(String district, String pincode, Pageable pageable);

    @EntityGraph(attributePaths = {"builder"})
    Page<Project> findByBuilderId(Integer builderId, Pageable pageable);

    List<Project> findByBuilderId(Integer builderId);

    @Query("SELECT p.district, COUNT(p) FROM Project p WHERE p.district IS NOT NULL GROUP BY p.district ORDER BY COUNT(p) DESC")
    List<Object[]> countProjectsByDistrict();
}
