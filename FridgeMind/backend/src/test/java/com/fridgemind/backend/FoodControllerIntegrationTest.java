package com.fridgemind.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fridgemind.backend.dto.FoodItemRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FoodControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateAndRetrieveFood() throws Exception {
        LocalDate now = LocalDate.now();
        FoodItemRequest req = new FoodItemRequest(
                "Fresh Strawberries", "Fruits", 2.0, "boxes",
                now, now.plusDays(4), "Sweet and ripe"
        );

        mockMvc.perform(post("/api/foods")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Fresh Strawberries"))
                .andExpect(jsonPath("$.expiryStatus").value("SAFE"));

        mockMvc.perform(get("/api/foods"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testGetStatistics() throws Exception {
        mockMvc.perform(get("/api/foods/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").isNumber());
    }
}
