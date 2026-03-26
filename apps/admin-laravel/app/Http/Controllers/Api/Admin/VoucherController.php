<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Voucher::query()
            ->with('applicableClassSession.program')
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('search')) {
            $term = (string) $request->input('search');
            $op = \Illuminate\Support\Facades\DB::getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where('code', $op, "%{$term}%");
        }

        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255', 'unique:vouchers,code'],
            'type' => ['required', 'string', 'in:' . implode(',', Voucher::TYPES)],
            'value' => ['nullable', 'numeric', 'min:0'],
            'min_seats' => ['nullable', 'integer', 'min:1'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'applicable_class_session_id' => ['nullable', 'integer', 'exists:class_sessions,id'],
            'status' => ['nullable', 'string', 'in:' . implode(',', Voucher::STATUSES)],
        ]);

        if (($validated['type'] ?? null) === Voucher::TYPE_FREE_DELIVERY) {
            $validated['value'] = null;
        }

        $validated['code'] = strtoupper(trim((string) $validated['code']));
        $validated['status'] = (string) ($validated['status'] ?? Voucher::STATUS_ACTIVE);

        $voucher = Voucher::query()->create($validated);
        $voucher->load('applicableClassSession.program');

        return response()->json(['data' => $voucher], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $voucher = Voucher::query()->findOrFail($id);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255', 'unique:vouchers,code,' . $voucher->id],
            'type' => ['required', 'string', 'in:' . implode(',', Voucher::TYPES)],
            'value' => ['nullable', 'numeric', 'min:0'],
            'min_seats' => ['nullable', 'integer', 'min:1'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'applicable_class_session_id' => ['nullable', 'integer', 'exists:class_sessions,id'],
            'status' => ['nullable', 'string', 'in:' . implode(',', Voucher::STATUSES)],
        ]);

        if (($validated['type'] ?? null) === Voucher::TYPE_FREE_DELIVERY) {
            $validated['value'] = null;
        }

        $validated['code'] = strtoupper(trim((string) $validated['code']));

        $voucher->update($validated);
        $voucher->load('applicableClassSession.program');

        return response()->json(['data' => $voucher]);
    }

    public function destroy(int $id): JsonResponse
    {
        $voucher = Voucher::query()->findOrFail($id);
        $voucher->delete();

        return response()->json(['message' => 'Voucher deleted successfully.']);
    }

    public function toggle(int $id): JsonResponse
    {
        $voucher = Voucher::query()->findOrFail($id);
        $nextStatus = $voucher->status === Voucher::STATUS_ACTIVE
            ? Voucher::STATUS_INACTIVE
            : Voucher::STATUS_ACTIVE;

        $voucher->update(['status' => $nextStatus]);
        $voucher->load('applicableClassSession.program');

        return response()->json(['data' => $voucher]);
    }
}

