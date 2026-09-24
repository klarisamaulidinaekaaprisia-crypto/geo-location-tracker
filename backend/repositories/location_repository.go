package repositories

import (
	"geo-tracker-backend/models"

	"gorm.io/gorm"
)

type LocationRepository interface {
	Create(location *models.Location) error
	FindAll(limit int) ([]models.Location, error)
	FindByDevice(deviceID string, limit int) ([]models.Location, error)
	FindLatestByDevice(deviceID string) (*models.Location, error)
	FindLatestAllDevices() ([]models.Location, error)
}

type locationRepository struct {
	db *gorm.DB
}

func NewLocationRepository(db *gorm.DB) LocationRepository {
	return &locationRepository{db: db}
}

func (r *locationRepository) Create(location *models.Location) error {
	return r.db.Create(location).Error
}

func (r *locationRepository) FindAll(limit int) ([]models.Location, error) {
	var locations []models.Location
	err := r.db.Order("created_at DESC").Limit(limit).Find(&locations).Error
	return locations, err
}

func (r *locationRepository) FindByDevice(deviceID string, limit int) ([]models.Location, error) {
	var locations []models.Location
	err := r.db.Where("device_id = ?", deviceID).Order("created_at DESC").Limit(limit).Find(&locations).Error
	return locations, err
}

func (r *locationRepository) FindLatestByDevice(deviceID string) (*models.Location, error) {
	var location models.Location
	err := r.db.Where("device_id = ?", deviceID).Order("created_at DESC").First(&location).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

func (r *locationRepository) FindLatestAllDevices() ([]models.Location, error) {
	// Query subquery to get the latest record for each distinct device_id
	var locations []models.Location
	subQuery := r.db.Table("locations").
		Select("MAX(id) as id").
		Group("device_id")

	err := r.db.Where("id IN (?)", subQuery).Find(&locations).Error
	return locations, err
}
