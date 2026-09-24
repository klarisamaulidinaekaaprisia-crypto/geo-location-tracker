package models

import "time"

type Location struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	DeviceID   string    `gorm:"type:varchar(50);index;not null" json:"device_id" binding:"required"`
	Latitude   float64   `gorm:"type:double;not null" json:"latitude" binding:"required"`
	Longitude  float64   `gorm:"type:double;not null" json:"longitude" binding:"required"`
	Altitude   float64   `gorm:"type:double" json:"altitude"`
	Speed      float32   `json:"speed"`
	Satellites int       `json:"satellites"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
}
