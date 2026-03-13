<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployerController extends Controller
{
    /**
     * List employers for dropdowns (e.g. when creating participants).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Employer::query()->orderBy('name');
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where('name', 'like', "%{$q}%");
        }
        $perPage = (int) $request->get('per_page', 50);
        $perPage = min(max($perPage, 1), 100);
        $employers = $query->paginate($perPage);
        return response()->json($employers);
    }
}
