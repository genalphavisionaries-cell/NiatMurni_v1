<x-filament-panels::page>
    <dl class="grid gap-2">
        <dt class="font-medium">Created at</dt>
        <dd>{{ $record->created_at?->format('Y-m-d H:i:s') }}</dd>
        <dt class="font-medium">User</dt>
        <dd>{{ $record->user?->name ?? 'System' }}</dd>
        <dt class="font-medium">Action</dt>
        <dd>{{ $record->action }}</dd>
        <dt class="font-medium">Entity</dt>
        <dd>{{ $record->entity_type }} #{{ $record->entity_id }}</dd>
        <dt class="font-medium">Reason</dt>
        <dd>{{ $record->reason }}</dd>
        @if($record->old_values)
            <dt class="font-medium">Old values</dt>
            <dd><pre class="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">{{ json_encode($record->old_values, JSON_PRETTY_PRINT) }}</pre></dd>
        @endif
        @if($record->new_values)
            <dt class="font-medium">New values</dt>
            <dd><pre class="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">{{ json_encode($record->new_values, JSON_PRETTY_PRINT) }}</pre></dd>
        @endif
    </dl>
</x-filament-panels::page>
