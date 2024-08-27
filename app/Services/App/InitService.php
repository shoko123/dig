<?php

namespace App\Services\App;

use App\Exceptions\GeneralJsonException;
use App\Models\Tag\TagGroup;
use App\Services\App\ModuleSpecific\InitSpecificServiceInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

abstract class InitService extends DigModuleService implements InitSpecificServiceInterface
{
    protected Model $moduleTagGroup;

    public function __construct(string $module)
    {
        parent::__construct($module);
        $tagGroupName = 'App\Models\DigModule\Specific\\' . $module . '\\' . $module . 'TagGroup';
        $this->moduleTagGroup = new $tagGroupName;
    }

    public function init(): array
    {
        return [
            'module' => self::$module,
            'welcome_text' => static::welcomeText(),
            'counts' => [
                'items' => $this->model->count(),
                'media' => Media::where('model_type', class_basename($this->model))->count(),
            ],
            'display_options' => static::displayOptions(),
            'first_id' => $this->model->select('id')->firstOrFail()['id'],
            'trio' => $this->trio(),
        ];
    }

    protected function allGroups(): array
    {
        return array_merge(self::$globalGroups, static::modelGroups());
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

            case 'FD': //field values (and its "dependencies")
                return $this->getFieldDependenciesGroupDetails($label, $group);

            case 'FS': //field search
                return $this->getTextualSearchGroupDetails($label, $group);

            case 'OB': //order by
                return $this->getOrderByDetails($label, $group);

            case 'MD': //media
                return array_merge($group, [
                    'label' => $label,
                    'params' => [],
                ]);

            default:
                throw new GeneralJsonException('***MODEL INIT() ERROR*** getGroupDetails() invalid code: ' . $group['code'], 500);
        }
    }

    private function getFieldDependenciesGroupDetails($label, $group)
    {
        switch ($group['tag_source']) {
            case 'Value':
                return $this->getFDValueDetails($label, $group);

            case 'Lookup':
                return $this->getFDLookupDetails($label, $group);

            case 'Categorized':
                return $this->getFDCategorizedDetails($label, $group);

            default:
                throw new GeneralJsonException('***MODEL INIT() ERROR*** invalid tag_source: ' . $group['tag_source'], 500);
        }
    }

    private function getFDValueDetails($label, $group)
    {
        $collection = collect([]);
        if ($group['field_type'] === 'boolean') {
            $collection = collect($group['true_first'] ? [true, false] : [false, true]);
        } else {
            $collection = collect($this->model::allowedValues($group['field_name']));
        }

        $params = $collection->map(function ($y, $key) use ($group) {
            return ['text' => $group['manipulator']($y), 'extra' => $y];
        });

        unset($group['manipulator']);

        return array_merge($group, [
            'collection' => $collection,
            'label' => $label,
            'params' => $params->toArray()
        ]);
    }

    private function getFDLookupDetails($label, $group)
    {
        $params = DB::table($group['lookup_table_name'])->get();

        return array_merge($group, [
            'label' => $label,
            'params' => $params->map(function ($y, $key) {
                return ['text' => $y->name, 'extra' => $y->id];
            }),
        ]);
    }
    private function getFDCategorizedDetails($label, $group)
    {
        $group['label'] = $label;
        $group['params'] = collect($group['params'])->map(function ($y, $key) {
            return ['text' => $key, 'extra' => $y];
        })->values()->toArray();
        return $group;
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
                    'extra' => $y->id,

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
                    'extra' => $y->id,
                ];
            }),
        ]);
    }

    private function getTextualSearchGroupDetails($label, $group)
    {
        $group = $this->modelGroups($label)[$label] ?? null;
        throw_if(is_null($group), new GeneralJsonException('***MODEL INIT() ERROR*** Group * ' . $label . ' * NOT FOUND', 500));

        return [
            'code' => 'FS',
            'label' => $label,
            'field_name' => $group['field_name'],
            'params' => [],
        ];
    }

    // private function getRecordDependentGroupDetails($label, $group)
    // {
    //     $group['label'] = $label;
    //     return $group;
    // }


    private function getOrderByDetails($label, $group)
    {
        $group['label'] = $label;
        return $group;
    }

    protected static $globalGroups = [
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
