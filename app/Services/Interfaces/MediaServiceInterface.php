<?php

namespace App\Services\Interfaces;

use Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

interface MediaServiceInterface
{
    /**
     * Retrieve data to init a specific DigModule.
     */
    public static function collection_names();

    public static function show_carousel(string $media_id);

    public static function upload(string $module, string $id, array $media_files, string $collection_name): array;

    public static function destroy(string $media_id, string $module, string $module_id): array;

    public static function reorder(string $module, string $module_id, array $ordered_media_ids): array;

    public static function edit(array $params): array;

    /**
     * Retrieve all media related to given item, result is ordered and formatted.
     */
    public static function media_by_module_and_id(string $model_type, string $model_id);


    public static function format_media_collection(MediaCollection $media_records): array;

    public static function format_media_item(Media $record): array;
}
