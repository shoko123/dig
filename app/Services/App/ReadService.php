<?php

namespace App\Services\App;

use App\Models\DigModule\DigModuleModel;
use App\Models\Tag\Tag;
use App\Services\App\ModuleSpecific\ReadSpecificServiceInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

abstract class ReadService extends DigModuleService implements ReadSpecificServiceInterface
{
    protected DigModuleModel $model;

    protected Builder $builder;

    protected Model $tagModel;

    public function __construct(string $module)
    {
        parent::__construct($module);
        $tagModelName = get_class($this->model) . 'Tag';
        $this->tagModel = new $tagModelName;
    }

    /////////////// index ///////////////////

    public function index(?array $query): array
    {
        $this->builder = $this->model->select('id');
        if (! is_null($query)) {
            $this->builderIndexApplyFilters($query);
        }

        if (empty($query['order_by'])) {
            $this->applyDefaultOrder();
        } else {
            $this->builderIndexOrder($query['order_by']);
        }

        $collection = $this->builder->get();

        return $collection->map(function ($item, $key) {
            return $item->id;
        })->toArray();
    }

    public function builderIndexApplyFilters($query)
    {
        if (! empty($query['model_tag_ids'])) {
            $this->applyModelTagFilters($query['model_tag_ids']);
        }

        if (! empty($query['global_tag_ids'])) {
            $this->applyGlobalTagFilters($query['global_tag_ids']);
        }

        if (! empty($query['field_value'])) {
            $this->applyFieldValueFilters($query['field_value']);
        }

        if (! empty($query['field_search'])) {
            $this->applyFieldSearchFilters($query['field_search']);
        }

        if (! empty($query['media'])) {
            $this->applyMediaFilter($query['media']);
        }
    }

    public function applyFieldValueFilters(array $cols)
    {
        foreach ($cols as $key => $col) {
            if ($col['source'] === 'Categorized') {
                $this->applyCategorizedFilter($col);
            } else {
                $this->builder->whereIn($col['field_name'], $col['vals']);
            }
        }
    }

    public function applyModelTagFilters(array $tag_ids)
    {
        $groups = [];
        $tags = $this->tagModel->select('id', 'group_id')->whereIn('id', $tag_ids)->get();

        foreach ($tags as $tag) {
            if (array_key_exists($tag->group_id, $groups)) {
                array_push($groups[$tag->group_id], $tag->id);
            } else {
                $groups[$tag->group_id] = [$tag->id];
            }
        }

        foreach ($groups as $type_id => $tag_ids_for_group) {
            $this->builder->whereHas('model_tags', function (Builder $q) use ($tag_ids_for_group) {
                $q->whereIn('id', $tag_ids_for_group);
            });
        }
    }

    public function applyGlobalTagFilters(array $tag_ids)
    {
        $tags = Tag::select('id', 'group_id')->whereIn('id', $tag_ids)->get();
        $groups = [];

        foreach ($tags as $tag) {
            if (array_key_exists($tag->group_id, $groups)) {
                array_push($groups[$tag->group_id], $tag->id);
            } else {
                $groups[$tag->group_id] = [$tag->id];
            }
        }

        foreach ($groups as $type_id => $tag_ids_for_group) {
            $this->builder->whereHas('global_tags', function (Builder $q) use ($tag_ids_for_group) {
                $q->whereIn('id', $tag_ids_for_group);
            });
        }
    }

    public function applyFieldSearchFilters(array $cols)
    {
        foreach ($cols as $key => $col) {
            $this->builder->Where(function ($query) use ($col) {
                foreach ($col['vals'] as $key1 => $term) {
                    $query->orWhere($col['field_name'], 'LIKE', '%' . $term . '%');
                }
            });
        }
    }

    public function applyMediaFilter(array $collectionNames)
    {
        $this->builder->whereHas('media', function (Builder $mediaQuery) use ($collectionNames) {
            $mediaQuery->whereIn('collection_name', $collectionNames);
        });
    }

