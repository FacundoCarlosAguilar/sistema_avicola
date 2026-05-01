-- DATOS INICIALES - SISTEMA AVÍCOLA

USE u481307435_sistema_av;

-- 1. Insertar fases de consumo
INSERT INTO fases_consumo (edad_desde, edad_hasta, consumo_gramos, descripcion) VALUES
(1, 10, 50, 'Fase de iniciación - Preinicio'),
(11, 20, 100, 'Fase de crecimiento - Inicio'),
(21, 30, 180, 'Fase de desarrollo - Engorde'),
(31, 40, 200, 'Fase de finalización - Terminación'),
(41, 50, 180, 'Fase de salida - Retiro');

-- 2. Insertar usuario administrador (supervisor)
-- Contraseña temporal: admin123
-- (Luego se debe hashear con bcrypt)
INSERT INTO usuarios (nombre, usuario, password_hash, perfil) VALUES
('Administrador', 'admin', 'admin123', 'supervisor');

-- 3. Insertar empresa de ejemplo
INSERT INTO empresas (nombre, ruc, activo) VALUES
('ARGEAVE S.A.', '30-12345678-9', 1);

-- 4. Insertar dueño de ejemplo
INSERT INTO duenos (nombre, telefono, email, id_empresa) VALUES
('Juan Pérez', '0991234567', 'juan.perez@argeave.com', 1);

-- 5. Insertar granja de ejemplo
INSERT INTO granjas (nombre, ubicacion, id_dueno) VALUES
('Granja Norte', 'Ruta 5 Km 12, Departamento Central', 1),
('Granja Sur', 'Ruta 1 Km 45, Departamento Ñeembucú', 1);

-- 6. Insertar galpones de ejemplo
INSERT INTO galpones (nombre, capacidad, id_granja) VALUES
('Galpón A - Pollos', 10000, 1),
('Galpón B - Pollos', 10000, 1),
('Galpón C - Pollos', 8000, 1),
('Galpón A - Pollos', 12000, 2),
('Galpón B - Pollos', 12000, 2);

-- 7. Insertar usuarios granjeros de ejemplo
INSERT INTO usuarios (nombre, usuario, password_hash, perfil, id_granja_asignada) VALUES
('Pedro López', 'pedro', 'pedro123', 'granjero', 1),
('Carlos Martínez', 'carlos', 'carlos123', 'granjero', 2);

-- 8. Insertar lotes de ejemplo
INSERT INTO lotes (fecha_ingreso, cantidad_aves, proveedor, id_galpon) VALUES
(CURDATE() - INTERVAL 25 DAY, 10000, 'Avícola Don Juan', 1),
(CURDATE() - INTERVAL 15 DAY, 10000, 'Avícola Don Juan', 2),
(CURDATE() - INTERVAL 10 DAY, 8000, 'Avícola San José', 3),
(CURDATE() - INTERVAL 30 DAY, 12000, 'Avícola Don Juan', 4);


-- 9. Insertar controles diarios de ejemplo
-- Para el lote 1 (25 días de edad)
INSERT INTO control_diario (fecha, mortandad, aves_vivas, alimento_kg, id_lote) VALUES
(CURDATE() - INTERVAL 25 DAY, 0, 10000, 0, 1),
(CURDATE() - INTERVAL 24 DAY, 2, 9998, 500, 1),
(CURDATE() - INTERVAL 23 DAY, 1, 9997, 520, 1),
(CURDATE() - INTERVAL 22 DAY, 3, 9994, 540, 1),
(CURDATE() - INTERVAL 21 DAY, 0, 9994, 560, 1),
(CURDATE() - INTERVAL 20 DAY, 2, 9992, 800, 1),
(CURDATE() - INTERVAL 19 DAY, 1, 9991, 820, 1),
(CURDATE() - INTERVAL 15 DAY, 3, 9988, 900, 1),
(CURDATE() - INTERVAL 10 DAY, 2, 9986, 1000, 1),
(CURDATE() - INTERVAL 5 DAY, 4, 9982, 1200, 1),
(CURDATE() - INTERVAL 1 DAY, 2, 9980, 1400, 1);

-- Actualizar aves_vivas en lotes
UPDATE lotes SET cantidad_aves = 9980 WHERE id = 1;

-- 10. Insertar pesajes de ejemplo
INSERT INTO pesajes (fecha_pesaje, peso_promedio, muestras, id_lote) VALUES
(CURDATE() - INTERVAL 21 DAY, 350, 100, 1),
(CURDATE() - INTERVAL 14 DAY, 800, 100, 1),
(CURDATE() - INTERVAL 7 DAY, 1450, 100, 1),
(CURDATE() - INTERVAL 0 DAY, 2100, 100, 1);

-- 11. Insertar sanidad de ejemplo
INSERT INTO sanidad (fecha, tipo, producto, dosis, observaciones, id_lote) VALUES
(CURDATE() - INTERVAL 20 DAY, 'vacuna', 'Newcastle', '0.5ml', 'Aplicación en agua de bebida', 1),
(CURDATE() - INTERVAL 15 DAY, 'vacuna', 'Gumboro', '0.3ml', 'Aplicación individual', 1),
(CURDATE() - INTERVAL 10 DAY, 'medicamento', 'Antibiótico', '1ml/L', 'Tratamiento por 5 días', 1);