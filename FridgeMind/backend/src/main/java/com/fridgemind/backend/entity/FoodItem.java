package com.fridgemind.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * FoodItem Entity representing stored refrigerator inventory.
 * Stores core persisted fields; dynamic values (remaining days, expiry status)
 * are calculated on demand in the service layer.
 */
@Entity
@Table(name = "food_items")
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Food name cannot be empty")
    @Column(nullable = false, length = 120)
    private String name;

    @NotBlank(message = "Category cannot be empty")
    @Column(nullable = false, length = 50)
    private String category;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    @Column(nullable = false)
    private Double quantity;

    @NotBlank(message = "Unit cannot be empty")
    @Column(nullable = false, length = 30)
    private String unit;

    @NotNull(message = "Purchase date is required")
    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @NotNull(message = "Expiry date is required")
    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public FoodItem() {
    }

    public FoodItem(String name, String category, Double quantity, String unit,
                    LocalDate purchaseDate, LocalDate expiryDate, String notes) {
        this.name = name;
        this.category = category;
        this.quantity = quantity;
        this.unit = unit;
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
