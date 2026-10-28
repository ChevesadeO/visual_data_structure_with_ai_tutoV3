<?php
// ══════════════════════════════════════════════════════════
// Visual Data Structure — Obtener resultados (admin)
// GET /api/obtener_resultados.php?key=VDS_JIC2026_admin
// ══════════════════════════════════════════════════════════

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

// Verificar clave de administración
$key = $_GET['key'] ?? '';
if ($key !== ADMIN_KEY) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'Acceso no autorizado']);
    exit;
}

try {
    $db = getDB();

    // ── Listado completo de evaluaciones ─────────────────
    $stmt = $db->query("
        SELECT id, fecha_hora, carrera, anio, cursado,
               pretest_score, postest_score, mejora, total_preguntas,
               sus_score, sus_categoria,
               usaria_app, open_gusto, open_mejora
        FROM evaluaciones
        ORDER BY fecha_hora DESC
    ");
    $filas = $stmt->fetchAll();

    // ── Estadísticas globales ─────────────────────────────
    $stats = $db->query("
        SELECT
            COUNT(*)              AS total,
            ROUND(AVG(sus_score),2) AS sus_promedio,
            MIN(sus_score)          AS sus_min,
            MAX(sus_score)          AS sus_max,
            ROUND(AVG(pretest_score),2)  AS pre_promedio,
            ROUND(AVG(postest_score),2)  AS post_promedio,
            ROUND(AVG(mejora),2)         AS mejora_promedio,
            SUM(CASE WHEN mejora > 0  THEN 1 ELSE 0 END) AS mejoraron,
            SUM(CASE WHEN usaria_app = 'si' THEN 1 ELSE 0 END) AS usarian_si
        FROM evaluaciones
    ")->fetch();

    // ── Distribución por categoría SUS ───────────────────
    $dist = $db->query("
        SELECT sus_categoria, COUNT(*) AS total
        FROM evaluaciones
        GROUP BY sus_categoria
        ORDER BY COUNT(*) DESC
    ")->fetchAll();

    echo json_encode([
        'ok'           => true,
        'total'        => (int)$stats['total'],
        'stats'        => $stats,
        'distribucion' => $dist,
        'evaluaciones' => $filas,
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
