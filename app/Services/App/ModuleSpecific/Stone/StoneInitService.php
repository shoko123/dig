<?php

namespace App\Services\App\ModuleSpecific\Stone;

use App\Services\App\InitService;
use App\Services\App\ModuleSpecific\InitSpecificServiceInterface;

class StoneInitService extends InitService implements InitSpecificServiceInterface
{
    public function __construct()
    {
        parent::__construct('Stone');
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
            'It appears that the excavators did not save or record the more common grinding stones that must have been unearthed during the excavation.',
        ];
    }

    public static function modelGroups(): array
    {
        return [
            'Year' => [
                'code' => 'FD',
                'text_source' => 'Manipulated',
                'table_name' => 'stones',
                'column_name' => 'id_year',
                'column_type' => 'integer',
                'manipulator' => function ($val) {
                    return (string) ($val + 2000);
                },
                'dependency' => [],
                'show_in_item_tags' => false,
                'show_in_filters' => true,
                'show_in_tagger' => false,
                'allow_dependents' => false,
            ],
            'Material' => [
                'code' => 'FD',
                'text_source' => 'Lookup',
                'column_name' => 'material_id',
                'lookup_table_name' => 'stone_materials',
                'dependency' => [],
                'allow_dependents' => false,
                'show_in_item_tags' => true,
                'show_in_filters' => true,
                'show_in_tagger' => true,
            ],
            'Whole' => [
                'code' => 'FD',
                'text_source' => 'Manipulated',
                'table_name' => 'stones',
                'column_name' => 'whole',
                'column_type' => 'boolean',
                'dependency' => [],
                'allow_dependents' => false,
                'show_in_item_tags' => true,
                'show_in_filters' => true,
                'show_in_tagger' => true,
                'params' => [['text' => 'Yes', 'extra' => true], ['text' => 'No', 'extra' => false]],
            ],
            'Basic Typology' => [
                'code' => 'FD',
                'text_source' => 'Lookup',
                'table_name' => 'stones',
                'column_name' => 'base_type_id',
                'lookup_table_name' => 'stone_base_types',
                'dependency' => [],
                'allow_dependents' => true,
                'show_in_item_tags' => true,
                'show_in_filters' => true,
                'show_in_tagger' => true,
            ],
            'Cataloger' => [
                'code' => 'FD',
                'text_source' => 'Lookup',
                'table_name' => 'stones',
                'column_name' => 'cataloger_id',
                'lookup_table_name' => 'stone_catalogers',
                'dependency' => [],
                'allow_dependents' => false,
                'show_in_item_tags' => false,
                'show_in_filters' => true,
                'show_in_tagger' => true,
            ],
            'Life Stage' => [
                'code' => 'TM',
                'dependency' => [],
                'multiple' => true,
            ],
            'Morphology' => [
                'code' => 'TM',
                'dependency' => [],
                'multiple' => true,
            ],
            'Profile' => [
                'code' => 'TM',
                'dependency' => [],
                'multiple' => true,
            ],
            'Production' => [
                'code' => 'TM',
                'dependency' => [],
                'multiple' => true,
            ],
            'Use Wear' => [
                'code' => 'TM',
                'dependency' => [],
                'multiple' => true,
            ],
            'Passive Subtype' => [
                'code' => 'TM',
                'dependency' => ['Basic Typology.Passive'],
                'multiple' => true,
            ],
            'Active Subtype' => [
                'code' => 'TM',
                'dependency' => ['Basic Typology.Active (handheld)'],
                'multiple' => true,
            ],
            'Vessel Type' => [
                'code' => 'TM',
                'dependency' => ['Basic Typology.Vessel'],
                'multiple' => true,
            ],
            'Vessel Part' => [
                'code' => 'TM',
                'dependency' => ['Basic Typology.Vessel'],
                'multiple' => true,
            ],
            'Vessel Base' => [
                'code' => 'TM',
                'dependency' => ['Vessel Part.Base'],
                'multiple' => true,
            ],
            'Vessel Wall' => [
                'code' => 'TM',
                'dependency' => ['Vessel Part.Wall'],
                'multiple' => true,
            ],
            'Vessel Rim' => [
                'code' => 'TM',
                'dependency' => ['Vessel Part.Rim'],
                'multiple' => true,
            ],
            'Non-Processor Subtype' => [
                'code' => 'TM',
                'dependency' => ['Basic Typology.Non-Processor'],
                'multiple' => true,
            ],
            'Search-ID' => [
                'code' => 'FS',
                'column_name' => 'id',
            ],
            'Order By' => [
                'code' => 'OB',
                'params' => [
                    ['text' => 'Excavation Date', 'extra' => 'excavation_date'],
                    ['text' => 'Catalog Date', 'extra' => 'catalog_date'],
                    ['text' => 'Year', 'extra' => 'id_year'],
                    ['text' => 'Object Number', 'extra' => 'id_object_no'],
                ],
            ],
        ];
    }

    public static function categories(): array
    {
        return [
            'Search' => [
                'Search-ID',
            ],
            'Registration' => [
                'Year',
                'Media',
                'Cataloger',
                'Whole',
            ],
            'Periods' => [
                'Periods (Top-Level)',
                'Neolithic Subperiods',
                'Bronze Subperiods',
                'Iron Subperiods',
                'Hellenistic Subperiods',
                'Roman Subperiods',
                'Early-Islamic Subperiods',
                'Medieval Subperiods',
                'Modern Subperiods',
            ],
            'Basic Characteristics' => [
                'Material',
                'Life Stage',
                'Use Wear',
                'Morphology',
                'Profile',
                'Production',
                'Basic Typology',
            ],
            'Typology' => [
                'Passive Subtype',
                'Active Subtype',
                'Vessel Type',
                'Vessel Part',
                'Vessel Base',
                'Vessel Wall',
                'Vessel Rim',
                'Non-Processor Subtype',
            ],
            'Order By' => [
                'Order By',
            ],
        ];
    }
}
