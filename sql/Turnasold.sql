-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Generation Time: Apr 15, 2026 at 01:01 PM
-- Server version: 8.0.45
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Turnasold`
--

-- --------------------------------------------------------

--
-- Table structure for table `PRODUCT`
--

CREATE TABLE `PRODUCT` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `brand_id` int DEFAULT NULL,
  `product_type` varchar(50) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `location` varchar(50) DEFAULT NULL,
  `stock_quantity` int DEFAULT '1',
  `expiration` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `PRODUCT`
--

INSERT INTO `PRODUCT` (`id`, `name`, `brand_id`, `product_type`, `description`, `price`, `location`, `stock_quantity`, `expiration`) VALUES
(1, 'Anti-Aging Night Serum', 501, 'Cosmetic', 'Retinol based overnight repairing serum', 45.00, 'Istanbul', 60, '2027-10-15'),
(2, 'Paracetamol 500mg', 901, 'Medicine', 'Pain reliever and fever reducer tablets', 4.50, 'Ankara', 250, '2028-05-20'),
(3, 'Hydrating Face Wash', 502, 'Cosmetic', 'Gentle cleanser for sensitive skin', 18.00, 'Izmir', 85, '2027-01-10'),
(4, 'Amoxicillin Antibiotic', 902, 'Medicine', 'Broad spectrum antibiotic 500mg capsules', 12.00, 'Bursa', 40, '2026-12-30'),
(5, 'Matte Red Lipstick', 503, 'Cosmetic', 'Long lasting waterproof matte finish', 15.00, 'Antalya', 120, '2029-06-01'),
(6, 'Vitamin C 1000mg', 903, 'Medicine', 'Effervescent immune support tablets', 9.90, 'Adana', 180, '2027-08-15'),
(7, 'Sunscreeen SPF 50+', 504, 'Cosmetic', 'High protection UVA/UVB face cream', 24.50, 'Mugla', 75, '2026-09-20'),
(8, 'Ibuprofen 400mg', 904, 'Medicine', 'Non-steroidal anti-inflammatory drug', 6.20, 'Konya', 150, '2028-02-14'),
(9, 'Volume Lift Mascara', 505, 'Cosmetic', 'Thickening black mascara for eyelashes', 12.99, 'Gaziantep', 95, '2028-11-11'),
(10, 'Cough Syrup 150ml', 905, 'Medicine', 'Expectorant syrup for chesty cough', 8.50, 'Kayseri', 55, '2027-04-30'),
(11, 'Organic Argan Hair Oil', 506, 'Cosmetic', 'Nourishing oil for dry and damaged hair', 32.00, 'Mersin', 40, '2029-12-31'),
(12, 'Antacid Liquid 200ml', 906, 'Medicine', 'Rapid relief for heartburn and indigestion', 7.40, 'Eskisehir', 65, '2027-03-12'),
(13, 'Hyaluronic Acid Serum', 501, 'Cosmetic', 'Plumping serum for deep hydration', 38.00, 'Istanbul', 50, '2027-05-25'),
(14, 'Allergy Relief 10mg', 907, 'Medicine', 'Antihistamine tablets for hay fever', 11.00, 'Samsun', 100, '2028-09-01'),
(15, 'Liquid Foundation Honey', 507, 'Cosmetic', 'Full coverage natural glow foundation', 29.00, 'Denizli', 30, '2028-10-10'),
(16, 'Multivitamin Complex', 903, 'Medicine', 'Daily vitamins and minerals for adults', 22.00, 'Sanliurfa', 85, '2027-11-20'),
(17, 'Deep Cleansing Toner', 508, 'Cosmetic', 'Pore minimizing alcohol-free toner', 14.50, 'Malatya', 60, '2027-06-15'),
(18, 'Aspirin 100mg', 908, 'Medicine', 'Low dose aspirin for heart health', 5.00, 'Kahramanmaras', 200, '2028-12-01'),
(19, 'Eye Contour Cream', 509, 'Cosmetic', 'Reduces dark circles and puffiness', 26.00, 'Erzurum', 45, '2027-02-28'),
(20, 'Nasal Decongestant Spray', 909, 'Medicine', 'Fast relief for blocked nose', 9.50, 'Van', 110, '2026-11-15'),
(21, 'Rosewater Facial Mist', 510, 'Cosmetic', 'Natural refreshing rosewater spray', 10.00, 'Isparta', 140, '2027-08-08'),
(22, 'Hydrocortisone Ointment', 910, 'Medicine', 'Anti-itch and rash relief cream', 13.50, 'Batman', 40, '2026-12-20'),
(23, 'Shimmer Highlighter', 503, 'Cosmetic', 'Champagne glow powder for cheeks', 19.00, 'Istanbul', 55, '2029-01-01'),
(24, 'Vitamin D3 Drops', 903, 'Medicine', 'Liquid sunshine for bone health', 15.50, 'Ankara', 120, '2027-10-30'),
(25, 'Peeling Gel Exfoliator', 502, 'Cosmetic', 'Dead skin removal smoothing gel', 21.00, 'Izmir', 65, '2028-04-12'),
(26, 'Diabetes Support Tablets', 911, 'Medicine', 'Herbal supplement for sugar balance', 35.00, 'Balikesir', 25, '2026-07-01'),
(27, 'Hand and Nail Cream', 511, 'Cosmetic', 'Intensive repair for dry hands', 7.50, 'Kocaeli', 180, '2027-09-09'),
(28, 'Burn Relief Gel', 912, 'Medicine', 'Cooling gel for minor burns', 10.20, 'Tekirdag', 35, '2027-01-30'),
(29, 'Velvet Lip Liner', 503, 'Cosmetic', 'Precise contouring lip pencil', 8.90, 'Aydin', 90, '2028-03-03'),
(30, 'Probiotic 5B CFU', 913, 'Medicine', 'Digestive system health capsules', 28.00, 'Bolu', 50, '2026-10-15'),
(31, 'Charcoal Face Mask', 512, 'Cosmetic', 'Detoxifying clay mask for oily skin', 16.00, 'Manisa', 75, '2027-12-31'),
(32, 'Eye Drops Lubicant', 914, 'Medicine', 'Sterile drops for dry eyes', 14.00, 'Canakkale', 80, '2026-05-05'),
(33, 'Beard Growth Oil', 513, 'Cosmetic', 'Sandalwood scented grooming oil', 20.00, 'Diyarbakir', 40, '2028-07-20'),
(34, 'Antiseptic Solution 100ml', 915, 'Medicine', 'For wound cleaning and hygiene', 6.00, 'Afyonkarahisar', 150, '2028-02-02'),
(35, 'Nail Polish Nude', 514, 'Cosmetic', 'Quick dry long lasting lacquer', 5.50, 'Kutahya', 200, '2030-01-01'),
(36, 'Throat Lozenges 24ct', 916, 'Medicine', 'Menthol honey soothing lozenges', 7.00, 'Sivas', 130, '2026-12-12'),
(37, 'Hair Repairing Mask', 506, 'Cosmetic', 'Deep conditioning keratin treatment', 22.50, 'Trabzon', 50, '2027-09-15'),
(38, 'B-Complex Capsules', 903, 'Medicine', 'Energy metabolism support vitamins', 19.50, 'Rize', 95, '2027-06-30'),
(39, 'Setting Spray Matte', 503, 'Cosmetic', 'Finish spray to lock makeup', 14.00, 'Ankara', 110, '2028-05-05'),
(40, 'Calcium + Magnesium', 903, 'Medicine', 'Mineral support for bone density', 17.00, 'Corum', 70, '2027-03-25'),
(41, 'Eyeliner Gel Black', 505, 'Cosmetic', 'Ultra-precise waterproof eyeliner', 11.00, 'Istanbul', 100, '2028-10-20'),
(42, 'Omega 3 Fish Oil', 917, 'Medicine', 'High EPA/DHA heart health capsules', 30.00, 'Zonguldak', 45, '2026-08-30'),
(43, 'Body Lotion Lavender', 511, 'Cosmetic', 'Soothing floral scented moisturizer', 13.00, 'Yalova', 80, '2027-04-10'),
(44, 'Iron Supplement 25mg', 903, 'Medicine', 'Gentle iron for blood health', 16.50, 'Tokat', 65, '2027-11-15'),
(45, 'Concealer Stick Light', 507, 'Cosmetic', 'Covers blemishes and imperfections', 15.50, 'Osmaniye', 55, '2028-02-28'),
(46, 'Sleep Aid Melatonin', 918, 'Medicine', 'Natural sleep support tablets', 23.00, 'Kirikkale', 40, '2026-10-10'),
(47, 'Blush Palette 3 Colors', 503, 'Cosmetic', 'Powder blush for natural radiance', 21.00, 'Istanbul', 35, '2029-05-05'),
(48, 'Zinc Ointment 50g', 919, 'Medicine', 'Protective barrier cream for skin', 9.00, 'Cankiri', 85, '2027-01-01'),
(49, 'Cleansing Balm', 502, 'Cosmetic', 'Oil-to-milk makeup remover', 27.00, 'Amasya', 42, '2028-06-18'),
(50, 'Digital Thermometer', 920, 'Medicine', 'Instant read clinical thermometer', 12.50, 'Usak', 30, '2035-12-31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `PRODUCT`
--
ALTER TABLE `PRODUCT`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `PRODUCT`
--
ALTER TABLE `PRODUCT`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
