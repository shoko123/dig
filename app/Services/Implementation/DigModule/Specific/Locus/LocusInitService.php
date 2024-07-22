<?php

namespace App\Services\Implementation\DigModule\specific\Locus;

use App\Services\Implementation\DigModule\DigModuleInitService;
use App\Services\Interfaces\DigModuleInitSpecificServiceInterface;

class LocusInitService extends DigModuleInitService implements DigModuleInitSpecificServiceInterface
{
    function __construct()
    {
        parent::__construct('Locus');
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
            'Loci as drived from opencontexts` "features". Most have no information except a label.
            Attempts were made to clean and streamline inconsistencies (e.g. "Blank" labels were changes to "Unknown"; Duplicates were given an extra numerical index).',
        ];
    }

    public static function modelGroups(): array
    {
        return [
            'Basic Typology' => [
                'group_type_code' => 'CR',
                'table_name' => 'loci',
                'column_name' => 'category',
            ],

            'Search-ID' => [
                'group_type_code' => 'CS',
                'column_name' => 'id',
            ],
            'Search-OC-Label' => [
                'group_type_code' => 'CS',
                'column_name' => 'oc_label',
            ],
            'Order By' => [
                'group_type_code' => 'OB',
                'params' => [
                    ['name' => 'Basic Typology', 'column_name' => 'category'],
                    ['name' => 'Number', 'column_name' => 'a'],
                    ['name' => 'Subnumber', 'column_name' => 'b'],
                    ['name' => 'Publication Date', 'column_name' => 'published_date'],
                ],
            ],
        ];
    }

    public static function categories(): array
    {
        return [
            'Search' => [
                'Search-ID',
                'Search-OC-Label',
            ],
            'Registration' => [
                'Media',
            ],

            'Basic Characteristics' => [
                'Basic Typology',
            ],
            'Order By' => [
                'Order By',
            ],
        ];
    }
}
