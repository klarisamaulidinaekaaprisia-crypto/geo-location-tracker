package services

import (
	"errors"
	"geo-tracker-backend/models"
	"geo-tracker-backend/repositories"
)

type LocationService interface {
	SaveLocation(location *models.Location) error
	GetAllLocations(limit int) ([]models.Location, error)
	GetLocationsByDevice(deviceID string, limit int) ([]models.Location, error)
	GetLatestLocation(deviceID string) (*models.Location, error)
	GetLatestAllDevices() ([]models.Location, error)
}

type locationService struct {
	repo repositories.LocationRepository
}

func NewLocationService(repo repositories.LocationRepository) LocationService {
	return &locationService{repo: repo}
}

func (s *locationService) SaveLocation(location *models.Location) error {
	// Validasi nilai koordinat realistis
	if location.Latitude < -90.0 || location.Latitude > 90.0 {
		return errors.New("latitude tidak valid: harus berada di antara -90 dan 90")
	}
	if location.Longitude < -180.0 || location.Longitude > 180.0 {
		return errors.New("longitude tidak valid: harus berada di antara -180 dan 180")
	}
	if location.DeviceID == "" {
		return errors.New("device_id tidak boleh kosong")
	}

	return s.repo.Create(location)
}

func (s *locationService) GetAllLocations(limit int) ([]models.Location, error) {
	if limit <= 0 || limit > 1000 {
		limit = 100
	}
	return s.repo.FindAll(limit)
}

func (s *locationService) GetLocationsByDevice(deviceID string, limit int) ([]models.Location, error) {
	if limit <= 0 || limit > 1000 {
		limit = 100
	}
	return s.repo.FindByDevice(deviceID, limit)
}

func (s *locationService) GetLatestLocation(deviceID string) (*models.Location, error) {
	if deviceID == "" {
		return nil, errors.New("device_id diperlukan")
	}
	return s.repo.FindLatestByDevice(deviceID)
}

func (s *locationService) GetLatestAllDevices() ([]models.Location, error) {
	return s.repo.FindLatestAllDevices()
}
