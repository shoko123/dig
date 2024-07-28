<?php

namespace App\Services\App;

use Illuminate\Support\Facades\DB;
use App\Services\App\BaseService;

class TagService extends BaseService
{
    public static function sync(string $module, string $id, array $module_tag_ids, array $global_tag_ids, array $columns): void

    // public static function sync(string $module, string $id, array $new_tags): void
    {
        //get item with tags        
        $model = static::makeModel($module);
        $item = $model->with([
            'model_tags' => function ($query) {
                $query->select('id');
            },
            'global_tags' => function ($query) {
                $query->select('id');
            },
        ])->findOrFail($id);

        //model_tags
        //----------
        //transform 'current' and 'new' to a standard 'Collection'
        $new_model_ids = collect($module_tag_ids);
        $current_model_ids = collect($item->model_tags->map(function (object $item, int $key) {
            return $item['id'];
        }));

        //find required changes
        $attach_model_ids = $new_model_ids->diff($current_model_ids)->values()->all();
        $detach_model_ids = $current_model_ids->diff($new_model_ids)->values()->all();

        //global_tags
        //-----------
        $new_global_ids = collect($global_tag_ids);
        $current_global_ids = collect($item->global_tags->map(function (object $item, int $key) {
            return $item['id'];
        }));

        //find required changes
        $attach_global_ids = $new_global_ids->diff($current_global_ids)->values()->all();
        $detach_global_ids = $current_global_ids->diff($new_global_ids)->values()->all();

        //update column values
        if (isset($columns)) {
            foreach ($columns as $col) {
                $item[$col['column_name']] = $col['val'];
            }
        }

        //save changes
        //------------
        DB::transaction(function () use ($item, $detach_model_ids, $attach_model_ids, $attach_global_ids, $detach_global_ids) {
            $item->save();
            $item->model_tags()->detach($detach_model_ids);
            $item->model_tags()->attach($attach_model_ids);
            $item->global_tags()->detach($detach_global_ids);
            $item->global_tags()->attach($attach_global_ids);
        });
    }
}
