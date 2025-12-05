#!/usr/bin/env php
<?php
/**
 * Strauss wrapper that runs in WSL environment to avoid Windows path issues
 */

$project_dir = realpath(__DIR__ . '/..');
$wsl_path = '/mnt/c/' . str_replace('\\', '/', substr($project_dir, 3));

// Try to run in WSL first
if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    echo "Running Strauss in WSL environment...\n";
    $command = sprintf(
        'wsl bash -c "cd %s && php bin/strauss.phar"',
        escapeshellarg($wsl_path)
    );

    passthru($command, $return_code);
    exit($return_code);
} else {
    // Already in Linux/WSL, run directly
    echo "Running Strauss directly...\n";
    $command = 'php ' . escapeshellarg(__DIR__ . '/strauss.phar');
    passthru($command, $return_code);
    exit($return_code);
}
