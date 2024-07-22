<?php

namespace App\Services\Implementation\DigModule;

use Illuminate\Support\Carbon;
use \Exception;

use App\Services\Interfaces\DigModuleStoreServiceInterface;

abstract class DigModuleStoreService extends DigModuleService implements DigModuleStoreServiceInterface
{
    function __construct(string $module)
    {
        parent::__construct($module);
    }

    public function store(array $new_item, bool $methodIsPost): array
    {
        if (!$methodIsPost) {
            $this->model->findOrFail($new_item['id']);
        }

        //copy the validated data from the validated array to the 'item' object.
        //If JSON field is a "date", use Carbon to format to mysql Date field.
        foreach ($new_item as $key => $value) {
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

        if ($methodIsPost) {
            return [
                'fields' => $this->model->makeHidden(['short']),
                'media' => [],
                'global_tags' => [],
                'model_tags' => [],
                'short' => $this->model->short,
            ];
        } else {
            return [
                'fields' => $this->model->makeHidden(['short']),
                'short' => $this->model->short,
            ];
        }
    }
}
