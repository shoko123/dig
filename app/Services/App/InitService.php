<?php

namespace App\Services\App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use App\Exceptions\GeneralJsonException;
use App\Services\App\ModuleSpecific\InitSpecificServiceInterface;
use App\Models\Tag\TagGroup;

abstract class InitService extends DigModuleService implements InitSpecificServiceInterface
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

        foreach (static::categories() as $name => $labels) {
            $category = ['name' => $name, 'groups' => []];
            foreach ($labels as $label) {
                array_push($category['groups'], $this->getGroupDetails($label));
            }
            array_push($trio, $category);
        }
        return $trio;
    }

    public function getGroupDetails($label): array
    {
        $group = $this->allGroups()[$label] ?? null;
        throw_if(is_null($group), new GeneralJsonException('***MODEL INIT() ERROR*** getGroupDetails() invalid label: ' . $label, 500));

        switch ($group['code']) {
            case 'TG': //global tags
                return $this->getGlobalTagsGroupDetails($label, $group);

            case 'TM': //module tags
                return $this->getModelTagsGroupDetails($label, $group);

            case 'CV': //column values (and its "dependencies")
                return $this->getColumnGroupDetails($label, $group);

            case 'CS': //column search
                return $this->getTextualSearchGroupDetails($label, $group);

            case 'OB': //order by
                return $this->getOrderByDetails($label, $group);

            case 'MD': //media
                return array_merge($group, [
                    'label' => $label,
                    'params' => [],
                ]);

            case 'DP': //dependency group (bespoke filter)
                return $this->getDependencyGroupDetails($label, $group);

            default:
                throw new GeneralJsonException('***MODEL INIT() ERROR*** getGroupDetails() invalid code: ' . $group['code'], 500);
        }

        return [];
    }

    private function getColumnGroupDetails($label, $group)
    {
        switch ($group["text_source"]) {
            case "Column":
                return $this->getCVColumnDetails($label, $group);

            case "Manipulated":
                return $this->getCVManipulatedDetails($label, $group);

            case "Lookup":
                return $this->getCVLookupDetails($label, $group);


            default:
                throw new GeneralJsonException('***MODEL INIT() ERROR*** invalid text_source: ' . $group["text_source"], 500);
        }
    }

    private function getCVColumnDetails($label, $group)
    {
        $column_name = $group['column_name'];
        $params = DB::table($group['table_name'])->select($column_name)->distinct()->orderBy($column_name)->get();

        return array_merge($group, [
            'label' => $label,
            'column_type' => 'integer',
            'params' => $params->map(function ($y, $key) use ($column_name) {
                return ['text' => $y->$column_name, 'extra' => $y->$column_name];
            }),
        ]);
    }

    private function getCVManipulatedDetails($label, $group)
    {
        $column_name = $group['column_name'];
        $res = DB::table($group['table_name'])->select($column_name)->distinct()->orderBy($column_name)->get();

        $params = $group["column_type"] === 'boolean' ? $group["params"] :
            $res->map(function ($y, $key) use ($group, $column_name) {
                return ['text' => $group['manipulator']($y->$column_name), 'extra' => $y->$column_name];
            });
        unset($group["manipulator"]);
        return array_merge($group, [
            'label' => $label,
            'params' => $params,
        ]);
    }

    private function getCVLookupDetails($label, $group)
    {
        $params = DB::table($group['lookup_table_name'])->get();

        return array_merge($group, [
            'label' => $label,
            'params' => $params->map(function ($y, $key) {
                return ['text' => $y->name, 'extra' => $y->id,];
            }),
        ]);
    }

    private function getModelTagsGroupDetails($label, $group)
    {
        $tg = $this->moduleTagGroup->with(['tags' => function ($q) {
            $q->select('id', 'name', 'group_id');
        }])
            ->select('id', 'multiple')
            ->where('name', $label)
            ->first();

        throw_if(is_null($tg), new GeneralJsonException('***MODEL INIT() ERROR*** Group * ' . $label . ' * NOT FOUND', 500));

        return array_merge($group, [
            'label' => $label,
            'group_id' => $tg->id,
            'multiple' => $tg->multiple,
            'params' => $tg->tags->map(function ($y) {
                return [
                    'text' => $y->name,
                    'extra' => $y->id

                ];
            }),
        ]);
    }

    private function getGlobalTagsGroupDetails($label, $group)
    {
        $gtg = TagGroup::with(['tags' => function ($q) {
            $q->select('id', 'name', 'group_id');
        }])
            ->select('id', 'name')
            ->where('name', $label)
            ->first();

        return array_merge($group, [
            'label' => $label,
            'group_id' => $gtg->id,
            'multiple' => true,
            'params' => $gtg->tags->map(function ($y) {
                return [
                    'text' => $y->name,
                    'extra' => $y->id
                ];
            }),
        ]);
    }
    private function getTextualSearchGroupDetails($label, $group)
    {
        $group = $this->modelGroups($label)[$label] ?? null;
        throw_if(is_null($group), new GeneralJsonException('***MODEL INIT() ERROR*** Group * ' . $label . ' * NOT FOUND', 500));

        return [
            'code' => 'CS',
            'label' => $label,
            'column_name' => $group['column_name'],
            'params' => [],
        ];
    }

    private function getDependencyGroupDetails($label, $group)
    {
        $paramsFormatted = collect($group['params'])->map(function ($y, $key) {
            return ['id' => $key, 'name' => $y];
        });
        $group['params'] = $paramsFormatted;
        $group['label'] = $label;
        return $group;
    }

    private function getOrderByDetails($label, $group)
    {
        return array_merge($group, [
            'label' => $label,
        ]);
    }

    protected static $globalGroups =  [
        'Media' => [
            'code' => 'MD',
        ],
        'Periods (Top-Level)' => [
            'code' => 'TG',
            'dependency' => [],
        ],
        'Neolithic Subperiods' => [
            'code' => 'TG',
            'dependency' => ['Periods (Top-Level).Neolithic'],
        ],
        'Bronze Subperiods' => [
            'code' => 'TG',
            'dependency' => ['Periods (Top-Level).Bronze'],
        ],
        'Iron Subperiods' => [
            'code' => 'TG',
            'dependency' => ['Periods (Top-Level).Iron'],
        ],
        'Hellenistic Subperiods' => [
            'code' => 'TG',
            'dependency' => ['Periods (Top-Level).Hellenistic'],
        ],
        'Roman Subperiods' => [
            'code' => 'TG',
            'dependency' => ['Periods (Top-Level).Roman'],
        ],
        'Early-Islamic Subperiods' => [
            'code' => 'TG',
            'dependency' => ['Periods (Top-Level).Early Islamic'],
        ],
        'Medieval Subperiods' => [
            'code' => 'TG',
            'dependency' => ['Periods (Top-Level).Medieval'],
        ],
        'Modern Subperiods' => [
            'code' => 'TG',
            'dependency' => ['Periods (Top-Level).Modern'],
        ],
    ];
}
