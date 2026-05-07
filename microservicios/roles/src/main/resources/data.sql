-- Seed: crear admin inicial si no existe
-- Contraseña: admin123
INSERT INTO users (username, email, password, full_name, role, active, created_at, updated_at)
SELECT 'admin', 'admin@techfix.cl', 'admin123', 'Administrador TechFix', 'ADMIN', true, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'ADMIN'
);
