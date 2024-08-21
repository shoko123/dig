<?php

namespace App\Services\App\ModuleSpecific\Locus;

use App\Services\App\InitService;
use App\Services\App\ModuleSpecific\InitSpecificServiceInterface;

class LocusInitService extends InitService implements InitSpecificServiceInterface
{
    public function __construct()
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
            'Category' => [
                'code' => 'FD',
                'tag_source' => 'Value',
                'table_name' => 'loci',
                'field_name' => 'category',
                'field_type' => 'string',
                'manipulator' => function ($val) {
                    return $val;
                },
                'dependency' => [],
                'show_in_item_tags' => true,
                'show_in_filters' => true,
                'show_in_tagger' => true,
                'allow_dependents' => false,
            ],
            'Search-ID' => [
                'code' => 'FS',
                'field_name' => 'id',
            ],
            'Search-OC-Label' => [
                'code' => 'FS',
                'field_name' => 'oc_label',
            ],
            'Order By' => [
                'code' => 'OB',
                'params' => [
                    ['text' => 'Basic Typology', 'extra' => 'category'],
                    ['text' => 'Number', 'extra' => 'a'],
                    ['text' => 'Subnumber', 'extra' => 'b'],
                    ['text' => 'Publication Date', 'extra' => 'published_date'],
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
                'Category'
            ],
            'Order By' => [
                'Order By',
            ],
        ];
    }
}
