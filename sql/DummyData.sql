-- Inserting Dummy data to the data base

-- Dummy users (note that the password_hash is random son impossible to access)
INSERT INTO users (email, password_hash, role, is_verified)
VALUES
('smith@gmail.com', '$2b$10$abc123xyz456hash0001', 'consumer', FALSE),
('john@gmail.com',  '$2b$10$def456uvw789hash0002', 'consumer', FALSE),
('maria@gmail.com', '$2b$10$ghi789rst012hash0003', 'consumer', FALSE),
('alex@gmail.com',  '$2b$10$jkl012opq345hash0004', 'consumer', FALSE),
('linda@gmail.com', '$2b$10$mno345lmn678hash0005', 'consumer', FALSE);

INSERT INTO consumer_profiles (user_id, full_name, city, district)
VALUES
(1, 'Smith', 'Ankara', 'Çankaya'),
(2, 'John', 'İstanbul', 'Kadıköy'),
(3, 'Maria', 'İzmir', 'Konak'),
(4, 'Alex', 'Ankara', 'Yenimahalle'),
(5, 'Linda', 'Bursa', 'Nilüfer');

-- Dummy markets (note that the password_hash is random son impossible to access)
INSERT INTO users (email, password_hash, role, is_verified)
VALUES
('getir@gmail.com',    '$2b$10$aaa111bbb222hash0006', 'market', FALSE),
('watsons@gmail.com',  '$2b$10$ccc333ddd444hash0007', 'market', FALSE),
('carrefour@gmail.com','$2b$10$eee555fff666hash0008', 'market', FALSE),
('migros@gmail.com',   '$2b$10$ggg777hhh888hash0009', 'market', FALSE),
('a101@gmail.com',     '$2b$10$iii999jjj000hash0010', 'market', FALSE);

INSERT INTO market_profiles (user_id, market_name, city, district)
VALUES
(6,  'Getir',     'Ankara',   'Çankaya'),
(7,  'Watsons',   'İstanbul', 'Kadıköy'),
(8,  'Carrefour', 'İzmir',    'Konak'),
(9,  'Migros',    'Ankara',   'Yenimahalle'),
(10, 'A101',      'Bursa',    'Nilüfer');

-- Product insertion
INSERT INTO products 
(market_id, title, stock, normal_price, discounted_price, expiration_date, image_path)
VALUES
(1, 'Maybelline Lipstick Nude', 12, 249.99, 149.99, '2026-05-07', '/images/makeup/indir (1).webp'),
(1, 'Nivea Face Cream 100ml', 8, 179.99, 99.99, '2026-05-10', '/images/makeup/indir (2).webp'),

(2, 'Watsons Vitamin C Serum', 10, 329.99, 199.99, '2026-05-12', '/images/makeup/indir (3).webp'),
(2, 'Hand Sanitizer 250ml', 25, 89.99, 49.99, '2026-05-06', '/images/makeup/indir (4).webp'),

(3, 'Pain Relief Gel 50g', 15, 159.99, 89.99, '2026-05-14', '/images/makeup/indir (5).webp'),
(3, 'Sunscreen SPF 50', 7, 399.99, 249.99, '2026-05-16', '/images/makeup/indir (6).webp'),

(4, 'Charlotte Tilbury Iconic Nude', 5, 699.99, 449.99, '2026-05-11', '/images/makeup/charlotte tilbury iconic nude.webp'),
(4, 'Herbal Cough Syrup', 9, 129.99, 79.99, '2026-05-09', '/images/makeup/indir (7).webp'),

(5, 'Moisturizing Lotion 200ml', 11, 219.99, 139.99, '2026-05-15', '/images/makeup/indir (8).webp'),
(5, 'Multivitamin Tablets', 6, 299.99, 179.99, '2026-05-18', '/images/makeup/indir (9).webp');