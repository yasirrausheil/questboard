DROP DATABASE IF EXISTS questboard;
CREATE DATABASE questboard;
USE questboard;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(100) NOT NULL,
    signup_avatar VARCHAR(100) NOT NULL DEFAULT 'avatar1.png',   
    xp INT NOT NULL DEFAULT 0,
    coins INT NOT NULL DEFAULT 0,
    theme_bg VARCHAR(100) DEFAULT NULL,
    level INT NOT NULL DEFAULT 1,
    general_streak INT NOT NULL DEFAULT 0,
    daily_streak INT NOT NULL DEFAULT 0,
    weekly_streak INT NOT NULL DEFAULT 0,
    last_completed DATE DEFAULT NULL,
    daily_count INT NOT NULL DEFAULT 0,
    weekly_count INT NOT NULL DEFAULT 0
);

CREATE TABLE quests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL,
    due_at DATE NOT NULL,
    created_at DATETIME,
    completed_at DATETIME,
    is_done TINYINT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE shop_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image VARCHAR(100) NOT NULL,
    price INT NOT NULL
);

CREATE TABLE user_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES shop_items(id)
);

CREATE TABLE badges (
  badge_key VARCHAR(50) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  image VARCHAR(100) NOT NULL
);

CREATE TABLE user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_key VARCHAR(50) NOT NULL,
    awarded_at DATETIME NOT NULL,
    UNIQUE KEY uniq_user_badge (user_id, badge_key),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
