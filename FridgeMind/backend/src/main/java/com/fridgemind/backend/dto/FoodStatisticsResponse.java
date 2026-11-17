package com.fridgemind.backend.dto;

import java.util.Map;

public class FoodStatisticsResponse {

    private long totalItems;
    private long safeItems;
    private long expiringSoonItems;
    private long expiredItems;
    private Map<String, Long> categoryCounts;

    public FoodStatisticsResponse() {
    }

    public FoodStatisticsResponse(long totalItems, long safeItems, long expiringSoonItems,
                                  long expiredItems, Map<String, Long> categoryCounts) {
        this.totalItems = totalItems;
        this.safeItems = safeItems;
        this.expiringSoonItems = expiringSoonItems;
        this.expiredItems = expiredItems;
        this.categoryCounts = categoryCounts;
    }

    public long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(long totalItems) {
        this.totalItems = totalItems;
    }

    public long getSafeItems() {
        return safeItems;
    }

    public void setSafeItems(long safeItems) {
        this.safeItems = safeItems;
    }

    public long getExpiringSoonItems() {
        return expiringSoonItems;
    }

    public void setExpiringSoonItems(long expiringSoonItems) {
        this.expiringSoonItems = expiringSoonItems;
    }

    public long getExpiredItems() {
        return expiredItems;
    }

    public void setExpiredItems(long expiredItems) {
        this.expiredItems = expiredItems;
    }

    public Map<String, Long> getCategoryCounts() {
        return categoryCounts;
    }

    public void setCategoryCounts(Map<String, Long> categoryCounts) {
        this.categoryCounts = categoryCounts;
    }
}
