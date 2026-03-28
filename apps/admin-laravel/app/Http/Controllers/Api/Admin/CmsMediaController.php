<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CmsMediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:5120', 'mimes:jpg,jpeg,png,gif,webp,svg'],
        ]);

        $file = $request->file('file');
        $ext = strtolower((string) $file->getClientOriginalExtension());
        $fileName = now()->format('YmdHis').'-'.Str::random(8).($ext !== '' ? ".{$ext}" : '');
        $path = $file->storeAs('cms/uploads', $fileName, 'public');
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'data' => ['url' => $url],
        ]);
    }
}
