<?php

namespace App\Models\DigModule\Specific\Locus;

use App\Models\DigModule\DigModuleModel;
use App\Models\Tag\Tag;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Locus extends DigModuleModel
{
    protected $table = 'loci';

    static protected function specificRestrictedFields(): array
    {
        return ['category' => [
            'Bin',
            'Cave',
            'Cave-Tomb',
            'Cistern',
            'Dump',
            'Multiple',
            'Pit-J',
            'Pit-Q',
            'Room',
            'Silo',
            'Tomb',
            'Trench',
            'Unclear',
            'Unknown',
        ]];
    }

    public function model_tags()
    {
        return $this->belongsToMany(LocusTag::class, 'locus-locus_tags', 'item_id', 'tag_id');
    }

    public function global_tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    protected function derivedId(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value, array $attributes) => $attributes['category'] . '.' . $attributes['a'] . '.' . $attributes['b']
        );
    }

    protected function short(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value, array $attributes) => $attributes['oc_label']
        );
    }
}
