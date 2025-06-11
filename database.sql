CREATE DATABASE wa_gateway;
USE wa_gateway;

-- Tabel Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('administrator', 'admin', 'user') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel WhatsApp Connections
CREATE TABLE wa_connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    session_name VARCHAR(100) NOT NULL,
    status ENUM('connected', 'disconnected', 'pending') DEFAULT 'pending',
    last_connection TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Messages
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wa_connection_id INT,
    message_id VARCHAR(100),
    sender VARCHAR(20) NOT NULL,
    receiver VARCHAR(20) NOT NULL,
    message_type ENUM('text', 'image', 'video', 'document', 'other') NOT NULL,
    message_text TEXT,
    media_url VARCHAR(255),
    group_name VARCHAR(100),
    is_group BOOLEAN DEFAULT FALSE,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wa_connection_id) REFERENCES wa_connections(id)
);

-- Tabel SUNSCREEN
CREATE TABLE sunscreen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT,
    kode VARCHAR(50) NOT NULL,
    nomor_pengirim VARCHAR(20) NOT NULL,
    aml VARCHAR(10),
    jumlah INT,
    media_path VARCHAR(255),
    gdrive_url VARCHAR(255),
    keterangan TEXT,
    status ENUM('processed', 'pending', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id)
);

-- Tabel SHOPSIGN (struktur sama dengan SUNSCREEN)
CREATE TABLE shopsign (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT,
    kode VARCHAR(50) NOT NULL,
    nomor_pengirim VARCHAR(20) NOT NULL,
    aml VARCHAR(10),
    jumlah INT,
    media_path VARCHAR(255),
    gdrive_url VARCHAR(255),
    keterangan TEXT,
    status ENUM('processed', 'pending', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id)
);

-- Tabel MITRA (struktur sama dengan SUNSCREEN)
CREATE TABLE mitra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT,
    kode VARCHAR(50) NOT NULL,
    nomor_pengirim VARCHAR(20) NOT NULL,
    aml VARCHAR(10),
    jumlah INT,
    media_path VARCHAR(255),
    gdrive_url VARCHAR(255),
    keterangan TEXT,
    status ENUM('processed', 'pending', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id)
);

-- Tabel CONTACTS
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    group_name VARCHAR(100),
    last_contact TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel AUTO_REPLIES
CREATE TABLE auto_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trigger_keyword VARCHAR(50) NOT NULL,
    reply_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
