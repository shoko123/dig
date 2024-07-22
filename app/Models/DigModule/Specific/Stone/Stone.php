<?php

namespace App\Models\DigModule\Specific\Stone;

use App\Models\DigModule\DigModuleModel;
use App\Models\Tag\Tag;

class Stone extends DigModuleModel
{
    //protected $table = 'stones';

    public function getShortAttribute()
    {
        return $this->cataloger_description ?? '[No description]';
    }

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
}
