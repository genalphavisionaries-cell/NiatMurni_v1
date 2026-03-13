<div class="space-y-2">
    <p><strong>Action:</strong> {{ $record->action }}</p>
    <p><strong>Entity:</strong> {{ $record->entity_type }} #{{ $record->entity_id }}</p>
    <p><strong>Reason:</strong> {{ $record->reason }}</p>
    @if($record->old_values)
        <p><strong>Old values:</strong></p>
        <pre class="text-xs bg-gray-100 p-2 rounded">{{ json_encode($record->old_values, JSON_PRETTY_PRINT) }}</pre>
    @endif
    @if($record->new_values)
        <p><strong>New values:</strong></p>
        <pre class="text-xs bg-gray-100 p-2 rounded">{{ json_encode($record->new_values, JSON_PRETTY_PRINT) }}</pre>
    @endif
</div>
