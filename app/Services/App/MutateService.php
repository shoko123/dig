<?php

namespace App\Services\App;

use App\Exceptions\GeneralJsonException;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class MutateService extends DigModuleService
{
    public function __construct(string $module)
    {
        parent::__construct($module);
    }

    public function create(array $fields): array
    {
        return $this->save($fields);
    }

    public function update(array $fields): array
    {
        $this->model = $this->model->findOrFail($fields['id']);

        return $this->save($fields);
    }

    protected function save(array $fields): array
    {
        //copy the validated data from the validated array to the 'item' object.
        //If JSON field is a "date", use Carbon to format to mysql Date field.

        foreach ($fields as $key => $value) {
            //very awkward way to construct dates by checking whether field name contains '_date'
            //Note: the date format is already validated at the formRequest.
            if (str_contains($key, '_date') /* && strtotime($value) !== false */) {
                $this->model[$key] = Carbon::parse($value)->format('Y-m-d');
            } else {
                $this->model[$key] = $value;
            }
        }

        if ($this->model->derivedId !== $this->model->id) {
            throw new GeneralJsonException('Unable to save d/t inconsistency between id: "' . $this->model->id . '" and derived id: ' . $this->model->derivedId, 422);
        }
        try {
            $this->model->save();
        } catch (Exception $e) {
            throw new GeneralJsonException($e->getMessage() . $e->getCode());
        }

        return [
            'fields' => $this->model,
        ];
    }

    public function destroy(string $module, string $id): array
    {
        //get item with tags
        $model = static::makeModel($module);

        $item = $this->model->with(['model_tags', 'global_tags'])->findOrFail($id);
        DB::transaction(function () use ($item) {
            $item->model_tags()->detach();
            $item->global_tags()->detach();
            $item->delete();
        });

        unset($item->model_tags);
        unset($item->global_tags);

        return ["deleted_id" => $item->id];
    }
}
