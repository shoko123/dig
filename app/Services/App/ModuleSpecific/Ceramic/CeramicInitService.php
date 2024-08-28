<?php

namespace App\Services\App\ModuleSpecific\Ceramic;

use App\Services\App\InitService;
use App\Services\App\ModuleSpecific\InitSpecificServiceInterface;

class CeramicInitService extends InitService implements InitSpecificServiceInterface
{
    public function __construct()
    {
        parent::__construct('Ceramic');
    }

    public static function displayOptions(): array
    {
        return [
            'item_views' => ['Main', 'Media', 'Related'],
            'main_collection_views' => ['Gallery', 'Tabular', 'Chips'],
            'related_collection_views' => ['Gallery', 'Tabular', 'Chips'],
        ];
    }

    public static function welcomeText(): array
    {
        return [
            'A few welcome words about ceramics',
        ];
    }

    public static function modelGroups(): array
    {
        return [
            'Year' => [
                'code' => 'FD',
                'tag_source' => 'Value',
                'table_name' => 'ceramics',
                'field_name' => 'id_year',
                'field_type' => 'number',
                'manipulator' => function ($val) {
                    return (string) ($val + 2000);
                },
                'dependency' => [],
                'show_in_item_tags' => true,
                'show_in_filters' => true,
                'show_in_tagger' => true,
                'allow_dependents' => false,
            ],
            'Object Number' => [
                'code' => 'FD',
                'tag_source' => 'Value',
                'table_name' => 'ceramics',
                'field_name' => 'id_object_no',
                'field_type' => 'number',
                'manipulator' => function ($val) {
                    return (string) ($val);
                },
                'dependency' => [],
                'show_in_item_tags' => true,
                'show_in_filters' => true,
                'show_in_tagger' => true,
                'allow_dependents' => false,
            ],
            'Search-Field-Description' => [
                'code' => 'FS',
                'field_name' => 'field_description',
            ],
            'Search-Specialist-Description' => [
                'code' => 'FS',
                'field_name' => 'specialist_description',
            ],
            'Search-Notes' => [
                'code' => 'FS',
                'field_name' => 'notes',
            ],
            'Order By' => [
                'code' => 'OB',
                'options' => [
                    ['text' => 'Year', 'extra' => 'id_year'],
                    ['text' => 'Object No.', 'extra' => 'id_object_no'],
                ],
            ],
        ];
    }

    public static function categories(): array
    {
        return [
            'Registration' => [
                'Year',
                'Object Number',
                'Media',
            ],
            'Search' => [
                'Search-Field-Description',
                'Search-Specialist-Description',
                'Search-Notes',
            ],
            'Order By' => [
                'Order By',
            ],
        ];
    }
}
