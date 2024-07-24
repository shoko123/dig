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

        //verify that the table is not corrupted by some unwelcomed collection_name
        if (Media::count() > 0) {
            $names = Media::distinct('collection_name')->get();

            $res = $names->first(function (string $value, int $key) use ($ordered) {
                return !$ordered->has($value);
            });

            throw_unless($res, "MediaService.collection_names(): Collection name \"" . $res . "\" doesn't exist in the the ordered collection names");
        }
        return $ordered;
    }

    public static function carousel(string $source, array $params)
    {
        switch ($params) {
            case "media":
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
            case "main":
            case "related":
                $mediaCollection = static::media_by_module_and_id($params["module"], $params["id"]);

                $model = static::makeModel($params["module"]);
                $item = $model::findOrfail($mediaCollection->model_id);

                return [
                    'id' => $item["id"],
                    'short' => $item['short'],
                    'urls' => count($item->media) === 0 ? null : MediaService::format_media_item($mediaCollection[0]),
                    'module' => class_basename($model),
                ];
        }
    }

    public function upload(array $params): array
    {
        $model = static::makeModel($params["module"]);
        try {
            $item = $model->findOrFail($params['id']);

            //attach media to item
            foreach ($params['media_files'] as $key => $media_file) {
                //$meta = exif_read_data($media_file);
                $item
                    ->addMedia($media_file)
                    ->toMediaCollection($params['media_collection_name']);
            }
            return static::format_media_collection($item->getMedia("*"));
        } catch (Exception $error) {
            throw new Exception('Failed to upload media. error: ' . $error);
        }
    }

    public static function destroy(array $params): array
    {
        //Get media record by media_id
        $mediaToDelete = Media::findOrFail($params['media_id']);

        //verify that this media record matches item sent (by model_type and model_id)
        if (($mediaToDelete['model_type'] !== $params['module']) || $mediaToDelete['model_id'] !== $params['module_id']) {
            throw new Exception('Media/Model mismatch abort destroy');
        }

        //delete
        $mediaToDelete->delete();

        //return updated media for item
        $mediaCollection = static::media_by_module_and_id($params['module'], $params['module_id']);
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
        $mediaCollection = static::media_by_module_and_id($params['module'], $params['id']);
        return static::format_media_collection($mediaCollection);
    }

    public static function edit(array $params): array
    {
        return [];
    }

    public static function media_by_module_and_id(string $module, string $id): MediaCollection
    {
        $model = static::makeModel($module);
        $item = $model->findOrFail($id);
        return $item->getMedia("*");
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
