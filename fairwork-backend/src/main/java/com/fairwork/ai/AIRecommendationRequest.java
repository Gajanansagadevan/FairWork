package com.fairwork.ai;

public class AIRecommendationRequest {

    private String shiftId;
    private String date;

    public AIRecommendationRequest() {
    }

    public AIRecommendationRequest(String shiftId, String date) {
        this.shiftId = shiftId;
        this.date = date;
    }

    public String getShiftId() {
        return shiftId;
    }

    public void setShiftId(String shiftId) {
        this.shiftId = shiftId;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}