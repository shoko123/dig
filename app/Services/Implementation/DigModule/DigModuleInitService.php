<?php

namespace App\Services\Implementation\DigModule;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Exception;
use Spatie\MediaLibrary\MediaCollections\Models\Media;


use App\Services\Interfaces\DigModuleInitSpecificServiceInterface;
use App\Models\Tag\TagGroup;

abstract class DigModuleInitService extends DigModuleService implements DigModuleInitSpecificServiceInterface
{
    protected Model $moduleTagGroup;

    function __construct(string $module)
    {
        parent::__construct($module);
        $tagGroupName = 'App\Models\DigModule\Specific\\' . $module . '\\' . $module . 'TagGroup';
        $this->moduleTagGroup = new $tagGroupName;
    }

    public function init(): array
    {
        return [
            "welcome_text" => static::welcomeText(),
            "counts" => [
                "items" => $this->model->count(),
                "media" => Media::where('model_type', class_basename($this->model))->count()
            ],
            "display_options" => static::displayOptions(),
            "date_columns" => static::dateColumns(),
            "first_id" => $this->model->select('id')->firstOrFail()["id"],
            "trio" => $this->trio(),
        ];
    }

    protected function allGroups(): array
    {
        return  array_merge(self::$globalGroups, static::modelGroups());
    }

    public function trio(): array
    {
        $trio = [];

        foreach (static::categories() as $name => $group_names) {
            $category = ['name' => $name, 'groups' => []];
            foreach ($group_names as $group_name) {
                array_push($category['groups'], $this->getGroupDetails($group_name));
            }
            array_push($trio, $category);
        }
        return $trio;
    }

    public function getGroupDetails($group_name): array
    {
        $group = $this->allGroups()[$group_name] ?? null;
        throw_if(is_null($group), new Exception('***MODEL INIT() ERROR*** Group * ' . $group_name . ' * NOT FOUND'));

        switch ($group['group_type_code']) {
            case 'TG': //tags global
                return $this->getGlobalTagsGroupDetails($group_name, $group);

            case 'TM': //tags model
                return $this->getModelTagsGroupDetails($group_name, $group);

            case 'CV': //column values
            case 'CR': //column value to be used only for filtering
                return $this->getColumnGroupDetails($group_name, $group);

            case 'CB': //column boolean
                return $this->getColumnBooleanDetails($group_name, $group);

            case 'CL': //column lookup values
                return $this->getLookupGroupDetails($group_name, $group);

            case 'CS': //column search
                return $this->getTextualSearchGroupDetails($group_name, $group);

            case 'BF': //bespoke
                return $this->getBespokeFilterGroupDetails($group_name, $group);

            case 'OB': //order by values
                return $this->getOrderByDetails($group_name, $group);
            case 'MD': //media
                return array_merge($group, [
                    'group_name' => $group_name,
                    'params' => null,
                ]);
        }

        return [];
    }

    private function getLookupGroupDetails($group_name, $group)
    {
        $params = DB::table($group['table_name'])->get();

        return array_merge($group, [
            'group_name' => $group_name,
            'params' => $params,
        ]);
    }

    private function getModelTagsGroupDetails($group_name, $group)
    {
        $tg = $this->moduleTagGroup->with(['tags' => function ($q) {
            $q->select('id', 'name', 'group_id');
        }])
            ->select('id', 'multiple')
            ->where('name', $group_name)
            ->first();

        throw_if(is_null($tg), new Exception('***MODEL INIT() ERROR*** Group * ' . $group_name . ' * NOT FOUND'));

        return array_merge($group, [
            'group_name' => $group_name,
            'group_id' => $tg->id,
            'multiple' => $tg->multiple,
            'params' => $tg->tags->map(function ($y) {
                return [
                    'id' => $y->id,
                    'name' => $y->name
                ];
            }),
        ]);
    }

    private function getGlobalTagsGroupDetails($group_name, $group)
    {
        $gtg = TagGroup::with(['tags' => function ($q) {
            $q->select('id', 'name', 'group_id');
        }])
            ->select('id', 'name')
            ->where('name', $group_name)
            ->first();

        return array_merge($group, [
            'group_name' => $group_name,
            'group_id' => $gtg->id,
            'multiple' => true,
            'params' => $gtg->tags->map(function ($y) {
                return ['id' => $y->id, 'name' => $y->name];
            }),
        ]);
    }

    private function getColumnGroupDetails($group_name, $group)
    {
        $column_name = $group['column_name'];
        $params = DB::table($group['table_name'])->select($column_name)->distinct()->orderBy($column_name)->get();

        return array_merge($group, [
            'group_name' => $group_name,
            //"params"  => $params
            'params' => $params->map(function ($y, $key) use ($column_name) {
                return $y->$column_name;
            }),
        ]);
    }

    private function getColumnBooleanDetails($group_name, $group)
    {
        return array_merge($group, [
            'group_name' => $group_name,
        ]);
    }

    private function getTextualSearchGroupDetails($group_name, $group)
    {
        $group = $this->modelGroups($group_name)[$group_name] ?? null;
        throw_if(is_null($group), new Exception('***MODEL INIT() ERROR*** Group * ' . $group_name . ' * NOT FOUND'));

        return [
            'group_type_code' => 'CS',
            'group_name' => $group_name,
            'column_name' => $group['column_name'],
            'params' => null,
        ];
    }

    private function getBespokeFilterGroupDetails($group_name, $group)
    {
        $paramsFormatted = collect($group['params'])->map(function ($y, $key) {
            return ['id' => $key, 'name' => $y];
        });
        $group['params'] = $paramsFormatted;
        $group['group_name'] = $group_name;
        return $group;
    }

    private function getOrderByDetails($group_name, $group)
    {
        return array_merge($group, [
            'group_name' => $group_name,
        ]);
    }

    protected static $globalGroups =  [
        'Media' => [
            'group_type_code' => 'MD',
        ],
        'Periods (Top-Level)' => [
            'group_type_code' => 'TG',
            'dependency' => null,
        ],
        'Neolithic Subperiods' => [
            'group_type_code' => 'TG',
            'dependency' => ['Periods (Top-Level).Neolithic'],
        ],
        'Bronze Subperiods' => [
            'group_type_code' => 'TG',
            'dependency' => ['Periods (Top-Level).Bronze'],
        ],
        'Iron Subperiods' => [
            'group_type_code' => 'TG',
            'dependency' => ['Periods (Top-Level).Iron'],
        ],
        'Hellenistic Subperiods' => [
            'group_type_code' => 'TG',
            'dependency' => ['Periods (Top-Level).Hellenistic'],
        ],
        'Roman Subperiods' => [
            'group_type_code' => 'TG',
            'dependency' => ['Periods (Top-Level).Roman'],
        ],
        'Early-Islamic Subperiods' => [
            'group_type_code' => 'TG',
            'dependency' => ['Periods (Top-Level).Early Islamic'],
        ],
        'Medieval Subperiods' => [
            'group_type_code' => 'TG',
            'dependency' => ['Periods (Top-Level).Medieval'],
        ],
        'Modern Subperiods' => [
            'group_type_code' => 'TG',
            'dependency' => ['Periods (Top-Level).Modern'],
        ],
    ];
}
