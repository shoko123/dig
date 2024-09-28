<?php

namespace App\Models\DigModule\Specific\Ceramic;

use App\Models\DigModule\DigModuleModel;
use App\Models\Tag\Tag;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Ceramic extends DigModuleModel
{
    protected $table = 'ceramics';

    static protected function specificRestrictedFields(): array
    {
        return [
            'id_year' => [20, 21, 22, 23, 24],
            'id_object_no' => [1, 2, 3, 4, 5, 6, 7, 8, 9],
        ];
    }

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
            get: fn(mixed $value, array $attributes) => $attributes['id_year'] . '.' . $attributes['id_object_no']
        );
    }

    protected function short(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value, array $attributes) => $attributes['specialist_description'] ?? '[No description]'
        );
    }
}
