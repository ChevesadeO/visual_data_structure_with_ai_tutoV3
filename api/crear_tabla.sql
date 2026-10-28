-- ══════════════════════════════════════════════════════════
-- Visual Data Structure — JIC 2026
-- Script para crear la tabla de evaluaciones en MySQL
-- Ejecutar en phpMyAdmin sobre la base de datos:
-- if0_41630466_db_congreso
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS evaluaciones (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora       DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Datos del participante
    carrera          VARCHAR(150) NOT NULL,
    anio             VARCHAR(50)  NOT NULL,
    cursado          VARCHAR(100) NOT NULL,

    -- Resultados de conocimiento
    pretest_score    TINYINT UNSIGNED NOT NULL DEFAULT 0,
    postest_score    TINYINT UNSIGNED NOT NULL DEFAULT 0,
    mejora           TINYINT          NOT NULL DEFAULT 0,
    total_preguntas  TINYINT UNSIGNED NOT NULL DEFAULT 5,

    -- Resultados SUS
    sus_score        DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    sus_categoria    VARCHAR(50)  NOT NULL DEFAULT '',
    sus_respuestas   VARCHAR(255) NOT NULL DEFAULT '',  -- "3,4,5,2,4,3,5,2,4,3"

    -- Preguntas abiertas
    open_gusto       TEXT,
    open_mejora      TEXT,
    usaria_app       VARCHAR(50),

    -- Tiempos
    tiempo_inicio    DATETIME,
    tiempo_fin       DATETIME,

    -- Metadata
    ip_cliente       VARCHAR(45),
    user_agent       VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
