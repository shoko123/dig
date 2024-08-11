<?php

namespace App\Models\DigModule\Specific\Locus;

use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Models\DigModule\DigModuleModel;
use App\Models\Tag\Tag;

class Locus extends DigModuleModel
{
    protected $table = 'loci';

    public function model_tags()
    {
        return $this->belongsToMany(LocusTag::class, 'locus-locus_tags', 'item_id', 'tag_id');
    }

    public function global_tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function dateColumns(): array
    {
        return [];
    }

    protected function derivedId(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value, array $attributes) =>
            $attributes['category'] . '.' . $attributes['a'] . '.' . $attributes['b']
        );
    }

    protected function short(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value, array $attributes) =>
            $attributes['oc_label']
        );
    }
}
