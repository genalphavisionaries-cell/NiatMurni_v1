<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportTicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = (string) $request->get('status', '');

        $query = SupportTicket::query()
            ->with(['participant:id,full_name,email,phone'])
            ->latest('updated_at');

        if (in_array($status, [SupportTicket::STATUS_OPEN, SupportTicket::STATUS_CLOSED], true)) {
            $query->where('status', $status);
        }

        $tickets = $query->get()->map(function (SupportTicket $ticket) {
            return [
                'id' => $ticket->id,
                'subject' => $ticket->subject,
                'message' => $ticket->message,
                'status' => $ticket->status,
                'created_at' => optional($ticket->created_at)->toIso8601String(),
                'participant' => $ticket->participant ? [
                    'id' => $ticket->participant->id,
                    'full_name' => $ticket->participant->full_name,
                    'email' => $ticket->participant->email,
                    'phone' => $ticket->participant->phone,
                ] : null,
            ];
        })->values()->all();

        return response()->json($tickets);
    }

    public function show(int $id): JsonResponse
    {
        $ticket = SupportTicket::query()
            ->with(['participant:id,full_name,email,phone', 'replies.user:id,name'])
            ->find($id);

        if (! $ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        return response()->json([
            'id' => $ticket->id,
            'subject' => $ticket->subject,
            'message' => $ticket->message,
            'status' => $ticket->status,
            'created_at' => optional($ticket->created_at)->toIso8601String(),
            'participant' => $ticket->participant ? [
                'id' => $ticket->participant->id,
                'full_name' => $ticket->participant->full_name,
                'email' => $ticket->participant->email,
                'phone' => $ticket->participant->phone,
            ] : null,
            'replies' => $ticket->replies->map(function ($reply) {
                return [
                    'id' => $reply->id,
                    'message' => $reply->message,
                    'sender' => $reply->user_id ? 'admin' : 'participant',
                    'sender_name' => $reply->user?->name,
                    'created_at' => optional($reply->created_at)->toIso8601String(),
                ];
            })->values()->all(),
        ]);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $ticket = SupportTicket::query()->find($id);
        if (! $ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        if ($ticket->status === SupportTicket::STATUS_CLOSED) {
            return response()->json(['message' => 'This ticket is closed.'], 422);
        }

        $data = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $reply = $ticket->replies()->create([
            'message' => $data['message'],
            'user_id' => $request->user()?->id,
        ]);

        return response()->json([
            'id' => $reply->id,
            'message' => $reply->message,
            'sender' => 'admin',
            'sender_name' => $request->user()?->name,
            'created_at' => optional($reply->created_at)->toIso8601String(),
        ]);
    }

    public function close(int $id): JsonResponse
    {
        $ticket = SupportTicket::query()->find($id);
        if (! $ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        $ticket->status = SupportTicket::STATUS_CLOSED;
        $ticket->save();

        return response()->json([
            'id' => $ticket->id,
            'status' => $ticket->status,
            'message' => 'Ticket closed successfully.',
        ]);
    }
}

