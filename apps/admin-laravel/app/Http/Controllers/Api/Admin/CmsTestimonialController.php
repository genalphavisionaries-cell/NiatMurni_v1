<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsTestimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsTestimonialController extends Controller
{
    public function index(): JsonResponse
    {
        $items = CmsTestimonial::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json(['data' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image_url' => 'nullable|string|max:2048',
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'required|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $item = CmsTestimonial::query()->create($validated);

        return response()->json(['data' => $item, 'message' => 'Testimonial created.'], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $item = CmsTestimonial::query()->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'image_url' => 'nullable|string|max:2048',
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'content' => 'sometimes|required|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $item->update($validated);

        return response()->json(['data' => $item, 'message' => 'Testimonial updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        $item = CmsTestimonial::query()->findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Testimonial deleted.']);
    }
}
