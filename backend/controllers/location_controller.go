package controllers

import (
	"net/http"
	"strconv"

	"geo-tracker-backend/models"
	"geo-tracker-backend/services"

	"github.com/gin-gonic/gin"
)

type LocationController struct {
	service services.LocationService
}

func NewLocationController(service services.LocationService) *LocationController {
	return &LocationController{service: service}
}

// CreateLocation handles POST /api/locations (dikirim oleh sensor/ESP32)
func (c *LocationController) CreateLocation(ctx *gin.Context) {
	var input models.Location
	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Payload JSON tidak valid: " + err.Error(),
		})
		return
	}

	if err := c.service.SaveLocation(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Data lokasi berhasil disimpan",
		"data":    input,
	})
}

// GetLocations handles GET /api/locations?limit=100&device_id=ESP32-01
func (c *LocationController) GetLocations(ctx *gin.Context) {
	limitStr := ctx.DefaultQuery("limit", "100")
	limit, _ := strconv.Atoi(limitStr)
	deviceID := ctx.Query("device_id")

	var locations []models.Location
	var err error

	if deviceID != "" {
		locations, err = c.service.GetLocationsByDevice(deviceID, limit)
	} else {
		locations, err = c.service.GetAllLocations(limit)
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal mengambil riwayat lokasi",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status": "success",
		"total":  len(locations),
		"data":   locations,
	})
}

// GetLatestLocation handles GET /api/locations/latest?device_id=ESP32-01
func (c *LocationController) GetLatestLocation(ctx *gin.Context) {
	deviceID := ctx.Query("device_id")
	if deviceID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Query parameter 'device_id' wajib diisi",
		})
		return
	}

	location, err := c.service.GetLatestLocation(deviceID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Data lokasi terkini tidak ditemukan untuk device: " + deviceID,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   location,
	})
}

// GetLatestAllDevices handles GET /api/devices/latest (menampilkan marker terkini semua device)
func (c *LocationController) GetLatestAllDevices(ctx *gin.Context) {
	locations, err := c.service.GetLatestAllDevices()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal mengambil lokasi device terkini",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status": "success",
		"total":  len(locations),
		"data":   locations,
	})
}
