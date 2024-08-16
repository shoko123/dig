<?php

namespace App\Services\MediaLibrary;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\PathGenerator;

//pad with zeros
class CustomPathGenerator implements PathGenerator
{
    public function getPath(Media $media): string
    {
        return 'db/'.str($media->id)->padLeft(5, '0').'/';
    }

    public function getPathForConversions(Media $media): string
    {
        return 'db/'.str($media->id)->padLeft(5, '0').'/conversions/';
    }

    public function getPathForResponsiveImages(Media $media): string
    {
        return 'db/'.str($media->id)->padLeft(5, '0').'/responsive/';
    }
}