    public function builderIndexOrder(array $order_by)
    {
        foreach ($order_by as $key => $data) {
            $this->builder->orderBy($data['field_name'], $data['asc'] ? 'asc' : 'desc');
        }
    }

    ///////////////// page //////////////////////

    public function page(array $ids, string $view): array
    {
        switch ($view) {
            case 'Tabular':
                $this->builder = $this->model->select($this->fieldsForTabularPage());
                break;

            case 'Gallery':
                $this->builder = $this->model->select($this->fieldsForGalleryPage())
                    ->with(['media' => function ($query) {
                        $query->orderBy('order_column')->limit(1);
                    }]);
                break;
        }
        $this->builder = $this->builder->whereIn('id', $ids);

        //order by given (string) ids
        $sortedIds = "'" . implode("', '", $ids) . "'";

        $res = $this->builder->orderByRaw("FIELD(id, {$sortedIds})")
            ->get();

        //dump("res: " . $res);

        switch ($view) {
            case 'Tabular':
                return $res->toArray();

            case 'Gallery':
                return $res->map(function ($item, $key) {
                    return [
                        'id' => $item['id'],
                        'short' => $item['short'],
                        'urls' => $item->media->isEmpty() ? null :
                            MediaService::format_media_item($item->media[0])['urls'],
                    ];
                })->toArray();
        }
    }

    ////////////// show //////////////////

    public function show_carousel(string $module, string $id): array
    {
        $mediaCollection = MediaService::media_by_module_and_id($module, $id);

        $model = static::makeModel($module);
        $item = $model->findOrfail($id);

        return [
            'id' => $item['id'],
            'short' => $item['short'],
            'urls' => count($item->media) === 0 ? null : $mediaCollection[0]['urls'],
            'module' => $module,
        ];
    }

    public function show(string $id): array
    {
        $this->applyShowLoad();
        $item = $this->builder->findOrFail($id);
        $extra = $this->extraDetails($item);

        return $this->formatShowResponse($item, $extra);
    }

    protected function applyShowLoad(): void
    {
        $this->builder = $this->model->with([
            'media' => function ($query) {
                $query->orderBy('order_column');
            },
            'model_tags.tag_group',
            'global_tags.tag_group',
        ]);
    }

    protected function extraDetails(): array
    {
        return [];
    }

    protected function formatShowResponse(object $item, array $extra): array
    {
        $mediaArray = MediaService::format_media_collection($item->media);

        //model tags (discrete)
        $model_tags = isset($item['model_tags']) ? $item->model_tags->map(function ($tag, int $key) {
            return ['group_label' => $tag->tag_group->name, 'tag_text' => $tag->name];
        }) : [];

        //global tags
        $global_tags = isset($item['global_tags']) ? $item->global_tags->map(function ($tag, int $key) {
            return ['group_label' => $tag->tag_group->name, 'tag_text' => $tag->name];
        }) : [];

        return [
            'fields' => $item->makeHidden(['short', 'media', 'model_tags', 'global_tags']),
            'media' => $mediaArray,
            'global_tags' => $global_tags,
            'model_tags' => $model_tags,
            'short' => $item->short,
            // 'derived_id' => $item->derivedId,
            'related' => [
                ['relation_name' => 'relation1',  'module' => 'Stone', 'id' => 'B2009.1.1', 'short' => 'Some description1'],
                [
                    'relation_name' => 'relation2',
                    'module' => 'Stone',
                    'id' => 'B2009.1.7',
                    'short' => 'Some description2',
                    'urls' => [
                        "full" =>  "db/00023/About_Background.jpg",
                        "tn" => "db/00023/conversions/About_Background-tn.jpg"
                    ]
                ],
                ['relation_name' => 'relation3',  'module' => 'Stone', 'id' => 'B2009.1.22', 'short' => 'Some description3'],
                ['relation_name' => 'My Locus',  'module' => 'Locus', 'id' => 'Bin.366.0', 'short' => 'Some description3'],
            ]
        ];
    }
}
