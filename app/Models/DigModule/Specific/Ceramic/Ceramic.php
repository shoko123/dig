<?php

namespace App\Models\DigModule\Specific\Ceramic;

use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Models\DigModule\DigModuleModel;
use App\Models\Tag\Tag;

class Ceramic extends DigModuleModel
{
    protected $table = 'ceramics';

    public function model_tags()
    {
        return $this->belongsToMany(CeramicTag::class, 'ceramic-ceramic_tags', 'item_id', 'tag_id');
    }

    public function global_tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    protected function derivedId(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value, array $attributes) =>
            $attributes['id_year'] . '.' . $attributes['id_aobject']
        );
    }

    protected function short(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value, array $attributes) =>
            $attributes['specialist_description']  ?? '[No description]'
        );
    }
}
