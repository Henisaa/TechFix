
INSERT INTO categories (id, name, description, active, created_at, updated_at) VALUES
(1, 'Smartphones', 'Repuestos para dispositivos móviles y smartphones', true, NOW(), NOW()),
(2, 'Componentes PC', 'Piezas y componentes para armar o reparar PCs', true, NOW(), NOW()),
(3, 'Accesorios', 'Accesorios varios', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;


SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));


INSERT INTO products (sku, name, description, brand, model, cost_price, sale_price, quantity_in_stock, min_stock_level, max_stock_level, status, category_id, barcode, location, image_url, notes, created_at, updated_at) VALUES
('BAT-SAM-A54', 'Batería Original Samsung Galaxy A54', 'Batería de repuesto original de 5000 mAh para Samsung Galaxy A54 5G.', 'Samsung', 'A54 5G', 15000.00, 35000.00, 50, 5, 100, 'ACTIVE', 1, '123456789001', 'Estante A1', '/imgrepuestos/bateriasamsunga54.png', 'Requiere instalación profesional.', NOW(), NOW()),
('PANT-IPH-13', 'Pantalla OLED iPhone 13', 'Pantalla Super Retina XDR OLED de 6.1 pulgadas de repuesto para iPhone 13.', 'Apple', 'iPhone 13', 45000.00, 120000.00, 15, 3, 30, 'ACTIVE', 1, '123456789002', 'Estante A2', '/imgrepuestos/pantallaiphone13.jpg', 'Compatible solo con modelo estándar.', NOW(), NOW()),
('RAM-DDR4-16GB-3200', 'Memoria RAM DDR4 16GB 3200MHz Kingston Fury Beast', 'Módulo de memoria RAM Kingston Fury Beast DDR4 de 16GB a 3200MHz.', 'Kingston', 'Fury Beast', 22000.00, 48000.00, 30, 5, 80, 'ACTIVE', 2, '123456789003', 'Estante B1', '/imgrepuestos/ramddr416gb3200mhzkingston.jpg', 'Garantía de por vida.', NOW(), NOW()),
('COOL-NOCT-NHU12S', 'Cooler CPU Noctua NH-U12S', 'Disipador de CPU de alto rendimiento Noctua NH-U12S con ventilador NF-F12 de 120mm.', 'Noctua', 'NH-U12S', 35000.00, 75000.00, 10, 2, 25, 'ACTIVE', 2, '123456789004', 'Estante B2', '/imgrepuestos/coolercpunoctuanh-u12s.jpg', 'Incluye pasta térmica NT-H1.', NOW(), NOW()),
('GPU-RTX-3060', 'Tarjeta Gráfica GeForce RTX 3060 12GB', 'Tarjeta de video NVIDIA GeForce RTX 3060 de 12GB GDDR6.', 'NVIDIA', 'RTX 3060', 250000.00, 360000.00, 8, 2, 15, 'ACTIVE', 2, '123456789005', 'Vitrina C1', '/imgrepuestos/rtx3060.jpg', 'Ideal para gaming a 1080p.', NOW(), NOW())
ON CONFLICT (sku) DO NOTHING;


SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
