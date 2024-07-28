<?php

namespace App\Models\DigModule;

use Exception;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

abstract class DigModuleModel extends Model implements HasMedia
{
    use InteractsWithMedia;

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];
    protected $date_columns = [];

    public abstract function dateColumns(): array;

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('tn')
            ->width(250)
            ->height(250)
            ->sharpen(10)
            ->nonQueued();
    }
}
