#!/usr/bin/env php
<?php
/**
 * Database schema verification script.
 * Run from app root: php verify_schema.php
 * Or: php artisan tinker < (paste the commands below)
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;

echo "=== Schema verification ===\n\n";

echo "1. class_sessions columns:\n";
$columns = Schema::getColumnListing('class_sessions');
if ($columns === null || $columns === false) {
    echo "   (table may not exist or connection failed)\n";
} else {
    foreach ($columns as $col) {
        echo "   - {$col}\n";
    }
    echo "   Total: " . count($columns) . " columns\n";
}

echo "\n2. tutors table exists: ";
$hasTutors = Schema::hasTable('tutors');
echo $hasTutors ? "true" : "false";
echo "\n";

echo "\nDone.\n";
