package com.fridgemind.backend;

import com.fridgemind.backend.dto.FoodItemRequest;
import com.fridgemind.backend.dto.FoodItemResponse;
import com.fridgemind.backend.dto.FoodStatisticsResponse;
import com.fridgemind.backend.entity.FoodItem;
import com.fridgemind.backend.exception.ResourceNotFoundException;
import com.fridgemind.backend.repository.FoodRepository;
import com.fridgemind.backend.service.FoodService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FoodServiceTest {

    @Mock
    private FoodRepository foodRepository;

    @InjectMocks
    private FoodService foodService;

    private LocalDate today;

    @BeforeEach
    void setUp() {
        today = LocalDate.now();
    }

    @Test
    @DisplayName("Should add food item successfully when valid")
    void testAddFoodSuccess() {
        FoodItemRequest request = new FoodItemRequest("Banana", "Fruits", 6.0, "pieces",
                today.minusDays(2), today.plusDays(2), "Ripe");

        FoodItem savedEntity = new FoodItem("Banana", "Fruits", 6.0, "pieces",
                today.minusDays(2), today.plusDays(2), "Ripe");
        savedEntity.setId(1L);

        when(foodRepository.save(any(FoodItem.class))).thenReturn(savedEntity);

        FoodItemResponse response = foodService.addFood(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Banana", response.getName());
        assertEquals("EXPIRING_SOON", response.getExpiryStatus());
        assertEquals(2, response.getRemainingDays());
        verify(foodRepository, times(1)).save(any(FoodItem.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when expiry date is before purchase date")
    void testAddFoodInvalidDates() {
        FoodItemRequest request = new FoodItemRequest("Milk", "Dairy", 1.0, "litre",
                today, today.minusDays(1), "Invalid date");

        assertThrows(IllegalArgumentException.class, () -> foodService.addFood(request));
        verify(foodRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should calculate correct expiry status categories")
    void testCalculateExpiryStatus() {
        // Expired (yesterday)
        assertEquals("EXPIRED", FoodService.calculateExpiryStatus(today.minusDays(1), today));

        // Expiring Soon (today = 0 days remaining)
        assertEquals("EXPIRING_SOON", FoodService.calculateExpiryStatus(today, today));

        // Expiring Soon (in 3 days)
        assertEquals("EXPIRING_SOON", FoodService.calculateExpiryStatus(today.plusDays(3), today));

        // Safe (in 4 days)
        assertEquals("SAFE", FoodService.calculateExpiryStatus(today.plusDays(4), today));

        // Safe (in 15 days)
        assertEquals("SAFE", FoodService.calculateExpiryStatus(today.plusDays(15), today));
    }

    @Test
    @DisplayName("Should retrieve all food items sorted by expiry date")
    void testGetAllFoods() {
        FoodItem item1 = new FoodItem("Apple", "Fruits", 4.0, "pieces", today, today.plusDays(7), null);
        item1.setId(1L);
        FoodItem item2 = new FoodItem("Milk", "Dairy", 1.0, "litre", today, today.plusDays(1), null);
        item2.setId(2L);

        when(foodRepository.findAll()).thenReturn(Arrays.asList(item1, item2));

        List<FoodItemResponse> results = foodService.getAllFoods();

        assertEquals(2, results.size());
        assertEquals("Milk", results.get(0).getName()); // earlier expiry date comes first
        assertEquals("Apple", results.get(1).getName());
    }

    @Test
    @DisplayName("Should retrieve food by ID or throw exception if not found")
    void testGetFoodById() {
        FoodItem item = new FoodItem("Carrot", "Vegetables", 500.0, "grams", today, today.plusDays(5), null);
        item.setId(10L);

        when(foodRepository.findById(10L)).thenReturn(Optional.of(item));
        when(foodRepository.findById(99L)).thenReturn(Optional.empty());

        FoodItemResponse found = foodService.getFoodById(10L);
        assertNotNull(found);
        assertEquals("Carrot", found.getName());

        assertThrows(ResourceNotFoundException.class, () -> foodService.getFoodById(99L));
    }

    @Test
    @DisplayName("Should update existing food item")
    void testUpdateFood() {
        FoodItem existing = new FoodItem("Old Name", "Dairy", 1.0, "litre", today.minusDays(1), today.plusDays(5), "Note");
        existing.setId(5L);

        FoodItemRequest updateRequest = new FoodItemRequest("New Name", "Dairy", 2.0, "litre",
                today.minusDays(1), today.plusDays(5), "Updated note");

        when(foodRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(foodRepository.save(any(FoodItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FoodItemResponse updated = foodService.updateFood(5L, updateRequest);

        assertEquals("New Name", updated.getName());
        assertEquals(2.0, updated.getQuantity());
        assertEquals("Updated note", updated.getNotes());
    }

    @Test
    @DisplayName("Should delete food item when exists or throw if not found")
    void testDeleteFood() {
        when(foodRepository.existsById(5L)).thenReturn(true);
        when(foodRepository.existsById(99L)).thenReturn(false);

        assertDoesNotThrow(() -> foodService.deleteFood(5L));
        verify(foodRepository, times(1)).deleteById(5L);

        assertThrows(ResourceNotFoundException.class, () -> foodService.deleteFood(99L));
    }

    @Test
    @DisplayName("Should calculate statistics accurately across categories and status")
    void testGetStatistics() {
        FoodItem safe = new FoodItem("Apples", "Fruits", 4.0, "pieces", today, today.plusDays(10), null);
        FoodItem soon = new FoodItem("Bananas", "Fruits", 3.0, "pieces", today, today.plusDays(2), null);
        FoodItem expired = new FoodItem("Old Milk", "Dairy", 1.0, "litre", today.minusDays(10), today.minusDays(2), null);

        when(foodRepository.findAll()).thenReturn(Arrays.asList(safe, soon, expired));

        FoodStatisticsResponse stats = foodService.getStatistics();

        assertEquals(3, stats.getTotalItems());
        assertEquals(1, stats.getSafeItems());
        assertEquals(1, stats.getExpiringSoonItems());
        assertEquals(1, stats.getExpiredItems());
        assertEquals(2, stats.getCategoryCounts().get("Fruits"));
        assertEquals(1, stats.getCategoryCounts().get("Dairy"));
    }
}
