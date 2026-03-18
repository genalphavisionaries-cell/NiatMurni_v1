<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CertificateTemplateResource\Pages;
use App\Models\CertificateTemplate;
use App\Support\CertificateTemplatePlaceholders;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CertificateTemplateResource extends Resource
{
    protected static ?string $model = CertificateTemplate::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Settings';

    public static function form(Form $form): Form
    {
        $alignmentOptions = [
            'left' => 'Left',
            'center' => 'Center',
            'right' => 'Right',
        ];

        $orientationOptions = [
            'portrait' => 'Portrait',
            'landscape' => 'Landscape',
        ];

        $pageSizeOptions = [
            'A4' => 'A4',
            'A5' => 'A5',
            'letter' => 'Letter',
        ];

        return $form
            ->schema([
                Forms\Components\Section::make('Basic Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Template name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('code')
                            ->label('Code')
                            ->helperText('Unique code (for internal reference or future assignments).')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active template')
                            ->helperText('Only one template will be active at a time. Activating this will deactivate others.'),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Certificate Content')
                    ->schema([
                        Forms\Components\TextInput::make('subtitle')
                            ->label('Subtitle')
                            ->maxLength(255),
                        Forms\Components\Textarea::make('body_content')
                            ->label('Body content')
                            ->rows(6)
                            ->helperText('Use placeholders like {participant_name}, {program_name}, etc. See the placeholders panel below.'),
                        Forms\Components\Textarea::make('footer_text')
                            ->label('Footer text')
                            ->rows(4),
                    ])
                    ->columns(1),

                Forms\Components\Section::make('Organization Details')
                    ->schema([
                        Forms\Components\TextInput::make('organization_name')
                            ->label('Organization name')
                            ->maxLength(255),
                        Forms\Components\Textarea::make('organization_details')
                            ->label('Organization details')
                            ->rows(3),
                    ])
                    ->columns(1),

                Forms\Components\Section::make('Signatories')
                    ->schema([
                        Forms\Components\TextInput::make('left_signatory_name')
                            ->label('Left signatory name')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('left_signatory_title')
                            ->label('Left signatory title')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('right_signatory_name')
                            ->label('Right signatory name')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('right_signatory_title')
                            ->label('Right signatory title')
                            ->maxLength(255),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Layout & Typography')
                    ->schema([
                        Forms\Components\Select::make('page_size')
                            ->label('Page size')
                            ->options($pageSizeOptions)
                            ->default('A4'),
                        Forms\Components\Select::make('orientation')
                            ->label('Orientation')
                            ->options($orientationOptions),
                        Forms\Components\Select::make('title_alignment')
                            ->label('Title alignment')
                            ->options($alignmentOptions),
                        Forms\Components\Select::make('subtitle_alignment')
                            ->label('Subtitle alignment')
                            ->options($alignmentOptions),
                        Forms\Components\Select::make('body_alignment')
                            ->label('Body alignment')
                            ->options($alignmentOptions),
                        Forms\Components\Select::make('footer_alignment')
                            ->label('Footer alignment')
                            ->options($alignmentOptions),
                        Forms\Components\TextInput::make('title_font_size')
                            ->label('Title font size')
                            ->numeric()
                            ->minValue(8)
                            ->maxValue(72),
                        Forms\Components\TextInput::make('subtitle_font_size')
                            ->label('Subtitle font size')
                            ->numeric()
                            ->minValue(8)
                            ->maxValue(48),
                        Forms\Components\TextInput::make('body_font_size')
                            ->label('Body font size')
                            ->numeric()
                            ->minValue(8)
                            ->maxValue(32),
                        Forms\Components\TextInput::make('footer_font_size')
                            ->label('Footer font size')
                            ->numeric()
                            ->minValue(8)
                            ->maxValue(32),
                        Forms\Components\TextInput::make('content_top_offset')
                            ->label('Content top offset (px)')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(500),
                        Forms\Components\TextInput::make('content_bottom_offset')
                            ->label('Content bottom offset (px)')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(500),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Visibility')
                    ->schema([
                        Forms\Components\Toggle::make('show_logo')
                            ->label('Show logo'),
                        Forms\Components\Toggle::make('show_left_signature')
                            ->label('Show left signature'),
                        Forms\Components\Toggle::make('show_right_signature')
                            ->label('Show right signature'),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Assets')
                    ->schema([
                        Forms\Components\FileUpload::make('background_image_path')
                            ->label('Background image')
                            ->image()
                            ->directory('certificate-templates/backgrounds')
                            ->preserveFilenames()
                            ->helperText('Optional background image for the certificate.'),
                        Forms\Components\FileUpload::make('logo_path')
                            ->label('Logo image')
                            ->image()
                            ->directory('certificate-templates/logos')
                            ->preserveFilenames(),
                        Forms\Components\FileUpload::make('left_signature_image_path')
                            ->label('Left signature image')
                            ->image()
                            ->directory('certificate-templates/signatures')
                            ->preserveFilenames(),
                        Forms\Components\FileUpload::make('right_signature_image_path')
                            ->label('Right signature image')
                            ->image()
                            ->directory('certificate-templates/signatures')
                            ->preserveFilenames(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Placeholders')
                    ->description('Use these placeholders in body or footer content; they will be replaced when generating certificates.')
                    ->schema([
                        Forms\Components\View::make('filament.certificate-templates.placeholders')
                            ->viewData([
                                'placeholders' => CertificateTemplatePlaceholders::all(),
                            ]),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Template name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('code')
                    ->label('Code')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Last updated')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active')
                    ->nullable(),
            ])
            ->actions([
                Tables\Actions\Action::make('preview')
                    ->label('Preview')
                    ->icon('heroicon-o-eye')
                    ->modalHeading(fn (CertificateTemplate $record) => 'Preview: ' . $record->name)
                    ->modalWidth('7xl')
                    ->modalContent(function (CertificateTemplate $record) {
                        $sampleData = [
                            'participant_name' => 'John Doe',
                            'program_name' => 'Food Handler Training Programme',
                            'tutor_name' => 'Trainer Sample',
                            'tutor_registration_number' => 'KKM-12345',
                            'issue_date' => now()->format('d M Y'),
                            'certificate_no' => 'CERT-SAMPLE-0001',
                        ];

                        return view('filament.certificate-templates.preview', [
                            'template' => $record,
                            'sample' => $sampleData,
                        ]);
                    }),
                Tables\Actions\Action::make('duplicate')
                    ->label('Duplicate')
                    ->icon('heroicon-o-document-duplicate')
                    ->action(function (CertificateTemplate $record): void {
                        $copy = $record->replicate();
                        $copy->name = $record->name . ' (Copy)';
                        $copy->code = $record->code
                            ? $record->code . '-copy-' . now()->format('YmdHis')
                            : null;
                        $copy->is_active = false;
                        $copy->save();
                    })
                    ->successNotificationTitle('Template duplicated'),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCertificateTemplates::route('/'),
            'create' => Pages\CreateCertificateTemplate::route('/create'),
            'edit' => Pages\EditCertificateTemplate::route('/{record}/edit'),
        ];
    }
}

