<?php

namespace App\Services\Implementation;

use \Exception;
use Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use App\Services\Interfaces\MediaServiceInterface;
use App\Services\Implementation\BaseService;


class MediaService extends BaseService implements MediaServiceInterface
{
    public static function collection_names()
    {
        $ordered = collect(['Photo', 'Drawing', 'Photo and Drawing', 'Plan', 'Misc']);
        $names = Media::distinct('collection_name')->get();

        //sanity checks
        $res = $names->first(function (string $value, int $key) use ($ordered) {
            return !$ordered->has($value);
        });

        throw_if($res, "MediaService.collection_names(): Collection name \"" . $res . "\" doesn't exist in the the ordered collection names");

        return $ordered;
    }

    //TODO change name to media_record
    public static function carousel(string $source, array $params)
    {
        switch ($params) {
            case "Media":
                $media = Media::findOrFail($params["id"]);

                return [

                    //TODO 'media' => static::format_media_item($media)
                    'id' => $params["id"],
                    'urls' => [
                        'full' => $media->getPath(),
                        'tn' => $media->getPath('tn'),
                    ],
                    'size' => $media->size,
                    'collection_name' => $media->collection_name,
                    'file_name' => $media->file_name,
                    'order_column' => $media->order_column,
                ];
            case "DigModuleItem":
                $media = static::media_by_model_type_and_id($params["module_type"], $params["module_id"]);
                $full_class = 'App\Models\DigModule\Specific\\' . $params["module_id"] . '\\' . $params["module_id"];
                $model = new $full_class;
                $item = $model::findOrfail($media->model_id);

                return [
                    'id' => $item["id"],
                    'short' => $item['short'],
                    'urls' => count($item->media) === 0 ? null : MediaService::format_media_item($media),
                    'module' => class_basename($model),
                ];
        }
    }
    public function upload(array $params): array
    {
        $model = static::makeModel($params["module"]);
        try {
            $item = $model->findOrFail($params['model_id']);

            //attach media to item
            foreach ($params['media_files'] as $key => $media_file) {
                //$meta = exif_read_data($media_file);
                $item
                    ->addMedia($media_file)
                    ->toMediaCollection($params['media_collection_name']);
            }

            // return updated media for item
            $mediaCollection = static::media_by_model_type_and_id($params['module_type'], $params['model_id']);
            return static::format_media_collection($mediaCollection);
        } catch (Exception $error) {
            throw new Exception('Failed to upload media. error: ' . $error);
        }
    }

    public static function destroy(array $params): array
    {
        //Get media record by media_id
        $mediaToDelete = Media::findOrFail($params['media_id']);

        //verify that this media record matches item sent (by model_type and model_id)
        if (($mediaToDelete['model_type'] !== $params['model']) || $mediaToDelete['model_id'] !== $params['model_id']) {
            throw new Exception('Media/Model mismatch abort destroy');
        }

        //delete
        $mediaToDelete->delete();

        //return updated media for item
        $mediaCollection = static::media_by_model_type_and_id($params['module_type'], $params['model_id']);
        return static::format_media_collection($mediaCollection);
    }

    public static function reorder(array $params): array
    {
        foreach ($params['ordered'] as $possible) {
            $record = Media::findOrFail($possible['id']);
            if ($record['order_column'] !== $possible['order']) {
                $record['order_column'] = $possible['order'];
                $record->save();
            }
        }

        //return updated media for item
        $mediaCollection = static::media_by_model_type_and_id($params['module_type'], $params['model_id']);
        return static::format_media_collection($mediaCollection);
    }

    public static function edit(array $params): array
    {
        return [];
    }

    public static function media_by_model_type_and_id(string $model_type, string $model_id)
    {
        return Media::where('model_id', '=', $model_id)->where('model_type', '=', $model_type)->orderBy('order_column', 'asc')->findOrFail();

        //return static::format_media_collection($mc);
    }

    public static function format_media_collection(MediaCollection $media_records): array
    {
        $mapped = collect($media_records)->map(function ($rec, $key) {
            return static::format_media_item($rec);
        });

        return $mapped->toArray();
    }

    public static function format_media_item(Media $record): array
    {
        return ['id' => $record['id'], 'urls' => ['full' => $record->getPath(), 'tn' => $record->getPath('tn')], 'order_column' => $record['order_column']];
    }
}
