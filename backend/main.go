package main

import (
	"log"
	"os"

	"geo-tracker-backend/config"
	"geo-tracker-backend/controllers"
	"geo-tracker-backend/models"
	"geo-tracker-backend/repositories"
	"geo-tracker-backend/routes"
	"geo-tracker-backend/services"

	"github.com/joho/godotenv"
)

func main() {
	// 1. Muat environment variable dari .env
	if err := godotenv.Load(); err != nil {
		log.Println("Pemberitahuan: File .env tidak ditemukan, menggunakan environment variables default/sistem.")
	}

	// 2. Hubungkan ke database MySQL
	config.ConnectDatabase()

	// 3. Auto-Migrate schema database (membuat tabel jika belum ada)
	err := config.DB.AutoMigrate(&models.Location{})
	if err != nil {
		log.Fatalf("Gagal melakukan auto-migrate database: %v", err)
	}
	log.Println("Database migration selesai (tabel locations siap digunakan).")

	// 4. Inisialisasi Dependency Injection (Layered Architecture)
	locationRepo := repositories.NewLocationRepository(config.DB)
	locationService := services.NewLocationService(locationRepo)
	locationController := controllers.NewLocationController(locationService)

	// 5. Inisialisasi Gin router
	r := routes.SetupRouter(locationController)

	// 6. Jalankan Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Backend server berjalan di http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
