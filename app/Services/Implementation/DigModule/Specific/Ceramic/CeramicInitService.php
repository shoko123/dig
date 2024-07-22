<?php

namespace App\Services\Implementation\DigModule\specific\Ceramic;

use App\Services\Implementation\DigModule\DigModuleInitService;
use App\Services\Interfaces\DigModuleInitSpecificServiceInterface;

class CeramicInitService extends DigModuleInitService implements DigModuleInitSpecificServiceInterface
{
    function __construct()
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
                'group_type_code' => 'CR',
                'table_name' => 'ceramics',
                'column_name' => 'id_year',
            ],
            'Object Number' => [
                'group_type_code' => 'CR',
                'table_name' => 'ceramics',
                'column_name' => 'id_object_no',
            ],
            'Search-Field-Description' => [
                'group_type_code' => 'CS',
                'column_name' => 'field_description',
            ],
            'Search-Specialist-Description' => [
                'group_type_code' => 'CS',
                'column_name' => 'specialist_description',
            ],
            'Search-Notes' => [
                'group_type_code' => 'CS',
                'column_name' => 'notes',
            ],

            'Order By' => [
                'group_type_code' => 'OB',
                'params' => [
                    ['name' => 'Year', 'column_name' => 'id_year'],
                    ['name' => 'Object No.', 'column_name' => 'id_object_no'],
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
