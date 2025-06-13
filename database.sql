-- 1. Buat database baru (jika belum ada)
CREATE DATABASE IF NOT EXISTS wa_gateway 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. Gunakan database
USE wa_gateway;

-- 3. Hapus tabel yang sudah ada (jika diperlukan)
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS WAConnections;
DROP TABLE IF EXISTS Sunscreen;
DROP TABLE IF EXISTS Shopsign;
DROP TABLE IF EXISTS Mitra;
DROP TABLE IF EXISTS Users;

-- 4. Buat tabel Users
CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('administrator', 'admin', 'user') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Buat tabel WAConnections
CREATE TABLE WAConnections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phoneNumber VARCHAR(20) NOT NULL UNIQUE,
  status ENUM('connected', 'disconnected', 'authenticating') DEFAULT 'disconnected',
  qrCode TEXT,
  sessionData TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Buat tabel Messages dengan nama kolom yang lebih aman
CREATE TABLE Messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_number VARCHAR(20) NOT NULL,
  receiver_number VARCHAR(20) NOT NULL,
  body TEXT NOT NULL,
  mediaUrl VARCHAR(255),
  isGroup BOOLEAN DEFAULT false,
  status ENUM('received', 'sent', 'pending', 'failed') DEFAULT 'received',
  processed BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sender (sender_number),
  INDEX idx_receiver (receiver_number),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- 7. Buat tabel Sunscreen
CREATE TABLE Sunscreen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  sender VARCHAR(100) NOT NULL,
  amount INT NOT NULL,
  mediaUrl VARCHAR(255),
  googleDriveUrl VARCHAR(255),
  keterangan TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_sender (sender)
) ENGINE=InnoDB;

-- 8. Buat tabel Shopsign
CREATE TABLE Shopsign (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  sender VARCHAR(100) NOT NULL,
  amount INT NOT NULL,
  mediaUrl VARCHAR(255),
  googleDriveUrl VARCHAR(255),
  keterangan TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_sender (sender)
) ENGINE=InnoDB;

-- 9. Buat tabel Mitra
CREATE TABLE Mitra (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  sender VARCHAR(100) NOT NULL,
  amount INT NOT NULL,
  mediaUrl VARCHAR(255),
  googleDriveUrl VARCHAR(255),
  keterangan TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_sender (sender)
) ENGINE=InnoDB;

-- 10. Tambahkan user admin default (opsional)
INSERT INTO Users (username, password, role) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQRbjQ3G7cfRkd5n0RNDJ5YhLYUy.Nq', 'administrator');
