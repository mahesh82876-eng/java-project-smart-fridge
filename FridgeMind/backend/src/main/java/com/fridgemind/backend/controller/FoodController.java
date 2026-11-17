package com.fridgemind.backend.controller;

import com.fridgemind.backend.dto.FoodItemRequest;
import com.fridgemind.backend.dto.FoodItemResponse;
import com.fridgemind.backend.dto.FoodStatisticsResponse;
import com.fridgemind.backend.service.FoodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "*")
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    /**
     * 1. Add food item
     * POST /api/foods
     */
    @PostMapping
    public ResponseEntity<FoodItemResponse> addFood(@Valid @RequestBody FoodItemRequest request) {
        FoodItemResponse created = foodService.addFood(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * 2. Get all food items
     * GET /api/foods
     */
    @GetMapping
    public ResponseEntity<List<FoodItemResponse>> getAllFoods() {
        return ResponseEntity.ok(foodService.getAllFoods());
    }

    /**
     * 3. Get food item by ID
     * GET /api/foods/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<FoodItemResponse> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    /**
     * 4. Update food item
     * PUT /api/foods/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<FoodItemResponse> updateFood(@PathVariable Long id,
                                                       @Valid @RequestBody FoodItemRequest request) {
        return ResponseEntity.ok(foodService.updateFood(id, request));
    }

    /**
     * 5. Delete food item
     * DELETE /api/foods/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFood(@PathVariable Long id) {
        foodService.deleteFood(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 6. Search food by name
     * GET /api/foods/search?name=banana
     */
    @GetMapping("/search")
    public ResponseEntity<List<FoodItemResponse>> searchFood(@RequestParam(required = false) String name) {
        return ResponseEntity.ok(foodService.searchByName(name));
    }

    /**
     * 7. Filter food by category
     * GET /api/foods/category/{category}
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<FoodItemResponse>> filterByCategory(@PathVariable String category) {
        return ResponseEntity.ok(foodService.filterByCategory(category));
    }

    /**
     * 8. Get expiring soon items
     * GET /api/foods/expiring-soon
     */
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<FoodItemResponse>> getExpiringSoon() {
        return ResponseEntity.ok(foodService.getExpiringSoon());
    }

    /**
     * 9. Get expired items
     * GET /api/foods/expired
     */
    @GetMapping("/expired")
    public ResponseEntity<List<FoodItemResponse>> getExpired() {
        return ResponseEntity.ok(foodService.getExpired());
    }

    /**
     * 10. Get dashboard statistics
     * GET /api/foods/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<FoodStatisticsResponse> getStatistics() {
        return ResponseEntity.ok(foodService.getStatistics());
    }
}
