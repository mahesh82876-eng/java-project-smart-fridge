package com.fridgemind.backend.service;

import com.fridgemind.backend.dto.FoodItemRequest;
import com.fridgemind.backend.dto.FoodItemResponse;
import com.fridgemind.backend.dto.FoodStatisticsResponse;
import com.fridgemind.backend.entity.FoodItem;
import com.fridgemind.backend.exception.ResourceNotFoundException;
import com.fridgemind.backend.repository.FoodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class FoodService {

    public static final String STATUS_EXPIRED = "EXPIRED";
    public static final String STATUS_EXPIRING_SOON = "EXPIRING_SOON";
    public static final String STATUS_SAFE = "SAFE";

    private final FoodRepository foodRepository;

    public FoodService(FoodRepository foodRepository) {
        this.foodRepository = foodRepository;
    }

    /**
     * Add a new food item after validating dates.
     */
    public FoodItemResponse addFood(FoodItemRequest request) {
        validateDates(request.getPurchaseDate(), request.getExpiryDate());

        FoodItem foodItem = new FoodItem(
                request.getName().trim(),
                request.getCategory().trim(),
                request.getQuantity(),
                request.getUnit().trim(),
                request.getPurchaseDate(),
                request.getExpiryDate(),
                request.getNotes() != null ? request.getNotes().trim() : null
        );

        FoodItem saved = foodRepository.save(foodItem);
        return mapToResponse(saved);
    }

    /**
     * Retrieve all food items with dynamic expiry calculations.
     */
    @Transactional(readOnly = true)
    public List<FoodItemResponse> getAllFoods() {
        return foodRepository.findAll().stream()
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(FoodItemResponse::getExpiryDate))
                .collect(Collectors.toList());
    }

    /**
     * Retrieve a specific food item by its ID.
     */
    @Transactional(readOnly = true)
    public FoodItemResponse getFoodById(Long id) {
        FoodItem foodItem = foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + id));
        return mapToResponse(foodItem);
    }

    /**
     * Update an existing food item.
     */
    public FoodItemResponse updateFood(Long id, FoodItemRequest request) {
        validateDates(request.getPurchaseDate(), request.getExpiryDate());

        FoodItem existing = foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with id: " + id));

        existing.setName(request.getName().trim());
        existing.setCategory(request.getCategory().trim());
        existing.setQuantity(request.getQuantity());
        existing.setUnit(request.getUnit().trim());
        existing.setPurchaseDate(request.getPurchaseDate());
        existing.setExpiryDate(request.getExpiryDate());
        existing.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        FoodItem updated = foodRepository.save(existing);
        return mapToResponse(updated);
    }

    /**
     * Delete a food item by its ID.
     */
    public void deleteFood(Long id) {
        if (!foodRepository.existsById(id)) {
            throw new ResourceNotFoundException("Food item not found with id: " + id);
        }
        foodRepository.deleteById(id);
    }

    /**
     * Search food items by name.
     */
    @Transactional(readOnly = true)
    public List<FoodItemResponse> searchByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return getAllFoods();
        }
        return foodRepository.findByNameContainingIgnoreCase(name.trim()).stream()
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(FoodItemResponse::getExpiryDate))
                .collect(Collectors.toList());
    }

    /**
     * Filter food items by category.
     */
    @Transactional(readOnly = true)
    public List<FoodItemResponse> filterByCategory(String category) {
        if (category == null || category.trim().isEmpty() || "All".equalsIgnoreCase(category.trim())) {
            return getAllFoods();
        }
        return foodRepository.findByCategoryIgnoreCase(category.trim()).stream()
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(FoodItemResponse::getExpiryDate))
                .collect(Collectors.toList());
    }

    /**
     * Get items expiring soon (expiry date within next 3 days, including today, not expired).
     */
    @Transactional(readOnly = true)
    public List<FoodItemResponse> getExpiringSoon() {
        LocalDate today = LocalDate.now();
        LocalDate threeDaysFromNow = today.plusDays(3);

        return foodRepository.findByExpiryDateBetween(today, threeDaysFromNow).stream()
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(FoodItemResponse::getExpiryDate))
                .collect(Collectors.toList());
    }

    /**
     * Get expired items (expiry date strictly before today).
     */
    @Transactional(readOnly = true)
    public List<FoodItemResponse> getExpired() {
        LocalDate today = LocalDate.now();

        return foodRepository.findByExpiryDateLessThan(today).stream()
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(FoodItemResponse::getExpiryDate))
                .collect(Collectors.toList());
    }

    /**
     * Get dashboard statistics calculated from real database records.
     */
    @Transactional(readOnly = true)
    public FoodStatisticsResponse getStatistics() {
        List<FoodItem> allItems = foodRepository.findAll();
        LocalDate today = LocalDate.now();

        long safeCount = 0;
        long expiringSoonCount = 0;
        long expiredCount = 0;
        Map<String, Long> categoryCounts = new HashMap<>();

        for (FoodItem item : allItems) {
            String status = calculateExpiryStatus(item.getExpiryDate(), today);
            switch (status) {
                case STATUS_SAFE -> safeCount++;
                case STATUS_EXPIRING_SOON -> expiringSoonCount++;
                case STATUS_EXPIRED -> expiredCount++;
            }

            String cat = item.getCategory();
            categoryCounts.put(cat, categoryCounts.getOrDefault(cat, 0L) + 1);
        }

        return new FoodStatisticsResponse(
                allItems.size(),
                safeCount,
                expiringSoonCount,
                expiredCount,
                categoryCounts
        );
    }

    /**
     * Maps an entity to response DTO with dynamic expiry metrics.
     */
    public FoodItemResponse mapToResponse(FoodItem item) {
        LocalDate today = LocalDate.now();
        long remainingDays = ChronoUnit.DAYS.between(today, item.getExpiryDate());
        String status = calculateExpiryStatus(item.getExpiryDate(), today);

        return new FoodItemResponse(
                item.getId(),
                item.getName(),
                item.getCategory(),
                item.getQuantity(),
                item.getUnit(),
                item.getPurchaseDate(),
                item.getExpiryDate(),
                item.getNotes(),
                item.getCreatedAt(),
                remainingDays,
                status
        );
    }

    /**
     * Expiry status rules:
     * - Expired: expiry date is before today
     * - Expiring Soon: expiry date is within next 3 days, including today (0 to 3 days remaining)
     * - Safe: expiry date is more than 3 days away
     */
    public static String calculateExpiryStatus(LocalDate expiryDate, LocalDate today) {
        if (expiryDate.isBefore(today)) {
            return STATUS_EXPIRED;
        }
        long days = ChronoUnit.DAYS.between(today, expiryDate);
        if (days <= 3) {
            return STATUS_EXPIRING_SOON;
        }
        return STATUS_SAFE;
    }

    private void validateDates(LocalDate purchaseDate, LocalDate expiryDate) {
        if (expiryDate.isBefore(purchaseDate)) {
            throw new IllegalArgumentException("Expiry date cannot be before purchase date");
        }
    }
}
