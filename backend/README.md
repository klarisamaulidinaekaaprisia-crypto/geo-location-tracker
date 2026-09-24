# Geo Tracker Backend (Golang + Gin + MariaDB / MySQL)

Backend RESTful API menggunakan framework **Gin** dan ORM **GORM** dengan arsitektur bersih (**Layered Architecture**: Controller -> Service -> Repository -> MariaDB/MySQL).

Proyek ini dirancang untuk menerima data koordinat geografis (latitude, longitude, kecepatan, dll.) dari sensor fisik (seperti GPS NEO-6M + ESP32/NodeMCU) dan menyediakannya untuk frontend peta (React/Leaflet).

---

## 📁 Struktur Folder

```text
backend/
├── config/
│   └── database.go          # Koneksi database MariaDB / MySQL dengan GORM
├── controllers/
│   └── location_controller.go # Handler HTTP Gin (Request & Response)
├── models/
│   └── location.go          # Struct model data lokasi & GORM tag
├── repositories/
│   └── location_repository.go # Akses database MariaDB / MySQL
├── routes/
│   └── routes.go            # Pengaturan rute API & middleware CORS
├── services/
│   └── location_service.go  # Logika bisnis & validasi koordinat
├── .env                     # Konfigurasi environment (port, db creds)
├── .env.example             # Template konfigurasi
├── go.mod                   # Daftar dependencies Go
├── main.go                  # Entry point aplikasi
└── README.md                # Dokumentasi backend
```

---

## ⚙️ Persiapan & Instalasi

### 1. Buat Database MariaDB / MySQL
Pastikan server MariaDB / MySQL (XAMPP / Laragon / Docker / native MariaDB service) sudah menyala:
```sql
CREATE DATABASE geo_tracker;
```

### 2. Atur File `.env`
Salin template `.env.example` ke `.env`, lalu sesuaikan kredensial MariaDB Anda:
```env
PORT=8080
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=password_mariadb_anda
DB_NAME=geo_tracker
```

### 3. Unduh Dependencies & Jalankan Server
Buka terminal di dalam folder `backend`:
```bash
cd backend
go mod tidy
go run main.go
```
Jika berhasil, terminal akan menampilkan:
```text
Berhasil terhubung ke database MariaDB/MySQL!
Database migration selesai (tabel locations siap digunakan).
Backend server berjalan di http://localhost:8080
```

---

## 📡 Daftar Endpoint API

### 1. Simpan Data Lokasi Baru (Untuk Sensor Fisik / ESP32)
* **URL:** `POST /api/locations`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "device_id": "ESP32-GPS-01",
  "latitude": -7.250445,
  "longitude": 112.768845,
  "altitude": 15.5,
  "speed": 22.4,
  "satellites": 8
}
```
* **Response (201 Created):**
```json
{
  "status": "success",
  "message": "Data lokasi berhasil disimpan",
  "data": {
    "id": 1,
    "device_id": "ESP32-GPS-01",
    "latitude": -7.250445,
    "longitude": 112.768845,
    "altitude": 15.5,
    "speed": 22.4,
    "satellites": 8,
    "created_at": "2026-09-24T14:00:00Z"
  }
}
```

---

### 2. Ambil Riwayat Lokasi (Untuk Jalur/Rute di Peta Frontend)
* **URL:** `GET /api/locations`
* **Query Parameters (Opsional):**
  * `limit` (default: 100)
  * `device_id` (filter berdasarkan ID device tertentu)
* **Contoh:** `GET http://localhost:8080/api/locations?limit=50&device_id=ESP32-GPS-01`
* **Response (200 OK):**
```json
{
  "status": "success",
  "total": 1,
  "data": [
    {
      "id": 1,
      "device_id": "ESP32-GPS-01",
      "latitude": -7.250445,
      "longitude": 112.768845,
      "altitude": 15.5,
      "speed": 22.4,
      "satellites": 8,
      "created_at": "2026-09-24T14:00:00Z"
    }
  ]
}
```

---

### 3. Ambil Lokasi Terkini Device Tertentu (Untuk Marker Real-time)
* **URL:** `GET /api/locations/latest?device_id=ESP32-GPS-01`
* **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "device_id": "ESP32-GPS-01",
    "latitude": -7.250445,
    "longitude": 112.768845,
    "altitude": 15.5,
    "speed": 22.4,
    "satellites": 8,
    "created_at": "2026-09-24T14:00:00Z"
  }
}
```

---

### 4. Ambil Lokasi Terkini Semua Device Aktif
* **URL:** `GET /api/devices/latest`
* **Response (200 OK):** Menghasilkan posisi terakhir dari setiap `device_id` yang berbeda untuk ditampilkan sekaligus pada peta.

---

## 🧪 Contoh Pengujian Cepat dengan cURL

```bash
# Test simpan lokasi
curl -X POST http://localhost:8080/api/locations \
  -H "Content-Type: application/json" \
  -d "{\"device_id\":\"ESP32-01\",\"latitude\":-7.2504,\"longitude\":112.7688,\"speed\":15.2}"

# Test ambil riwayat
curl http://localhost:8080/api/locations

# Test ambil posisi terbaru device
curl "http://localhost:8080/api/locations/latest?device_id=ESP32-01"
```
