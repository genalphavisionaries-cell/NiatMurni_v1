<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParticipantSupportTicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $participant = $this->resolveParticipant($request);
        if (! $participant) {
            return response()->json(['message' => 'Participant profile not found'], 403);
        }

        $tickets = $participant->supportTickets()
            ->with('replies')
            ->latest('updated_at')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'subject' => $ticket->subject,
                    'message' => $ticket->message,
                    'status' => $ticket->status,
                    'created_at' => optional($ticket->created_at)->toIso8601String(),
                    'replies' => $ticket->replies->map(function ($reply) {
                        return [
                            'id' => $reply->id,
                            'message' => $reply->message,
                            'sender' => $reply->user_id ? 'support' : 'participant',
                            'created_at' => optional($reply->created_at)->toIso8601String(),
                        ];
                    })->values()->all(),
                ];
            })
            ->values()
            ->all();

        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $participant = $this->resolveParticipant($request);
        if (! $participant) {
            return response()->json(['message' => 'Participant profile not found'], 403);
        }

        $data = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $ticket = $participant->supportTickets()->create([
            'subject' => $data['subject'],
            'message' => $data['message'],
            'status' => SupportTicket::STATUS_OPEN,
        ]);

        $ticket->replies()->create([
            'message' => $data['message'],
            'user_id' => null,
        ]);

        return response()->json([
            'id' => $ticket->id,
            'subject' => $ticket->subject,
            'message' => $ticket->message,
            'status' => $ticket->status,
            'created_at' => optional($ticket->created_at)->toIso8601String(),
            'replies' => [[
                'id' => $ticket->replies()->latest('id')->value('id'),
                'message' => $data['message'],
                'sender' => 'participant',
                'created_at' => optional($ticket->created_at)->toIso8601String(),
            ]],
        ], 201);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $participant = $this->resolveParticipant($request);
        if (! $participant) {
            return response()->json(['message' => 'Participant profile not found'], 403);
        }

        $ticket = $participant->supportTickets()->whereKey($id)->first();
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
            'user_id' => null,
        ]);

        return response()->json([
            'id' => $reply->id,
            'message' => $reply->message,
            'sender' => 'participant',
            'created_at' => optional($reply->created_at)->toIso8601String(),
        ]);
    }

    private function resolveParticipant(Request $request): ?Participant
    {
        $user = $request->user();
        if (! $user || $user->role !== 'participant') {
            return null;
        }

        return Participant::query()->where('user_id', $user->id)->first();
    }
}

