<?php
// ══════════════════════════════════════════════════════════
// Visual Data Structure — Guardar evaluación SUS
// Método: POST  |  Content-Type: application/json
// ══════════════════════════════════════════════════════════

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responder preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

require_once __DIR__ . '/config.php';

// ── Leer el body JSON ─────────────────────────────────────
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'JSON inválido']);
    exit;
}

// ── Función de sanitización ───────────────────────────────
function clean(?string $val, int $max = 255): string {
    if ($val === null) return '';
    return substr(strip_tags(trim($val)), 0, $max);
}

function cleanInt($val, int $min = 0, int $max = 100): int {
    return max($min, min($max, (int)$val));
}

// ── Extraer y validar campos ──────────────────────────────
$carrera       = clean($data['carrera'] ?? '');
$anio          = clean($data['anio'] ?? '');
$cursado       = clean($data['cursado'] ?? '');
$pretestScore  = cleanInt($data['pretest_score']  ?? 0, 0, 10);
$postestScore  = cleanInt($data['postest_score']  ?? 0, 0, 10);
$mejora        = cleanInt($data['mejora']         ?? 0, -10, 10);
$totalPx       = cleanInt($data['total_preguntas'] ?? 5, 1, 20);
$susScore      = round((float)($data['sus_score'] ?? 0), 2);
$susCategoria  = clean($data['sus_categoria'] ?? '');
$susRespuestas = clean($data['sus_respuestas'] ?? '');
$openGusto     = clean($data['open_gusto']  ?? '', 1000);
$openMejora    = clean($data['open_mejora'] ?? '', 1000);
$usariaApp     = clean($data['usaria_app']  ?? '');
$tiempoInicio  = clean($data['tiempo_inicio'] ?? '');
$tiempoFin     = clean($data['tiempo_fin']   ?? '');

if (!$carrera || !$anio || !$cursado) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Faltan campos obligatorios']);
    exit;
}

// ── Parsear fechas ────────────────────────────────────────
function parseDateTime(string $iso): ?string {
    $dt = DateTime::createFromFormat('Y-m-d\TH:i:s.v\Z', $iso)
       ?? DateTime::createFromFormat('Y-m-d\TH:i:s\Z', $iso)
       ?? DateTime::createFromFormat('Y-m-d\TH:i:s', $iso);
    return $dt ? $dt->format('Y-m-d H:i:s') : null;
}

$dtInicio = parseDateTime($tiempoInicio);
$dtFin    = parseDateTime($tiempoFin);
$ipCliente = $_SERVER['HTTP_X_FORWARDED_FOR']
          ?? $_SERVER['REMOTE_ADDR']
          ?? '';
$userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

// ── Insertar en la base de datos ──────────────────────────
try {
    $db  = getDB();
    $sql = "
        INSERT INTO evaluaciones
            (carrera, anio, cursado,
             pretest_score, postest_score, mejora, total_preguntas,
             sus_score, sus_categoria, sus_respuestas,
             open_gusto, open_mejora, usaria_app,
             tiempo_inicio, tiempo_fin,
             ip_cliente, user_agent)
        VALUES
            (:carrera, :anio, :cursado,
             :pre, :post, :mejora, :total,
             :sus, :sus_cat, :sus_resp,
             :gusto, :mejora_txt, :usaria,
             :t_ini, :t_fin,
             :ip, :ua)
    ";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':carrera'   => $carrera,
        ':anio'      => $anio,
        ':cursado'   => $cursado,
        ':pre'       => $pretestScore,
        ':post'      => $postestScore,
        ':mejora'    => $mejora,
        ':total'     => $totalPx,
        ':sus'       => $susScore,
        ':sus_cat'   => $susCategoria,
        ':sus_resp'  => $susRespuestas,
        ':gusto'     => $openGusto,
        ':mejora_txt'=> $openMejora,
        ':usaria'    => $usariaApp,
        ':t_ini'     => $dtInicio,
        ':t_fin'     => $dtFin,
        ':ip'        => $ipCliente,
        ':ua'        => $userAgent,
    ]);

    $id = $db->lastInsertId();
    echo json_encode([
        'ok'  => true,
        'id'  => $id,
        'msg' => 'Evaluación guardada correctamente'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'ok'    => false,
        'error' => 'Error de base de datos: ' . $e->getMessage()
    ]);
}
