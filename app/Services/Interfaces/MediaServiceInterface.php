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

    //TODO change name to media_record
    public static function carousel(string $source, array $params);

    public function upload(array $params): array;

    public static function destroy(array $params): array;

    public static function reorder(array $params): array;

    public static function edit(array $params): array;

    public static function media_by_model_type_and_id(string $model_type, string $model_id);

    public static function format_media_collection(MediaCollection $media_records): array;

    public static function format_media_item(Media $record): array;
}
