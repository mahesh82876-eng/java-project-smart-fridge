package com.fridgemind.backend.config;

import com.fridgemind.backend.entity.FoodItem;
import com.fridgemind.backend.repository.FoodRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Initializes demonstration data if the food database is empty.
 * Dates are calculated dynamically relative to the current date
 * so that tests and demonstrations always show realistic expiry categories.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final FoodRepository foodRepository;

    public DataInitializer(FoodRepository foodRepository) {
        this.foodRepository = foodRepository;
    }

    @Override
    public void run(String... args) {
        if (foodRepository.count() == 0) {
            log.info("Populating initial demonstration data with relative dates...");
            LocalDate today = LocalDate.now();

            List<FoodItem> samples = Arrays.asList(
                    // 1. Banana: Fruits, 6 pieces, expiry in 2 days (EXPIRING SOON)
                    new FoodItem("Banana", "Fruits", 6.0, "pieces",
                            today.minusDays(3), today.plusDays(2), "Ripe, best eaten soon"),

                    // 2. Milk: Dairy, 1 litre, expiry tomorrow (EXPIRING SOON)
                    new FoodItem("Whole Milk", "Dairy", 1.0, "litre",
                            today.minusDays(5), today.plusDays(1), "Keep chilled in main door rack"),

                    // 3. Apple: Fruits, 4 pieces, expiry in 7 days (SAFE)
                    new FoodItem("Fuji Apple", "Fruits", 4.0, "pieces",
                            today.minusDays(1), today.plusDays(7), "Crisp sweet apples"),

                    // 4. Carrot: Vegetables, 500 grams, expired yesterday (EXPIRED)
                    new FoodItem("Baby Carrots", "Vegetables", 500.0, "grams",
                            today.minusDays(10), today.minusDays(1), "Organic baby carrots"),

                    // 5. Chicken Breast: Meat, 1.2 kg, expiry in 3 days (EXPIRING SOON)
                    new FoodItem("Chicken Breast", "Meat", 1.2, "kg",
                            today.minusDays(2), today.plusDays(3), "Fresh poultry for dinner"),

                    // 6. Cheddar Cheese: Dairy, 250 grams, expiry in 14 days (SAFE)
                    new FoodItem("Cheddar Cheese Block", "Dairy", 250.0, "grams",
                            today.minusDays(4), today.plusDays(14), "Sharp aged cheddar"),

                    // 7. Spinach: Vegetables, 300 grams, expiry in 4 days (SAFE)
                    new FoodItem("Fresh Spinach", "Vegetables", 300.0, "grams",
                            today.minusDays(1), today.plusDays(4), "Crisp leaves for salad"),

                    // 8. Greek Yogurt: Dairy, 400 grams, expired 2 days ago (EXPIRED)
                    new FoodItem("Greek Yogurt", "Dairy", 400.0, "grams",
                            today.minusDays(8), today.minusDays(2), "Strawberry flavor"),

                    // 9. Orange Juice: Beverages, 1.5 litres, expiry in 6 days (SAFE)
                    new FoodItem("Orange Juice", "Beverages", 1.5, "litres",
                            today.minusDays(2), today.plusDays(6), "Pulp-free 100% juice"),

                    // 10. Almond Snack Mix: Snacks, 200 grams, expiry in 25 days (SAFE)
                    new FoodItem("Almond & Cranberry Mix", "Snacks", 200.0, "grams",
                            today.minusDays(5), today.plusDays(25), "High-protein snack pack")
            );

            foodRepository.saveAll(samples);
            log.info("Initialized {} sample food items successfully.", samples.size());
        } else {
            log.info("Database already contains {} food items. Skipping initial seeding.", foodRepository.count());
        }
    }
}
