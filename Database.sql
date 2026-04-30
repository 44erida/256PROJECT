-- Drop tables in correct order because of foreign keys
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS consumer_profiles;
DROP TABLE IF EXISTS market_profiles;
DROP TABLE IF EXISTS users;

-- Common login table for both market users and consumers
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,

    -- Used for login and must be unique
    email VARCHAR(100) NOT NULL UNIQUE,

    -- Store hashed password, never plain text password
    password_hash VARCHAR(255) NOT NULL,

    -- Defines what type of user this account is
    role ENUM('market', 'consumer') NOT NULL,

    -- Used for email confirmation
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6),
    verification_expires_at DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extra information only for market users
CREATE TABLE market_profiles (
    market_id INT AUTO_INCREMENT PRIMARY KEY,

    -- Connects this market profile to one user account
    user_id INT NOT NULL UNIQUE,

    market_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- Extra information only for consumer users
CREATE TABLE consumer_profiles (
    consumer_id INT AUTO_INCREMENT PRIMARY KEY,

    -- Connects this consumer profile to one user account
    user_id INT NOT NULL UNIQUE,

    full_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- Products added by market users
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,

    -- Shows which market owns this product
    market_id INT NOT NULL,

    title VARCHAR(100) NOT NULL,
    stock INT NOT NULL,
    normal_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2) NOT NULL,
    expiration_date DATE NOT NULL,

    -- Stores the path of the uploaded image, not the image itself
    image_path VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (market_id) REFERENCES market_profiles(market_id)
        ON DELETE CASCADE
);

-- One cart belongs to one consumer
CREATE TABLE carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,

    consumer_id INT NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (consumer_id) REFERENCES consumer_profiles(consumer_id)
        ON DELETE CASCADE
);

-- Products inside a consumer's cart
CREATE TABLE cart_items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,

    cart_id INT NOT NULL,
    product_id INT NOT NULL,

    -- Quantity selected by the consumer
    quantity INT NOT NULL DEFAULT 1,

    FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE,

    -- Prevents the same product from being duplicated inside the same cart
    UNIQUE (cart_id, product_id)
);