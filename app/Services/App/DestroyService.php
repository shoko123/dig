<?php

namespace App\Services\App;

use Illuminate\Support\Facades\DB;
use App\Services\App\BaseService;

class DestroyService extends BaseService
{
    public static function destroy(string $module, string $id): array
    {
        //get item with tags        
        $model = static::makeModel($module);

        $item = $model->with(['model_tags', 'global_tags'])->findOrFail($id);
        DB::transaction(function () use ($item) {
            $item->model_tags()->detach();
            $item->global_tags()->detach();
            $item->delete();
        });

        unset($item->model_tags);
        unset($item->global_tags);

        return $item->toArray();
    }
}
