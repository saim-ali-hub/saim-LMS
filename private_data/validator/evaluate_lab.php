<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: text/plain");

session_start();
session_write_close();

require_once "/var/www/html/config/ldap.php";
require_once "/var/www/html/config/vcenter.php";
require_once "/var/www/html/config/functions.php";

/* =========================
   1. READ INPUT
========================= */
$rawInput = file_get_contents("php://input");

$input = json_decode($rawInput, true);

if (!$input) {
    http_response_code(400);
    die("Invalid JSON input");
}

/* =========================
   2. GET LAB (SAFE)
========================= */
$lab = basename($input['lab'] ?? '', ".json");

if (!$lab) {
    http_response_code(400);
    die("Missing lab");
}

/* =========================
   3. GET USER, vm and IP
========================= */
if (!isset($_SESSION["user"])) {
    http_response_code(401);
    exit("Not logged in");
}

$username = $_SESSION["user"];

$session = vcenterLogin();

if (!$session) {
    die("Unable to login to vCenter");
}

$vmName = getVmName($username);

$vmId = getVmID($session, $vmName);

if (!$vmId) {
    die("VM not found");
}

$ip = getGuestIP($session, $vmId);

if (!$ip) {
    die("Guest IP not available");
}
/* =========================
   4. VALIDATION
========================= */
if (!preg_match('/^lab[0-9]+$/', $lab)) {
    die("Invalid lab format");
}

/* system user block */
$blocked_users = ['root','apache','nginx','mysql','bin','daemon'];

if (in_array($username, $blocked_users, true)) {
    die("System user not allowed");
}

/* =========================
   7. SAFE LOGGING (NO RAW INPUT DUMP)
========================= */
$logFile = "/var/www/private_data/lab/results/debug.log";

file_put_contents(
    $logFile,
    date("Y-m-d H:i:s") . " USER=$username LAB=$lab\n",
    FILE_APPEND | LOCK_EX
);

/* =========================
   8. SAFE EXECUTION (NO SHELL INJECTION)
========================= */
$script = "/var/www/private_data/lab/validate_lab.sh";

$cmd = [
    "sudo",
    "-n",
    "-u",
    "apache",
    "/usr/bin/bash",
    $script,
    $username,
    $ip,
    $lab
];

$escaped = array_map("escapeshellarg", $cmd);

exec(implode(" ", $escaped) . " 2>&1", $output, $status);

/* ==========================
   9. RETURN EXECUTION STATUS
=========================== */
if ($status !== 0) {
    http_response_code(500);
}

/* =========================
   10. OUTPUT
========================= */
echo implode("\n", $output);

?>
