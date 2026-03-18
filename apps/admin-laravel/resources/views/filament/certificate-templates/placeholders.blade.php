<div class="space-y-2">
    <p class="text-sm text-gray-700 dark:text-gray-300">
        You can use these placeholders in the certificate body and footer. They will be replaced with real values when a certificate is generated.
    </p>
    <table class="min-w-full text-sm border border-gray-200 dark:border-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/40">
        <tr>
            <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Placeholder</th>
            <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Label</th>
            <th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Description</th>
        </tr>
        </thead>
        <tbody>
        @foreach($placeholders as $item)
            <tr class="border-t border-gray-200 dark:border-gray-700">
                <td class="px-3 py-2 font-mono text-xs text-gray-800 dark:text-gray-100">
                    {{ $item['placeholder'] }}
                </td>
                <td class="px-3 py-2 text-gray-800 dark:text-gray-100">
                    {{ $item['label'] }}
                </td>
                <td class="px-3 py-2 text-gray-600 dark:text-gray-300">
                    {{ $item['description'] }}
                </td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>

