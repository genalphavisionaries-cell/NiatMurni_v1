<x-filament-panels::page>
    @if($classSessionId)
        {{ $this->form }}
    @else
        <p class="text-gray-500 dark:text-gray-400">Select a class session from the list to manage attendance.</p>
    @endif
</x-filament-panels::page>
