package routes

import (
	"net/http"
	"time"

	"geo-tracker-backend/controllers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(locationController *controllers.LocationController) *gin.Engine {
	r := gin.Default()

	// Setup CORS agar bisa diakses oleh frontend (React, Vite, Lovable, Leaflet)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Healthcheck endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Geo Location Tracker Backend is running",
			"time":    time.Now(),
		})
	})

	api := r.Group("/api")
	{
		// Endpoints untuk data lokasi
		api.POST("/locations", locationController.CreateLocation)
		api.GET("/locations", locationController.GetLocations)
		api.GET("/locations/latest", locationController.GetLatestLocation)
		api.GET("/devices/latest", locationController.GetLatestAllDevices)
	}

	return r
}
