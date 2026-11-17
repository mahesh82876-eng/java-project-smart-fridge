package com.fridgemind.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class FoodItemRequest {

    @NotBlank(message = "Food name cannot be empty")
    private String name;

    @NotBlank(message = "Category cannot be empty")
    private String category;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Double quantity;

    @NotBlank(message = "Unit cannot be empty")
    private String unit;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    private String notes;

    public FoodItemRequest() {
    }

    public FoodItemRequest(String name, String category, Double quantity, String unit,
                           LocalDate purchaseDate, LocalDate expiryDate, String notes) {
        this.name = name;
        this.category = category;
        this.quantity = quantity;
        this.unit = unit;
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
        this.notes = notes;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
