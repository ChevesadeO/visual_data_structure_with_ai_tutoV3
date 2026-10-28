<?php
// Copia este archivo como config.php y completa tus datos. NO subas config.php a GitHub.
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_contraseña');
define('DB_NAME', 'tu_base_de_datos');
define('DB_CHARSET', 'utf8mb4');

// Clave del panel de administración: usa una larga y única.
define('ADMIN_KEY', 'cambia-esta-clave');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

// Tutor IA: clave de la API de Anthropic (console.anthropic.com). Vive solo en el servidor.
define('ANTHROPIC_API_KEY', 'sk-ant-...');
define('TUTOR_MODEL', 'claude-haiku-5-5');
define('TUTOR_MAX_POR_HORA', 20); // límite por IP para controlar costos
