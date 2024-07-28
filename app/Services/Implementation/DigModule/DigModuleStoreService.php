<?php

namespace App\Services\Implementation\DigModule;

use Illuminate\Support\Carbon;
use \Exception;

class DigModuleStoreService  extends DigModuleService
{
    public function __construct(string $module)
    {
        parent::__construct($module);
    }

    public  function create(array $fields): array
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
            if (str_contains($key, "_date") && strtotime($value) !== false) {
                $this->model[$key] = Carbon::parse($value)->format('Y-m-d');
            } else {
                $this->model[$key] = $value;
            }
        }

        try {
            $this->model->save();
        } catch (Exception $error) {
            throw new Exception('Error while saving item to DB: ' . $error);
        }

        return [
            'fields' => $this->model->makeHidden(['short']),
            'short' => $this->model->short,
        ];
    }
}
