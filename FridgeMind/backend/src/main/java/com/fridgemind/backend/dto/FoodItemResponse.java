package com.fridgemind.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class FoodItemResponse {

    private Long id;
    private String name;
    private String category;
    private Double quantity;
    private String unit;
    private LocalDate purchaseDate;
    private LocalDate expiryDate;
    private String notes;
    private LocalDateTime createdAt;
    private long remainingDays;
    private String expiryStatus; // SAFE, EXPIRING_SOON, EXPIRED

    public FoodItemResponse() {
    }

    public FoodItemResponse(Long id, String name, String category, Double quantity, String unit,
                            LocalDate purchaseDate, LocalDate expiryDate, String notes,
                            LocalDateTime createdAt, long remainingDays, String expiryStatus) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.quantity = quantity;
        this.unit = unit;
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
        this.notes = notes;
        this.createdAt = createdAt;
        this.remainingDays = remainingDays;
        this.expiryStatus = expiryStatus;
    }

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

    public long getRemainingDays() {
        return remainingDays;
    }

    public void setRemainingDays(long remainingDays) {
        this.remainingDays = remainingDays;
    }

    public String getExpiryStatus() {
        return expiryStatus;
    }

    public void setExpiryStatus(String expiryStatus) {
        this.expiryStatus = expiryStatus;
    }
}
