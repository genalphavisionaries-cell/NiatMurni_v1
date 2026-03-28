<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    private const STATUS_VALUES = [
        'pending_review',
        'active',
        'suspended',
        'inactive',
        'rejected',
    ];

    public function up(): void
    {
        if (! Schema::hasTable('tutors')) {
            Schema::create('tutors', function (Blueprint $table) {
                $table->id();
                $table->string('tutor_code', 8)->unique();
                $table->string('full_name');
                $table->string('identity_no');
                $table->string('phone');
                $table->string('email')->unique();
                $table->string('password');
                $table->text('address')->nullable();
                $table->string('profile_photo_url')->nullable();
                $table->string('kkm_cert_no')->nullable();
                $table->text('bio')->nullable();
                $table->string('bank_name')->nullable();
                $table->string('bank_account_no')->nullable();
                $table->string('bank_account_name')->nullable();
                $table->string('emergency_contact')->nullable();
                $table->enum('status', self::STATUS_VALUES)->default('pending_review');
                $table->timestamp('approved_at')->nullable();
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });

            return;
        }

        Schema::table('tutors', function (Blueprint $table) {
            if (! Schema::hasColumn('tutors', 'tutor_code')) {
                $table->string('tutor_code', 8)->nullable()->after('id');
            }
            if (! Schema::hasColumn('tutors', 'full_name')) {
                $table->string('full_name')->nullable()->after('tutor_code');
            }
            if (! Schema::hasColumn('tutors', 'identity_no')) {
                $table->string('identity_no')->nullable()->after('full_name');
            }
            if (! Schema::hasColumn('tutors', 'phone')) {
                $table->string('phone')->nullable()->after('identity_no');
            }
            if (! Schema::hasColumn('tutors', 'email')) {
                $table->string('email')->nullable()->after('phone');
            }
            if (! Schema::hasColumn('tutors', 'password')) {
                $table->string('password')->nullable()->after('email');
            }
            if (! Schema::hasColumn('tutors', 'address')) {
                $table->text('address')->nullable()->after('password');
            }
            if (! Schema::hasColumn('tutors', 'profile_photo_url')) {
                $table->string('profile_photo_url')->nullable()->after('address');
            }
            if (! Schema::hasColumn('tutors', 'kkm_cert_no')) {
                $table->string('kkm_cert_no')->nullable()->after('profile_photo_url');
            }
            if (! Schema::hasColumn('tutors', 'bank_account_no')) {
                $table->string('bank_account_no')->nullable()->after('bank_name');
            }
            if (! Schema::hasColumn('tutors', 'emergency_contact')) {
                $table->string('emergency_contact')->nullable()->after('bank_account_name');
            }
            if (! Schema::hasColumn('tutors', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('status');
            }
            if (! Schema::hasColumn('tutors', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
            }
        });

        $this->makeLegacyUserIdOptional();
        $this->backfillStandaloneFields();
        $this->normalizeStatus();
        $this->backfillTutorCodes();
        $this->ensureUniqueIndexes();
    }

    public function down(): void
    {
        // Intentionally no-op.
        // This migration upgrades an existing production table in-place and
        // should not blindly remove columns on rollback.
    }

    private function backfillStandaloneFields(): void
    {
        if (Schema::hasColumn('tutors', 'bank_account_no') && Schema::hasColumn('tutors', 'bank_account_number')) {
            DB::statement("
                UPDATE tutors
                SET bank_account_no = bank_account_number
                WHERE (bank_account_no IS NULL OR bank_account_no = '')
                  AND bank_account_number IS NOT NULL
                  AND bank_account_number <> ''
            ");
        }

        if (! Schema::hasColumn('tutors', 'user_id') || ! Schema::hasTable('users')) {
            return;
        }

        $userColumns = ['id', 'name', 'email'];
        $hasUserPhone = Schema::hasColumn('users', 'phone');
        if ($hasUserPhone) {
            $userColumns[] = 'phone';
        }

        DB::table('tutors')
            ->select('id', 'user_id', 'full_name', 'email', 'phone', 'password')
            ->orderBy('id')
            ->chunkById(200, function ($rows) use ($userColumns, $hasUserPhone): void {
                $userIds = collect($rows)->pluck('user_id')->filter()->unique()->values()->all();
                if (empty($userIds)) {
                    return;
                }

                $usersById = DB::table('users')
                    ->whereIn('id', $userIds)
                    ->get($userColumns)
                    ->keyBy('id');

                foreach ($rows as $row) {
                    if (! $row->user_id || ! isset($usersById[$row->user_id])) {
                        continue;
                    }

                    $user = $usersById[$row->user_id];
                    $updates = [];

                    if ($this->blank($row->full_name) && ! $this->blank($user->name ?? null)) {
                        $updates['full_name'] = (string) $user->name;
                    }
                    if ($this->blank($row->email) && ! $this->blank($user->email ?? null)) {
                        $updates['email'] = (string) $user->email;
                    }
                    if (
                        $hasUserPhone &&
                        $this->blank($row->phone) &&
                        ! $this->blank($user->phone ?? null)
                    ) {
                        $updates['phone'] = (string) $user->phone;
                    }
                    if ($this->blank($row->password)) {
                        $updates['password'] = Hash::make(Str::random(32));
                    }

                    if ($updates !== []) {
                        DB::table('tutors')->where('id', $row->id)->update($updates);
                    }
                }
            }, 'id');
    }

    private function makeLegacyUserIdOptional(): void
    {
        if (! Schema::hasColumn('tutors', 'user_id')) {
            return;
        }

        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE tutors ALTER COLUMN user_id DROP NOT NULL');
            return;
        }

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE tutors MODIFY user_id BIGINT UNSIGNED NULL');
        }
    }

    private function normalizeStatus(): void
    {
        if (! Schema::hasColumn('tutors', 'status')) {
            Schema::table('tutors', function (Blueprint $table) {
                $table->enum('status', self::STATUS_VALUES)->default('pending_review')->after('emergency_contact');
            });
            return;
        }

        DB::table('tutors')
            ->where(function ($query): void {
                $query->whereNull('status')->orWhere('status', '');
            })
            ->update(['status' => 'pending_review']);

        DB::table('tutors')
            ->whereNotIn('status', self::STATUS_VALUES)
            ->update(['status' => 'inactive']);

        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE tutors ALTER COLUMN status SET DEFAULT 'pending_review'");
        } elseif ($driver === 'mysql') {
            DB::statement("ALTER TABLE tutors ALTER COLUMN status SET DEFAULT 'pending_review'");
        }
    }

    private function backfillTutorCodes(): void
    {
        if (! Schema::hasColumn('tutors', 'tutor_code')) {
            return;
        }

        $rows = DB::table('tutors')
            ->select('id', 'tutor_code', 'created_at')
            ->orderBy('id')
            ->get();

        $maxPerYear = [];
        $seenCodes = [];
        $needsCode = [];

        foreach ($rows as $row) {
            $code = (string) ($row->tutor_code ?? '');
            $isValid = preg_match('/^\d{8}$/', $code) === 1;

            if (! $isValid || isset($seenCodes[$code])) {
                $needsCode[] = $row;
                continue;
            }

            $seenCodes[$code] = true;
            $year = substr($code, 0, 4);
            $number = (int) substr($code, 4);
            $maxPerYear[$year] = max($maxPerYear[$year] ?? 0, $number);
        }

        foreach ($needsCode as $row) {
            $year = $this->resolveYearFromCreatedAt($row->created_at);
            $next = ($maxPerYear[$year] ?? 0) + 1;
            $candidate = $year . str_pad((string) $next, 4, '0', STR_PAD_LEFT);

            while (isset($seenCodes[$candidate]) || DB::table('tutors')->where('tutor_code', $candidate)->exists()) {
                $next++;
                $candidate = $year . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
            }

            $maxPerYear[$year] = $next;
            $seenCodes[$candidate] = true;

            DB::table('tutors')
                ->where('id', $row->id)
                ->update(['tutor_code' => $candidate]);
        }
    }

    private function ensureUniqueIndexes(): void
    {
        if (Schema::hasColumn('tutors', 'tutor_code') && ! $this->indexExists('tutors', 'tutors_tutor_code_unique')) {
            Schema::table('tutors', function (Blueprint $table) {
                $table->unique('tutor_code', 'tutors_tutor_code_unique');
            });
        }

        if (Schema::hasColumn('tutors', 'email') && ! $this->indexExists('tutors', 'tutors_email_unique')) {
            Schema::table('tutors', function (Blueprint $table) {
                $table->unique('email', 'tutors_email_unique');
            });
        }
    }

    private function indexExists(string $table, string $indexName): bool
    {
        $driver = DB::getDriverName();

        return match ($driver) {
            'mysql' => DB::table('information_schema.statistics')
                ->where('table_schema', DB::getDatabaseName())
                ->where('table_name', $table)
                ->where('index_name', $indexName)
                ->exists(),
            'pgsql' => DB::table('pg_indexes')
                ->where('schemaname', 'public')
                ->where('tablename', $table)
                ->where('indexname', $indexName)
                ->exists(),
            'sqlite' => collect(DB::select("PRAGMA index_list('{$table}')"))
                ->contains(fn ($idx) => ($idx->name ?? null) === $indexName),
            default => false,
        };
    }

    private function resolveYearFromCreatedAt(mixed $createdAt): string
    {
        try {
            if ($createdAt) {
                return Carbon::parse((string) $createdAt)->format('Y');
            }
        } catch (\Throwable) {
            // Ignore parse errors and fallback to current year.
        }

        return now()->format('Y');
    }

    private function blank(mixed $value): bool
    {
        return trim((string) ($value ?? '')) === '';
    }
};
