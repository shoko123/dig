<?php

namespace App\Services\App\ModuleSpecific\Stone;

use App\Services\App\DigModuleInitService;
use App\Services\App\ModuleSpecific\Interfaces\InitSpecificServiceInterface;

class StoneInitService extends DigModuleInitService implements InitSpecificServiceInterface
{
    function __construct()
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
    public static function dateColumns(): array
    {
        return  [
            "excavation_date",
            "catalog_date",
            "specialist_date"
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
                'group_type_code' => 'CR',
                'table_name' => 'stones',
                'column_name' => 'id_year',
            ],
            'Object Number' => [
                'group_type_code' => 'CR',
                'table_name' => 'stones',
                'column_name' => 'id_object_no',
            ],
            'Material' => [
                'group_type_code' => 'CL',
                'dependency' => null,
                'table_name' => 'stone_materials',
                'column_name' => 'material_id',
            ],
            'Whole' => [
                'group_type_code' => 'CB',
                'column_name' => 'whole',
                'params' => ['Yes', 'No'],
            ],
            'Basic Typology' => [
                'group_type_code' => 'CL',
                'dependency' => null,
                'table_name' => 'stone_base_types',
                'column_name' => 'base_type_id',
            ],
            'Cataloger' => [
                'group_type_code' => 'CL',
                'dependency' => null,
                'table_name' => 'stone_catalogers',
                'column_name' => 'cataloger_id',
            ],
            'Life Stage' => [
                'group_type_code' => 'TM',
                'dependency' => null,
                'multiple' => true,
            ],
            'Morphology' => [
                'group_type_code' => 'TM',
                'dependency' => null,
                'multiple' => true,
            ],
            'Profile' => [
                'group_type_code' => 'TM',
                'dependency' => null,
                'multiple' => true,
            ],
            'Production' => [
                'group_type_code' => 'TM',
                'dependency' => null,
                'multiple' => true,
            ],
            'Use Wear' => [
                'group_type_code' => 'TM',
                'dependency' => null,
                'multiple' => true,
            ],
            'Passive Subtype' => [
                'group_type_code' => 'TM',
                'dependency' => ['Basic Typology.Passive'],
                'multiple' => true,
            ],
            'Active Subtype' => [
                'group_type_code' => 'TM',
                'dependency' => ['Basic Typology.Active (handheld)'],
                'multiple' => true,
            ],
            'Vessel Type' => [
                'group_type_code' => 'TM',
                'dependency' => ['Basic Typology.Vessel'],
                'multiple' => true,
            ],
            'Vessel Part' => [
                'group_type_code' => 'TM',
                'dependency' => ['Basic Typology.Vessel'],
                'multiple' => true,
            ],
            'Vessel Base' => [
                'group_type_code' => 'TM',
                'dependency' => ['Vessel Part.Base'],
                'multiple' => true,
            ],
            'Vessel Wall' => [
                'group_type_code' => 'TM',
                'dependency' => ['Vessel Part.Wall'],
                'multiple' => true,
            ],
            'Vessel Rim' => [
                'group_type_code' => 'TM',
                'dependency' => ['Vessel Part.Rim'],
                'multiple' => true,
            ],
            'Non-Processor Subtype' => [
                'group_type_code' => 'TM',
                'dependency' => ['Basic Typology.Non-Processor'],
                'multiple' => true,
            ],
            'Search-ID' => [
                'group_type_code' => 'CS',
                'column_name' => 'id',
            ],
            'Order By' => [
                'group_type_code' => 'OB',
                'params' => [
                    ['name' => 'Excavation Date', 'column_name' => 'excavation_date'],
                    ['name' => 'Catalog Date', 'column_name' => 'catalog_date'],
                    ['name' => 'Year', 'column_name' => 'id_year'],
                    ['name' => 'Object Number', 'column_name' => 'id_object_no'],
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
                'Whole'
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
