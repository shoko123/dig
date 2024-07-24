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

    public static function show_carousel(string $media_id)
    {
        $media = Media::findOrFail($media_id);

        return array_merge(
            MediaService::format_media_item($media),
            [
                'size' => $media->size,
                'collection_name' => $media->collection_name,
                'file_name' => $media->file_name,
            ]
        );
    }

    public static function upload(string $module, string $id, array $media_files, string $media_collection_name): array
    {
        $model = static::makeModel($module);
        try {
            $item = $model->findOrFail($id);

            //attach media to item
            foreach ($media_files as $key => $media_file) {
                //$meta = exif_read_data($media_file);
                $item
                    ->addMedia($media_file)
                    ->toMediaCollection($media_collection_name);
            }
            return static::media_by_module_and_id($module, $id);
        } catch (Exception $error) {
            throw new Exception('Failed to upload media. error: ' . $error);
        }
    }

    public static function destroy(string $media_id, string $module, string $module_id): array
    {
        //Get media record by media_id
        $mediaToDelete = Media::findOrFail($media_id);

        //verify that this media record matches item sent (by model_type and model_id)
        if (($mediaToDelete['model_type'] !== $module) || $mediaToDelete['model_id'] !== $module_id) {
            throw new Exception('Media/Model mismatch abort destroy');
        }

        //delete
        $mediaToDelete->delete();

        //return updated media for item
        return static::media_by_module_and_id($module, $module_id);
    }

    public static function reorder(string $module, string $module_id, array $ordered_media_ids): array
    {
        foreach ($ordered_media_ids as $possible) {
            $record = Media::findOrFail($possible['id']);
            if ($record['order_column'] !== $possible['order']) {
                $record['order_column'] = $possible['order'];
                $record->save();
            }
        }

        //return updated media for item
        return static::media_by_module_and_id($module, $module_id);
    }

    public static function edit(array $params): array
    {
        return [];
    }

    public static function media_by_module_and_id(string $module, string $id): array
    {
        $model = static::makeModel($module);
        $item = $model->with(['media' => function ($query) {
            $query->orderBy('order_column');
        }])->findOrFail($id);
        return static::format_media_collection($item->media);
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
