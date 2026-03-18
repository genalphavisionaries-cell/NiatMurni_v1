@php
    /** @var \App\Models\CertificateTemplate $template */
    /** @var array{participant_name:string,program_name:string,tutor_name:string,tutor_registration_number:string,issue_date:string,certificate_no:string} $sample */

    $body = $template->body_content ?? '';
    $footer = $template->footer_text ?? '';

    $replacements = [
        '{participant_name}' => $sample['participant_name'],
        '{program_name}' => $sample['program_name'],
        '{tutor_name}' => $sample['tutor_name'],
        '{tutor_registration_number}' => $sample['tutor_registration_number'],
        '{issue_date}' => $sample['issue_date'],
        '{certificate_no}' => $sample['certificate_no'],
    ];

    $bodyRendered = strtr($body, $replacements);
    $footerRendered = strtr($footer, $replacements);

    $titleAlign = $template->title_alignment ?? 'center';
    $subtitleAlign = $template->subtitle_alignment ?? 'center';
    $bodyAlign = $template->body_alignment ?? 'left';
    $footerAlign = $template->footer_alignment ?? 'center';

    $titleSize = $template->title_font_size ?? 28;
    $subtitleSize = $template->subtitle_font_size ?? 18;
    $bodySize = $template->body_font_size ?? 14;
    $footerSize = $template->footer_font_size ?? 12;

    $topOffset = $template->content_top_offset ?? 40;
    $bottomOffset = $template->content_bottom_offset ?? 40;
@endphp

<div class="bg-gray-100 dark:bg-gray-900 p-4">
    <div
        class="mx-auto bg-white dark:bg-gray-950 shadow border border-gray-200 dark:border-gray-800 relative"
        style="width: 800px; height: 565px;"
    >
        @if($template->background_image_path)
            <div
                class="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
                style="background-image: url('{{ \Illuminate\Support\Facades\Storage::url($template->background_image_path) }}');"
            ></div>
        @endif

        <div class="relative h-full flex flex-col"
             style="padding-top: {{ $topOffset }}px; padding-bottom: {{ $bottomOffset }}px;">
            <div class="flex items-start justify-between px-10">
                @if($template->show_logo && $template->logo_path)
                    <div>
                        <img
                            src="{{ \Illuminate\Support\Facades\Storage::url($template->logo_path) }}"
                            alt="Logo"
                            class="h-16 object-contain"
                        />
                    </div>
                @else
                    <div></div>
                @endif

                <div class="text-right text-xs text-gray-500 dark:text-gray-400">
                    <div>Sample preview</div>
                    <div>Certificate No: {{ $sample['certificate_no'] }}</div>
                </div>
            </div>

            <div class="flex-1 flex flex-col items-stretch justify-center px-16 space-y-4">
                <div class="text-gray-900 dark:text-gray-100"
                     style="text-align: {{ $titleAlign }}; font-size: {{ $titleSize }}px; font-weight: 700;">
                    {{ $template->name ?: 'Certificate of Completion' }}
                </div>

                @if($template->subtitle)
                    <div class="text-gray-700 dark:text-gray-300"
                         style="text-align: {{ $subtitleAlign }}; font-size: {{ $subtitleSize }}px;">
                        {{ $template->subtitle }}
                    </div>
                @endif

                @if($bodyRendered)
                    <div class="text-gray-800 dark:text-gray-200 whitespace-pre-line"
                         style="text-align: {{ $bodyAlign }}; font-size: {{ $bodySize }}px;">
                        {!! nl2br(e($bodyRendered)) !!}
                    </div>
                @endif
            </div>

            <div class="px-16 pb-6 flex items-end justify-between space-x-8">
                @if($template->show_left_signature)
                    <div class="flex flex-col items-center flex-1">
                        @if($template->left_signature_image_path)
                            <img
                                src="{{ \Illuminate\Support\Facades\Storage::url($template->left_signature_image_path) }}"
                                alt="Left signature"
                                class="h-12 object-contain mb-1"
                            />
                        @else
                            <div class="h-12 mb-1 border-b border-dashed border-gray-400 w-full"></div>
                        @endif
                        <div class="text-gray-900 dark:text-gray-100 font-semibold" style="font-size: {{ $footerSize }}px;">
                            {{ $template->left_signatory_name ?: 'Left Signatory' }}
                        </div>
                        @if($template->left_signatory_title)
                            <div class="text-gray-600 dark:text-gray-300 text-xs">
                                {{ $template->left_signatory_title }}
                            </div>
                        @endif
                    </div>
                @endif

                @if($template->show_right_signature)
                    <div class="flex flex-col items-center flex-1">
                        @if($template->right_signature_image_path)
                            <img
                                src="{{ \Illuminate\Support\Facades\Storage::url($template->right_signature_image_path) }}"
                                alt="Right signature"
                                class="h-12 object-contain mb-1"
                            />
                        @else
                            <div class="h-12 mb-1 border-b border-dashed border-gray-400 w-full"></div>
                        @endif
                        <div class="text-gray-900 dark:text-gray-100 font-semibold" style="font-size: {{ $footerSize }}px;">
                            {{ $template->right_signatory_name ?: 'Right Signatory' }}
                        </div>
                        @if($template->right_signatory_title)
                            <div class="text-gray-600 dark:text-gray-300 text-xs">
                                {{ $template->right_signatory_title }}
                            </div>
                        @endif
                    </div>
                @endif
            </div>

            @if($footerRendered)
                <div class="px-10 pb-4 text-gray-600 dark:text-gray-300 text-xs"
                     style="text-align: {{ $footerAlign }};">
                    {!! nl2br(e($footerRendered)) !!}
                </div>
            @endif
        </div>
    </div>
</div>

