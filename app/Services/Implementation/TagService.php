<?php

namespace App\Services\Implementation;

use Illuminate\Support\Facades\DB;
use App\Services\Interfaces\TagServiceInterface;
use App\Services\Implementation\BaseService;

class TagService extends BaseService implements TagServiceInterface
{
    public function sync(string $module, string $id, array $new_tags): void
    {
        $model = $this->makeModel($module);
        //get item with tags
        $item = $model->with([
            'model_tags' => function ($query) {
                $query->select('id');
            },
            'global_tags' => function ($query) {
                $query->select('id');
            },
        ])->findOrFail($id);

        //model_tags
        //**********/
        //transform 'current' and 'new' to a standard 'Collection'
        $new_model_ids = isset($new_tags['model_tag_ids']) ? collect($new_tags['model_tag_ids']) : collect([]);
        $current_model_ids = collect($item->model_tags->map(function (object $item, int $key) {
            return $item['id'];
        }));

        //find required changes
        $attach_model_ids = $new_model_ids->diff($current_model_ids)->values()->all();
        $detach_model_ids = $current_model_ids->diff($new_model_ids)->values()->all();

        //global_tags
        //***********/
        $new_global_ids = isset($new_tags['ids']) ? collect($new_tags['ids']) : collect([]);
        $current_global_ids = collect($item->global_tags->map(function (object $item, int $key) {
            return $item['id'];
        }));

        //find required changes
        $attach_global_ids = $new_global_ids->diff($current_global_ids)->values()->all();
        $detach_global_ids = $current_global_ids->diff($new_global_ids)->values()->all();

        //update column values
        if (isset($new_tags['columns'])) {
            foreach ($new_tags['columns'] as $col) {
                $item[$col['column_name']] = $col['val'];
            }
        }

        //save changes
        /*************/
        DB::transaction(function () use ($item, $detach_model_ids, $attach_model_ids, $attach_global_ids, $detach_global_ids) {
            $item->save();
            $item->model_tags()->detach($detach_model_ids);
            $item->model_tags()->attach($attach_model_ids);
            $item->global_tags()->detach($detach_global_ids);
            $item->global_tags()->attach($attach_global_ids);
        });
    }
}
