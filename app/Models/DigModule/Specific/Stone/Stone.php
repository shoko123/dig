<?php

namespace App\Models\DigModule\Specific\Stone;

use App\Models\DigModule\DigModuleModel;
use App\Models\Tag\Tag;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Stone extends DigModuleModel
{
    //protected $table = 'stones';

    public function model_tags()
    {
        return $this->belongsToMany(StoneTag::class, 'stone-stone_tags', 'item_id', 'tag_id');
    }

    public function global_tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function baseType()
    {
        return $this->belongsTo(StoneBaseType::class, 'base_type_id');
    }

    public function material()
    {
        return $this->belongsTo(StoneMaterial::class, 'material_id');
    }

    public function cataloger()
    {
        return $this->belongsTo(StoneCataloger::class, 'cataloger_id');
    }

    protected function casts(): array
    {
        return [
            'whole' => 'boolean',
        ];
    }

    protected function derivedId(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) => 'B'.(string) $attributes['id_year'] + 2000 .'.'.$attributes['id_access_no'].'.'.$attributes['id_object_no']
        );
    }

    protected function short(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) => $attributes['cataloger_description'] ?? '[No description]'
        );
    }
}
