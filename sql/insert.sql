USE questboard;

INSERT INTO users (email, username, password_hash, avatar, signup_avatar, xp, coins, theme_bg, level)
VALUES
("yasir.rausheil@hotmail.com", "yasirho", "dummyhash", "avatar1.png", "avatar1.png", 423, 1645, NULL, 5);

INSERT INTO shop_items (name, image, price) VALUES
('Avatar 1', 'shop1.jpg', 10),
('Avatar 2', 'shop2.jpg', 15),
('Avatar 3', 'shop3.jpg', 50),
('Background 1', 'shop4.jpg', 20),
('Background 2', 'shop5.jpg', 30),
('Background 3', 'shop6.jpg', 60);

INSERT INTO badges (badge_key, label, image) VALUES
('daily_3', 'Daily', 'badges/daily.png'),
('weekly_3', 'Weekly', 'badges/weekly.png');
