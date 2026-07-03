<?php
$line = trim(file_get_contents(__DIR__ . '/_scrypt-test.txt'));
$parts = explode(':', $line, 3);
$salt = base64_decode($parts[1], true);
$expected = base64_decode($parts[2], true);
$actual = hash('scrypt', 'test', true, [
    'salt' => $salt,
    'memory_cost' => 16384,
    'time_cost' => 8,
    'threads' => 1,
]);
echo hash_equals($expected, $actual) ? "OK\n" : "FAIL actual=" . strlen($actual) . "\n";
