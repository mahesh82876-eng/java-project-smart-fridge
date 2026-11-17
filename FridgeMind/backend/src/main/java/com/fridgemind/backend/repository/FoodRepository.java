package com.fridgemind.backend.repository;

import com.fridgemind.backend.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<FoodItem, Long> {

    /**
     * Search food items by name (case-insensitive, partial matching)
     */
    @Query("SELECT f FROM FoodItem f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<FoodItem> findByNameContainingIgnoreCase(@Param("name") String name);

    /**
     * Filter food items by category (case-insensitive)
     */
    List<FoodItem> findByCategoryIgnoreCase(String category);

    /**
     * Find food items expiring on or before a given date
     */
    List<FoodItem> findByExpiryDateLessThan(LocalDate date);

    /**
     * Find food items expiring between two dates (inclusive)
     */
    List<FoodItem> findByExpiryDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Count items by category
     */
    @Query("SELECT f.category, COUNT(f) FROM FoodItem f GROUP BY f.category")
    List<Object[]> countItemsByCategory();
}
