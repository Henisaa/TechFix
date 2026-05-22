INSERT INTO users (username, email, password, full_name, role, active, created_at, updated_at)
SELECT 'admin', 'admin@techfix.cl', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL9hXkum', 'Administrador TechFix', 'ADMIN', true, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'ADMIN'
);
